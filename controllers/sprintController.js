const Sprint = require("../models/Sprint");

// Generate permanent sequential Sprint ID (same as generateProjectId / generateClientId)
const generateSprintId = async () => {
    const sprints = await Sprint.find({
        sprintId: { $exists: true, $ne: "" },
    }).select("sprintId");

    let highestNumber = 0;

    sprints.forEach((s) => {
        if (s.sprintId) {
            const number = parseInt(s.sprintId.replace("SPR", ""), 10);
            if (!isNaN(number) && number > highestNumber) {
                highestNumber = number;
            }
        }
    });

    const nextNumber = highestNumber + 1;
    return `SPR${String(nextNumber).padStart(3, "0")}`;
};

const sanitizeSprintData = (data) => {
    const cleaned = { ...data };
    if (cleaned.startDate === "") cleaned.startDate = undefined;
    if (cleaned.endDate === "") cleaned.endDate = undefined;
    if (cleaned.totalTasks === "" || cleaned.totalTasks === undefined) cleaned.totalTasks = 0;
    if (cleaned.completedTasks === "" || cleaned.completedTasks === undefined) cleaned.completedTasks = 0;
    if (cleaned.totalStoryPoints === "" || cleaned.totalStoryPoints === undefined) cleaned.totalStoryPoints = 0;
    if (cleaned.completedStoryPoints === "" || cleaned.completedStoryPoints === undefined) cleaned.completedStoryPoints = 0;
    if (cleaned.progress === "" || cleaned.progress === undefined) cleaned.progress = 0;
    return cleaned;
};

// Create Sprint
exports.createSprint = async (req, res) => {
    try {
        const sanitized = sanitizeSprintData(req.body);
        const {
            sprintName,
            sprintgoal,
            project,
            startDate,
            endDate,
            status,
            progress,
            totalTasks,
            completedTasks,
            totalStoryPoints,
            completedStoryPoints,
        } = sanitized;

        if (!sprintName || !project) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: "End Date cannot be before Start Date",
            });
        }

        if (Number(completedTasks) > Number(totalTasks)) {
            return res.status(400).json({
                success: false,
                message: "Total tasks must be greater than or equal to completed tasks",
            });
        }

        if (Number(completedStoryPoints) > Number(totalStoryPoints)) {
            return res.status(400).json({
                success: false,
                message: "Total story points must be greater than or equal to completed story points",
            });
        }

        const sprintId = await generateSprintId();

        const sprint = await Sprint.create({
            sprintId,
            sprintName,
            sprintgoal,
            project,
            startDate,
            endDate,
            status: status || "planning",
            progress: Number(progress) || 0,
            totalTasks: Number(totalTasks) || 0,
            completedTasks: Number(completedTasks) || 0,
            totalStoryPoints: Number(totalStoryPoints) || 0,
            completedStoryPoints: Number(completedStoryPoints) || 0,
            isDeleted: false,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        const populatedSprint = await Sprint.findById(sprint._id)
            .populate("project", "projectName projectId status")
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email");

        return res.status(201).json({
            success: true,
            message: "Sprint created successfully",
            sprint: populatedSprint || sprint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create sprint",
            error: error.message,
        });
    }
};


// Get All Sprints
exports.getSprints = async (req, res) => {
    try {
        const filter = { isDeleted: { $ne: true } };
        if (req.query.project) filter.project = req.query.project;
        if (req.query.status) filter.status = req.query.status;

        const sprints = await Sprint.find(filter)
            .populate("project", "projectName projectId status")
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email")
            .sort({ createdAt: -1 });

        // Backfill any existing sprint missing sprintId
        for (const s of sprints) {
            if (!s.sprintId) {
                s.sprintId = await generateSprintId();
                await s.save();
            }
        }

        const nextSprintId = await generateSprintId();

        return res.status(200).json({
            success: true,
            count: sprints.length,
            message: "Sprints fetched successfully",
            sprints,
            nextSprintId,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sprints",
            error: error.message,
        });
    }
};

// Get Single Sprint By ID
exports.getSprintById = async (req, res) => {
    try {
        const sprint = await Sprint.findOne({
            _id: req.params.sprintId,
            isDeleted: false,
        })
            .populate("project", "projectName projectId status")
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email");

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: "Sprint not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Sprint fetched successfully",
            sprint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sprint",
            error: error.message,
        });
    }
};


