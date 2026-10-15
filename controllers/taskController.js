const Task = require("../models/Task");
const User = require("../models/User");
const {sendTaskAssignmentEmail} = require("../services/emailService");
const {
    sendNotification,
} = require("../services/notificationService");
const logAudit = require("../utils/auditLogger");


const sanitizeTaskData = (data) => {
    const cleaned = { ...data };
    if (!cleaned.sprint || cleaned.sprint === "") cleaned.sprint = null;
    if (!cleaned.assignedTo || cleaned.assignedTo === "") cleaned.assignedTo = null;
    if (!cleaned.assignedBy || cleaned.assignedBy === "") cleaned.assignedBy = null;
    if (cleaned.startDate === "") cleaned.startDate = null;
    if (cleaned.dueDate === "") cleaned.dueDate = null;
    if (cleaned.compltedDate === "") cleaned.compltedDate = null;
    if (cleaned.storyPoints === "" || cleaned.storyPoints === undefined) cleaned.storyPoints = 0;
    else cleaned.storyPoints = Number(cleaned.storyPoints) || 0;
    if (cleaned.estimatedHours === "" || cleaned.estimatedHours === undefined) cleaned.estimatedHours = 0;
    else cleaned.estimatedHours = Number(cleaned.estimatedHours) || 0;
    if (cleaned.actualHours === "" || cleaned.actualHours === undefined) cleaned.actualHours = 0;
    else cleaned.actualHours = Number(cleaned.actualHours) || 0;
    return cleaned;
};

