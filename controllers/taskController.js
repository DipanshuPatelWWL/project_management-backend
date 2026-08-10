const Task = require("../models/Task");
const User = require("../models/User");


// Create Task
exports.createTask = async (req, res) => {
    try {
        const {
            taskTitle,
            description,
            project,
            sprint,
            assignedTo,
            priority,
            status,
            storyPoints,
            estimatedHours,
            actualHours,
            startDate,
            dueDate,
            compltedDate,
            attachments,
        } = req.body;

        if (!taskTitle || !project) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const task = await Task.create({
            taskTitle,
            description,
            project,
            sprint,
            assignedTo,
            priority,
            status,
            storyPoints,
            estimatedHours,
            actualHours,
            startDate,
            dueDate,
            compltedDate,
            attachments,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: error.message,
        });
    }
};


// Get All Tasks
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();

        return res.status(200).json({
            success: true,
            count: tasks.length,
            message: "Tasks fetched successfully",
            tasks,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
            error: error.message,
        });
    }
};


// Get Task By ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task fetched successfully",
            task,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch task",
            error: error.message,
        });
    }
};


// Update Task
exports.updateTask = async (req, res) => {
    try {
        const {
            taskTitle,
            description,
            project,
            sprint,
            priority,
            status,
            storyPoints,
            estimatedHours,
            actualHours,
            startDate,
            dueDate,
            compltedDate,
            attachments,
        } = req.body;

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        if (taskTitle) task.taskTitle = taskTitle;
        if (description) task.description = description;
        if (project) task.project = project;
        if (sprint) task.sprint = sprint;
        if (priority) task.priority = priority;
        if (status) task.status = status;

        if (storyPoints !== undefined) task.storyPoints = storyPoints;
        if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
        if (actualHours !== undefined) task.actualHours = actualHours;

        if (startDate) task.startDate = startDate;
        if (dueDate) task.dueDate = dueDate;
        if (compltedDate) task.compltedDate = compltedDate;
        if (attachments) task.attachments = attachments;

        task.updatedBy = req.user._id;

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message,
        });
    }
};


// Delete Task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        await Task.findByIdAndDelete(req.params.taskId);

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message,
        });
    }
};


// Assign Task
exports.assignTask = async (req, res) => {
    try {
        const { assignedTo } = req.body;

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        const user = await User.findById(assignedTo);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        task.assignedTo = assignedTo;
        task.assignedBy = req.user._id;
        task.updatedBy = req.user._id;

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task assigned successfully",
            task,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to assign task",
            error: error.message,
        });
    }
};


// Change Task Status
exports.changeTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        task.status = status;
        task.updatedBy = req.user._id;

        if (status === "completed") {
            task.compltedDate = new Date();
        }

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task status changed successfully",
            task,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to change task status",
            error: error.message,
        });
    }
};


// Change Priority
exports.changePriority = async (req, res) => {
    try {
        const { priority } = req.body;

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        task.priority = priority;
        task.updatedBy = req.user._id;

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task priority changed successfully",
            task,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to change task priority",
            error: error.message,
        });
    }
};