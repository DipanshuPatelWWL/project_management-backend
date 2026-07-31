const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        profileImage: {
            type: String,
            default: null,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: [
                "SuperAdmin",
                "Admin",
                "ProjectManager",
                "TeamLead",
                "Developer",
                "QA",
                "Client",
            ],
            default: "Developer",
            required: true,

        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            default: null,
        },


        department: {
            type: String,
            trim: true,
        },

        designation: {
            type: String,
            trim: true,
        },

        reportingManager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        joiningDate: {
            type: Date,
        },

        employmentType: {
            type: String,
            enum: ["Full-Time", "Part-Time", "Contract", "Intern"],
            default: "Full-Time",
        },

        workLocation: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "Active",
                "Inactive",
                "OnLeave",
            ],
            default: "Active",
        },

        lastLogin: {
            type: Date,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.index({ company: 1 });
userSchema.index({ role: 1 });

userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);