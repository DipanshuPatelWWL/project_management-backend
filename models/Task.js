const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
    {
      
        taskTitle: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            trim: true,
        },

        sprint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sprint",
            trim: true,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            trim: true,
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            trim: true,
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },

        status: {
            type: String,
            enum: ["to-do", "in-progress", "completed", "on-hold"],
            default: "to-do",
        },

        storyPoints: {
            type: Number,
            trim: true,
        },

        estimatedHours: {
            type: Number,
            trim: true,
        },

        actualHours: {
            type: Number,
            trim: true,
        },

        startDate: {
            type: Date,
            trim: true,
        },

        dueDate: {
            type: Date,
            trim: true,
        },

        compltedDate: {
            type: Date,
            trim: true,
        },

        attachments: {
            type: [String],
            trim: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            trim: true,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            trim: true,
        },
    },

    { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);