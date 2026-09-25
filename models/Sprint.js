const mongoose = require("mongoose");

const SprintSchema = new mongoose.Schema(
    {
        isDeleted: {
            type: Boolean,
            default: false,
        },

        sprintId: {
            type: String,
            unique: true,
            sparse: true,
            uppercase: true,
            trim: true,
        },

        sprintName: {
            type: String,
            trim: true,
        },

        sprintgoal: {
            type: String,
            trim: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },

        startDate: {
            type: Date,
        },

        endDate: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["active", "completed", "cancelled", "planning"],
            default: "planning",
        },

        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        totalTasks: {
            type: Number,
            min: 0,
        },

        completedTasks: {
            type: Number,
            min: 0,
        },

        totalStoryPoints: {
            type: Number,
            min: 0,
        },

        completedStoryPoints: {
            type: Number,
            min: 0,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Sprint", SprintSchema);