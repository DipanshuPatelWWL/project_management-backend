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
            default: "",
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phoneNumber: {
            type: String,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: [
                "Super Admin",
                "Admin",
                "Project Manager",
                "Team Lead",
                "Developer",
                "QA Engineer",
                "Client",
            ],
            default : "Developer",
            required: true,

        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Company",
            
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
            type: String,
            trim: true,
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
            enum: ["Active", "Inactive", "On Leave"],
            default: "Active",
        },

        lastLogin: {
            type: Date,
        },

        createdBy: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);
  
module.exports = mongoose.model("User", userSchema); 