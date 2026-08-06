const Sprint = require("../models/Sprint");


// Create Sprint
exports.createSprint = async (req, res) => {
    try {
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
        } = req.body;
    
        if (!sprintName || !project) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const sprint = await Sprint.create({
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
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Sprint created successfully",
            sprint,
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
        const sprints = await Sprint.find();

        return res.status(200).json({
            success: true,
            count: sprints.length,
            message: "Sprints fetched successfully",
            sprints,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sprints",
            error: error.message,
        });
    }
};


// Update Sprint
exports.updateSprint = async (req, res) => {
    try {
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
        } = req.body;

        const sprint = await Sprint.findById(req.params.sprintId);

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: "Sprint not found",
            });
        }

        // Update remaining fields
        if (sprintName) sprint.sprintName = sprintName;
        if (sprintgoal) sprint.sprintgoal = sprintgoal;
        if (project) sprint.project = project;
        if (startDate) sprint.startDate = startDate;
        if (endDate) sprint.endDate = endDate;
        if (status) sprint.status = status;
        if (progress !== undefined) sprint.progress = progress;
        if (totalTasks !== undefined) sprint.totalTasks = totalTasks;
        if (completedTasks !== undefined) sprint.completedTasks = completedTasks;
        if (totalStoryPoints !== undefined) sprint.totalStoryPoints = totalStoryPoints;
        if (completedStoryPoints !== undefined) sprint.completedStoryPoints = completedStoryPoints;

        sprint.updatedBy = req.user._id;

        await sprint.save();

        return res.status(200).json({
            success: true,
            message: "Sprint updated successfully",
            sprint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update sprint",
            error: error.message,
        });
    }
};


// Delete Sprint
exports.deleteSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.sprintId);

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: "Sprint not found",
            });
        }

        await Sprint.findByIdAndDelete(req.params.sprintId);

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
        const sprint = await Sprint.findById(req.params.sprintId);

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: "Sprint not found",
            });
        }

        sprint.status = "active";
        sprint.updatedBy = req.user._id;

        await sprint.save();

        return res.status(200).json({
            success: true,
            message: "Sprint started successfully",
            sprint,
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
        const sprint = await Sprint.findById(req.params.sprintId);

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

        return res.status(200).json({
            success: true,
            message: "Sprint completed successfully",
            sprint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to complete sprint",
            error: error.message,
        });
    }
};