// Create Task
exports.createTask = async (req, res) => {
    try {
        const sanitized = sanitizeTaskData(req.body);
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
        } = sanitized;

        if (!taskTitle || !project || !startDate || !dueDate || !compltedDate) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields (Task title, Project, Start Date, Due Date, and Completed Date)",
            });
        }

        if (new Date(dueDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: "Due Date cannot be before Start Date",
            });
        }

        if (new Date(compltedDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: "Completed Date cannot be before Start Date",
            });
        }

        const attachmentUrls = req.files && req.files.length > 0 
            ? req.files.map(file => `/uploads/${file.filename}`) 
            : [];

        const task = await Task.create({
            taskTitle,
            description,
            project,
            sprint,
            assignedTo,
            assignedBy: req.user?._id || null,
            priority: priority || "medium",
            status: status || "to-do",
            storyPoints,
            estimatedHours,
            actualHours,
            startDate,
            dueDate,
            compltedDate: status === "completed" ? (compltedDate || new Date()) : compltedDate,
            attachments: attachmentUrls,
            createdBy: req.user?._id,
            updatedBy: req.user?._id,
        });

        if (assignedTo && req.user?._id) {
            try {
                await sendNotification({
                    receiver: assignedTo,
                    sender: req.user._id,
                    title: "New Task Assigned",
                    message: `You have been assigned a new task: ${task.taskTitle}`,
                    type: "task",
                    project: task.project,
                    entityType: "Task",
                    entityId: task._id,
                });

                await sendTaskAssignmentEmail({
                    assignedUser: assignedTo,
                    task: taskTitle,
                    project: project,
                });
            } catch (notifyErr) {
                console.error("Task assignment notification/email failed:", notifyErr.message);
            }
        }

        // Also notify creator if task was not self-assigned
        if (req.user?._id && (!assignedTo || assignedTo.toString() !== req.user._id.toString())) {
            try {
                await sendNotification({
                    receiver: req.user._id,
                    sender: req.user._id,
                    title: "Task Created",
                    message: `Task "${task.taskTitle}" has been created successfully.`,
                    type: "task",
                    project: task.project,
                    entityType: "Task",
                    entityId: task._id,
                });
            } catch (err) {
                console.error("Task creator notification failed:", err.message);
            }
        }

        await logAudit({
            req,
            module: "Task",
            action: "CREATE",
            description: `Created new task "${task.taskTitle}" (${task.taskId || task._id})`,
            entityType: "Task",
            entityId: task._id,
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
        const tasks = await Task.find()
            .populate("project", "projectName")
            .populate("sprint", "sprintName")
            .populate("assignedTo", "firstName lastName email role profileImage")
            .populate("assignedBy", "firstName lastName")
            .populate("createdBy", "firstName lastName")
            .sort({ createdAt: -1 });

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
        const task = await Task.findById(req.params.taskId)
            .populate("project", "projectName")
            .populate("sprint", "sprintName")
            .populate("assignedTo", "firstName lastName email role profileImage")
            .populate("assignedBy", "firstName lastName")
            .populate("createdBy", "firstName lastName");

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
        const sanitized = sanitizeTaskData(req.body);
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
        } = sanitized;

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        const finalStartDate = startDate !== undefined ? startDate : task.startDate;
        const finalDueDate = dueDate !== undefined ? dueDate : task.dueDate;
        const finalCompltedDate = compltedDate !== undefined ? compltedDate : task.compltedDate;

        if (finalStartDate && finalDueDate && new Date(finalDueDate) < new Date(finalStartDate)) {
            return res.status(400).json({
                success: false,
                message: "Due Date cannot be before Start Date",
            });
        }

        if (finalStartDate && finalCompltedDate && new Date(finalCompltedDate) < new Date(finalStartDate)) {
            return res.status(400).json({
                success: false,
                message: "Completed Date cannot be before Start Date",
            });
        }

        if (taskTitle !== undefined) task.taskTitle = taskTitle;
        if (description !== undefined) task.description = description;
        if (project !== undefined) task.project = project; 
        if (sprint !== undefined) task.sprint = sprint;
        if (assignedTo !== undefined) {
            if (assignedTo && task.assignedTo?.toString() !== assignedTo?.toString()) {
                task.assignedBy = req.user?._id || task.assignedBy;
            }
            task.assignedTo = assignedTo;
        }
        if (priority !== undefined) task.priority = priority;
        if (status !== undefined) {
            task.status = status;
            if (status === "completed" && !task.compltedDate) {
                task.compltedDate = new Date();
            }
        }

        if (storyPoints !== undefined) task.storyPoints = storyPoints;
        if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
        if (actualHours !== undefined) task.actualHours = actualHours;

        if (startDate !== undefined) task.startDate = startDate;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (compltedDate !== undefined) task.compltedDate = compltedDate;

        let currentAttachments = task.attachments || [];
        if (req.body.existingAttachments !== undefined) {
            try {
                const parsed = typeof req.body.existingAttachments === "string"
                    ? JSON.parse(req.body.existingAttachments)
                    : req.body.existingAttachments;
                currentAttachments = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                currentAttachments = Array.isArray(req.body.existingAttachments)
                    ? req.body.existingAttachments
                    : [req.body.existingAttachments];
            }
        }

        if (req.files && req.files.length > 0) {
            const newFiles = req.files.map(file => `/uploads/${file.filename}`);
            task.attachments = [...currentAttachments, ...newFiles];
        } else if (req.body.existingAttachments !== undefined) {
            task.attachments = currentAttachments;
        }

        task.updatedBy = req.user?._id;

        await task.save();

        if (
            task.assignedTo &&
            req.user?._id &&
            task.assignedTo.toString() !== req.user._id.toString()
        ) {
            try {
                await sendNotification({
                    receiver: task.assignedTo,
                    sender: req.user._id,
                    title: "Task Updated",
                    message: `Your task "${task.taskTitle}" has been updated.`,
                    type: "task",
                    entityType: "Task",
                    entityId: task._id,
                });
            } catch (err) {
                console.error("Task update notification failed:", err.message);
            }
        }

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

        const assignedUser = task.assignedTo;

        if (
            assignedUser &&
            assignedUser.toString() !== req.user._id.toString()
        ) {
            await sendNotification({
                receiver: assignedUser,
                sender: req.user._id,
                title: "Task Deleted",
                message: `The task "${task.taskTitle}" assigned to you has been deleted.`,
                type: "task",
                entityType: "Task",
                entityId: task._id,
            });
        }

        await logAudit({
            req,
            module: "Task",
            action: "DELETE",
            description: `Deleted task "${task.taskTitle}" (${task.taskId || task._id})`,
            entityType: "Task",
            entityId: task._id,
        });

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

        if (
            assignedTo.toString() !== req.user._id.toString()
        ) {
            await sendNotification({
                receiver: assignedTo,
                sender: req.user._id,
                title: "Task Assigned",
                message: `You have been assigned task: ${task.taskTitle}`,
                type: "task",
                entityType: "Task",
                entityId: task._id,
            });
        }

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

        if (
            task.assignedTo &&
            task.assignedTo.toString() !== req.user._id.toString()
        ) {
            await sendNotification({
                receiver: task.assignedTo,
                sender: req.user._id,
                title: "Task Status Updated",
                message: `Task "${task.taskTitle}" status has been changed to ${status}.`,
                type: "task",
                entityType: "Task",
                entityId: task._id,
            });
        }

        await logAudit({
            req,
            module: "Task",
            action: "STATUS_CHANGE",
            description: `Changed task "${task.taskTitle}" status to ${status}`,
            entityType: "Task",
            entityId: task._id,
        });

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


        if (
            task.assignedTo &&
            task.assignedTo.toString() !== req.user._id.toString()
        ) {
            await sendNotification({
                receiver: task.assignedTo,
                sender: req.user._id,
                title: "Task Priority Updated",
                message: `Task "${task.taskTitle}" priority has been changed to ${priority}.`,
                type: "task",
                entityType: "Task",
                entityId: task._id,
            });
        }
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