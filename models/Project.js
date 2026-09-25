const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
    {
        isDeleted: {
            type: Boolean,
            default: false,
        },

        // projectId stays permanently unique - never reused,
        // same pattern as clientId / companyId.
        projectId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        projectName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },

        projectManager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        teamLead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        teamMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        budget: {
            type: Number,
        },

        technologies: {
            type: String,
            trim: true,
        },

        startDate: {
            type: Date,
            default: null,
        },

        endDate: {
            type: Date,
            default: null,
        },

        deadline: {
            type: Date,
            default: null,
        },

        status: {
            type: String,
            enum: [
                "planning",
                "active",
                "on hold",
                "completed",
                "Cancelled",
            ],
            default: "planning",
        },

        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high",
                "critical",
            ],
            default: "medium",
        },

        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        isArchived: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
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
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.models.Project ||
    mongoose.model("Project", ProjectSchema);