const Bug = require("../models/Bug");
const User = require("../models/User");


// Create Bug
exports.createBug = async (req, res) => {
    try {
        const {
            bugTitle,
            description,
            project,
            sprint,
            task,
            severity,
            priority,
            status,
            stepsToReproduce,
            expectedResult,
            actualResult,
            attachments,
        } = req.body;

        if (!bugTitle || !project || !description) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

         const attachmentUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];


        const bug = await Bug.create({
            bugTitle,
            description,
            project,
            sprint,
            task,
            reportedBy: req.user._id,
            severity,
            priority,
            status,
            stepsToReproduce,
            expectedResult,
            actualResult,
            attachments,
            createdBy: req.user._id,
            updatedBy: req.user._id,
            attachments: attachmentUrls,
        });

        return res.status(201).json({
            success: true,
            message: "Bug created successfully",
            bug,
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
        const bugs = await Bug.find();

        return res.status(200).json({
            success: true,
            count: bugs.length,
            message: "Bugs fetched successfully",
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


// Update Bug
exports.updateBug = async (req, res) => {
    try {
        const {
            bugTitle,
            description,
            project,
            sprint,
            task,
            severity,
            priority,
            status,
            stepsToReproduce,
            expectedResult,
            actualResult,
            attachments,
        } = req.body;

        const bug = await Bug.findById(req.params.bugId);

        if (!bug) {
            return res.status(404).json({
                success: false,
                message: "Bug not found",
            });
        }

        if (bugTitle) bug.bugTitle = bugTitle;
        if (description) bug.description = description;
        if (project) bug.project = project;
        if (sprint) bug.sprint = sprint;
        if (task) bug.task = task;
        if (severity) bug.severity = severity;
        if (priority) bug.priority = priority;
        if (status) bug.status = status;
        if (stepsToReproduce) bug.stepsToReproduce = stepsToReproduce;
        if (expectedResult) bug.expectedResult = expectedResult;
        if (actualResult) bug.actualResult = actualResult;
        if (attachments) bug.attachments = attachments;

        bug.updatedBy = req.user._id;

        await bug.save();

        return res.status(200).json({
            success: true,
            message: "Bug updated successfully",
            bug,
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
        
        const user = await User.findById(assignedTo);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        bug.assignedTo = assignedTo;
        bug.updatedBy = req.user._id;

        await bug.save();

        return res.status(200).json({
            success: true,
            message: "Bug assigned successfully",
            bug,
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
        bug.updatedBy = req.user._id;

        if (status === "resolved") {
            bug.resolvedDate = new Date();
        }

        await bug.save();

        return res.status(200).json({
            success: true,
            message: "Bug status changed successfully",
            bug,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to change bug status",
            error: error.message,
        });
    }
};