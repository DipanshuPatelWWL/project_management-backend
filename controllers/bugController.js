const Bug = require("../models/Bug");
const User = require("../models/User");
const { sendNotification } = require("../services/notificationService");

// Generate permanent sequential Bug ID (e.g. BUG001, BUG002)
const generateBugId = async () => {
    const bugs = await Bug.find({
        bugId: { $exists: true, $ne: "" },
    }).select("bugId");

    let highestNumber = 0;

    bugs.forEach((b) => {
        if (b.bugId) {
            const number = parseInt(b.bugId.replace("BUG", ""), 10);
            if (!isNaN(number) && number > highestNumber) {
                highestNumber = number;
            }
        }
    });

    const nextNumber = highestNumber + 1;
    return `BUG${String(nextNumber).padStart(3, "0")}`;
};

// Helper to sanitize empty string ObjectIds
const sanitizeBugData = (data) => {
    const cleaned = { ...data };
    if (!cleaned.project || cleaned.project === "" || cleaned.project === "undefined") cleaned.project = null;
    if (!cleaned.sprint || cleaned.sprint === "" || cleaned.sprint === "undefined") cleaned.sprint = null;
    if (!cleaned.task || cleaned.task === "" || cleaned.task === "undefined") cleaned.task = null;
    if (!cleaned.assignedTo || cleaned.assignedTo === "" || cleaned.assignedTo === "undefined") cleaned.assignedTo = null;
    if (!cleaned.reportedBy || cleaned.reportedBy === "" || cleaned.reportedBy === "undefined") cleaned.reportedBy = null;
    return cleaned;
};