// Update Sprint
exports.updateSprint = async (req, res) => {
    try {
        const sanitized = sanitizeSprintData(req.body);
        const {
            sprintName,
            sprintgoal,
            project,
            startDate,
            endDate,
            status,
            progress,
            totalTasks,
            completedTasks,
            totalStoryPoints,
            completedStoryPoints,
        } = sanitized;

        const sprint = await Sprint.findOne({
            _id: req.params.sprintId,
            isDeleted: false,
        });

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: "Sprint not found",
            });
        }

        const effectiveStartDate = startDate !== undefined ? startDate : sprint.startDate;
        const effectiveEndDate = endDate !== undefined ? endDate : sprint.endDate;
        const effectiveTotalTasks = totalTasks !== undefined ? Number(totalTasks) || 0 : sprint.totalTasks;
        const effectiveCompletedTasks = completedTasks !== undefined ? Number(completedTasks) || 0 : sprint.completedTasks;
        const effectiveTotalPoints = totalStoryPoints !== undefined ? Number(totalStoryPoints) || 0 : sprint.totalStoryPoints;
        const effectiveCompletedPoints = completedStoryPoints !== undefined ? Number(completedStoryPoints) || 0 : sprint.completedStoryPoints;

        if (effectiveStartDate && effectiveEndDate && new Date(effectiveEndDate) < new Date(effectiveStartDate)) {
            return res.status(400).json({
                success: false,
                message: "End Date cannot be before Start Date",
            });
        }

        if (effectiveCompletedTasks > effectiveTotalTasks) {
            return res.status(400).json({
                success: false,
                message: "Total tasks must be greater than or equal to completed tasks",
            });
        }

        if (effectiveCompletedPoints > effectiveTotalPoints) {
            return res.status(400).json({
                success: false,
                message: "Total story points must be greater than or equal to completed story points",
            });
        }

        // Update remaining fields
        if (sprintName !== undefined) sprint.sprintName = sprintName;
        if (sprintgoal !== undefined) sprint.sprintgoal = sprintgoal;
        if (project !== undefined) sprint.project = project;
        sprint.startDate = startDate;
        sprint.endDate = endDate;
        if (status !== undefined) sprint.status = status;
        if (progress !== undefined) sprint.progress = Number(progress) || 0;
        if (totalTasks !== undefined) sprint.totalTasks = Number(totalTasks) || 0;
        if (completedTasks !== undefined) sprint.completedTasks = Number(completedTasks) || 0;
        if (totalStoryPoints !== undefined) sprint.totalStoryPoints = Number(totalStoryPoints) || 0;
        if (completedStoryPoints !== undefined) sprint.completedStoryPoints = Number(completedStoryPoints) || 0;

        sprint.updatedBy = req.user._id;

        await sprint.save();

        const populatedSprint = await Sprint.findById(sprint._id)
            .populate("project", "projectName projectId status")
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email");

        return res.status(200).json({
            success: true,
            message: "Sprint updated successfully",
            sprint: populatedSprint || sprint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update sprint",
            error: error.message,
        });
    }
};


// Delete Sprint (Soft delete - identical to projectController / clientController)
exports.deleteSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findOne({
            _id: req.params.sprintId,
            isDeleted: false,
        });

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: "Sprint not found",
            });
        }

        // Soft delete: keep record in DB so sprintId is never reused
        sprint.isDeleted = true;
        sprint.updatedBy = req.user._id;

        await sprint.save({ validateModifiedOnly: true });

        return res.status(200).json({
            success: true,
            message: "Sprint deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete sprint",
            error: error.message,
        });
    }
};


// Start Sprint
exports.startSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findOne({
            _id: req.params.sprintId,
            isDeleted: false,
        });

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: "Sprint not found",
            });
        }

        sprint.status = "active";
        sprint.updatedBy = req.user._id;

        await sprint.save();

        const populatedSprint = await Sprint.findById(sprint._id)
            .populate("project", "projectName projectId status")
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email");

        return res.status(200).json({
            success: true,
            message: "Sprint started successfully",
            sprint: populatedSprint || sprint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to start sprint",
            error: error.message,
        });
    }
};


// Complete Sprint
exports.completeSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findOne({
            _id: req.params.sprintId,
            isDeleted: false,
        });

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: "Sprint not found",
            });
        }

        sprint.status = "completed";
        sprint.progress = 100;
        sprint.updatedBy = req.user._id;

        await sprint.save(); 

        const populatedSprint = await Sprint.findById(sprint._id)
            .populate("project", "projectName projectId status")
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email");

        return res.status(200).json({
            success: true,
            message: "Sprint completed successfully",
            sprint: populatedSprint || sprint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to complete sprint",
            error: error.message,
        });
    }
};