// Create Bug
exports.createBug = async (req, res) => {
    try {
        const sanitized = sanitizeBugData(req.body);
        const {
            bugTitle,
            description,
            project,
            sprint,
            task,
            assignedTo,
            reportedBy,
            severity,
            priority,
            status,
            stepsToReproduce,
            expectedResult,
            actualResult,
        } = sanitized;

        if (!bugTitle) {
            return res.status(400).json({
                success: false,
                message: "Bug Title is required",
            });
        }

        const newAttachments = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        let existingAttachments = [];
        if (req.body.attachments) {
            try {
                existingAttachments = typeof req.body.attachments === "string" ? JSON.parse(req.body.attachments) : req.body.attachments;
                if (!Array.isArray(existingAttachments)) existingAttachments = [existingAttachments];
            } catch (e) {
                existingAttachments = [req.body.attachments];
            }
        }
        const combinedAttachments = [...existingAttachments, ...newAttachments];

        const nextBugId = req.body.bugId || (await generateBugId());

        const bug = await Bug.create({
            bugId: nextBugId,
            bugTitle,
            description,
            project,
            sprint,
            task,
            reportedBy: reportedBy || req.user?._id,
            assignedTo,
            severity: severity || "medium",
            priority: priority || "medium",
            status: status || "open",
            stepsToReproduce,
            expectedResult,
            actualResult,
            attachments: combinedAttachments,
            createdBy: req.user?._id,
            updatedBy: req.user?._id,
        });

        const populatedBug = await Bug.findById(bug._id)
            .populate("project", "projectName")
            .populate("sprint", "sprintName")
            .populate("task", "taskTitle")
            .populate("reportedBy", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email");

        if (assignedTo && req.user?._id) {
            await sendNotification({
                receiver: assignedTo,
                sender: req.user._id,
                title: "New Bug Assigned",
                message: `You have been assigned a new bug: ${bug.bugTitle}`,
                type: "bug",
                project: bug.project,
                entityType: "Bug",
                entityId: bug._id,
            });
        }

        if (req.user?._id && (!assignedTo || assignedTo.toString() !== req.user._id.toString())) {
            await sendNotification({
                receiver: req.user._id,
                sender: req.user._id,
                title: "Bug Reported",
                message: `Bug "${bug.bugTitle}" has been reported successfully.`,
                type: "bug",
                project: bug.project,
                entityType: "Bug",
                entityId: bug._id,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Bug created successfully",
            bug: populatedBug,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create bug",
            error: error.message,
        });
    }
};

// Get Bugs
exports.getBugs = async (req, res) => {
    try {
        const { project, sprint, status, severity, priority, search } = req.query;
        let query = {};

        if (project) query.project = project;
        if (sprint) query.sprint = sprint;
        if (status) query.status = status;
        if (severity) query.severity = severity;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { bugId: { $regex: search, $options: "i" } },
                { bugTitle: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const bugs = await Bug.find(query)
            .populate("project", "projectName")
            .populate("sprint", "sprintName")
            .populate("task", "taskTitle")
            .populate("reportedBy", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email")
            .sort({ createdAt: -1 });

        // Auto backfill bugId for existing bugs if missing
        for (let i = 0; i < bugs.length; i++) {
            if (!bugs[i].bugId) {
                const autoId = `BUG${String(i + 1).padStart(3, "0")}`;
                bugs[i].bugId = autoId;
                Bug.updateOne({ _id: bugs[i]._id }, { bugId: autoId }).exec().catch(() => {});
            }
        }

        const nextBugId = await generateBugId();

        return res.status(200).json({
            success: true,
            count: bugs.length,
            message: "Bugs fetched successfully",
            nextBugId,
            bugs,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bugs",
            error: error.message,
        });
    }
};

// Get Bug By ID
exports.getBugById = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.bugId)
            .populate("project", "projectName")
            .populate("sprint", "sprintName")
            .populate("task", "taskTitle")
            .populate("reportedBy", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email")
            .populate("createdBy", "firstName lastName email");

        if (!bug) {
            return res.status(404).json({
                success: false,
                message: "Bug not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bug fetched successfully",
            bug,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bug",
            error: error.message,
        });
    }
};

// Update Bug
exports.updateBug = async (req, res) => {
    try {
        const sanitized = sanitizeBugData(req.body);
        const {
            bugTitle,
            description,
            project,
            sprint,
            task,
            assignedTo,
            reportedBy,
            severity,
            priority,
            status,
            stepsToReproduce,
            expectedResult,
            actualResult,
        } = sanitized;

        const bug = await Bug.findById(req.params.bugId);

        if (!bug) {
            return res.status(404).json({
                success: false,
                message: "Bug not found",
            });
        }

        if (bugTitle !== undefined) bug.bugTitle = bugTitle;
        if (description !== undefined) bug.description = description;
        if (project !== undefined) bug.project = project;
        if (sprint !== undefined) bug.sprint = sprint;
        if (task !== undefined) bug.task = task;
        if (assignedTo !== undefined) bug.assignedTo = assignedTo;
        if (reportedBy !== undefined) bug.reportedBy = reportedBy;
        if (severity !== undefined) bug.severity = severity;
        if (priority !== undefined) bug.priority = priority;
        if (status !== undefined) {
            bug.status = status;
            if (status === "resolved") {
                bug.resolvedDate = new Date();
            }
        }
        if (stepsToReproduce !== undefined) bug.stepsToReproduce = stepsToReproduce;
        if (expectedResult !== undefined) bug.expectedResult = expectedResult;
        if (actualResult !== undefined) bug.actualResult = actualResult;

        // Handle attachments update
        const newAttachments = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        let existingAttachments = undefined;
        if (req.body.attachments !== undefined) {
            try {
                existingAttachments = typeof req.body.attachments === "string" ? JSON.parse(req.body.attachments) : req.body.attachments;
                if (!Array.isArray(existingAttachments)) existingAttachments = [existingAttachments];
            } catch (e) {
                existingAttachments = [req.body.attachments];
            }
        }
        if (existingAttachments !== undefined || newAttachments.length > 0) {
            bug.attachments = [...(existingAttachments !== undefined ? existingAttachments : (bug.attachments || [])), ...newAttachments];
        }

        bug.updatedBy = req.user?._id;

        await bug.save();

        const updatedBug = await Bug.findById(bug._id)
            .populate("project", "projectName")
            .populate("sprint", "sprintName")
            .populate("task", "taskTitle")
            .populate("reportedBy", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email");

        if (bug.assignedTo && req.user?._id && bug.assignedTo.toString() !== req.user._id.toString()) {
            await sendNotification({
                receiver: bug.assignedTo,
                sender: req.user._id,
                title: "Bug Updated",
                message: `Bug "${bug.bugTitle}" has been updated.`,
                type: "bug",
                project: bug.project,
                entityType: "Bug",
                entityId: bug._id,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bug updated successfully",
            bug: updatedBug,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update bug",
            error: error.message,
        });
    }
};

// Delete Bug
exports.deleteBug = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.bugId);

        if (!bug) {
            return res.status(404).json({
                success: false,
                message: "Bug not found",
            });
        }

        if (bug.assignedTo && req.user?._id && bug.assignedTo.toString() !== req.user._id.toString()) {
            await sendNotification({
                receiver: bug.assignedTo,
                sender: req.user._id,
                title: "Bug Deleted",
                message: `The bug "${bug.bugTitle}" assigned to you has been deleted.`,
                type: "bug",
                project: bug.project,
                entityType: "Bug",
                entityId: bug._id,
            });
        }

        await Bug.findByIdAndDelete(req.params.bugId);

        return res.status(200).json({
            success: true,
            message: "Bug deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete bug",
            error: error.message,
        });
    }
};

// Assign Bug
exports.assignBug = async (req, res) => {
    try {
        const { assignedTo } = req.body;

        const bug = await Bug.findById(req.params.bugId);

        if (!bug) {
            return res.status(404).json({
                success: false,
                message: "Bug not found",
            });
        }
        
        let user = null;
        if (assignedTo) {
            user = await User.findById(assignedTo);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
        }

        bug.assignedTo = assignedTo || null;
        bug.updatedBy = req.user?._id;

        await bug.save();

        const updatedBug = await Bug.findById(bug._id)
            .populate("project", "projectName")
            .populate("sprint", "sprintName")
            .populate("task", "taskTitle")
            .populate("reportedBy", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email");

        if (assignedTo && req.user?._id) {
            await sendNotification({
                receiver: assignedTo,
                sender: req.user._id,
                title: "Bug Assigned",
                message: `You have been assigned bug: ${bug.bugTitle}`,
                type: "bug",
                project: bug.project,
                entityType: "Bug",
                entityId: bug._id,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bug assigned successfully",
            bug: updatedBug,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to assign bug",
            error: error.message,
        });
    }
};

// Change Bug Status
exports.changeBugStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const bug = await Bug.findById(req.params.bugId);

        if (!bug) {
            return res.status(404).json({
                success: false,
                message: "Bug not found",
            });
        }

        bug.status = status;
        bug.updatedBy = req.user?._id;

        if (status === "resolved") {
            bug.resolvedDate = new Date();
        }

        await bug.save();

        const updatedBug = await Bug.findById(bug._id)
            .populate("project", "projectName")
            .populate("sprint", "sprintName")
            .populate("task", "taskTitle")
            .populate("reportedBy", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email");

        if (bug.assignedTo && req.user?._id && bug.assignedTo.toString() !== req.user._id.toString()) {
            await sendNotification({
                receiver: bug.assignedTo,
                sender: req.user._id,
                title: "Bug Status Updated",
                message: `Bug "${bug.bugTitle}" status has been changed to ${status}.`,
                type: "bug",
                project: bug.project,
                entityType: "Bug",
                entityId: bug._id,
            });
        }

        if (status === "resolved" && bug.reportedBy && req.user?._id && bug.reportedBy.toString() !== req.user._id.toString()) {
            await sendNotification({
                receiver: bug.reportedBy,
                sender: req.user._id,
                title: "Bug Resolved",
                message: `Bug "${bug.bugTitle}" reported by you has been marked as resolved.`,
                type: "bug",
                project: bug.project,
                entityType: "Bug",
                entityId: bug._id,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bug status changed successfully",
            bug: updatedBug,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to change bug status",
            error: error.message,
        });
    }
};

// Get Next Bug ID preview
exports.getNextBugId = async (req, res) => {
    try {
        const nextBugId = await generateBugId();
        return res.status(200).json({
            success: true,
            nextBugId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate next Bug ID",
            error: error.message,
        });
    }
};