require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Company = require("../models/Company");

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Create a dummy company (skip if you already have one)
        let company = await Company.findOne({ companyCode: "DUMMY01" });
        if (!company) {
            company = await Company.create({
                companyName: "Dummy Company",
                companyCode: "DUMMY01",
                officialEmail: "company@dummy.com",
                status: "active",
            });
            console.log("Company created:", company._id);
        } else {
            console.log("Using existing company:", company._id);
        }

        // 2. Create the SuperAdmin user
        const existing = await User.findOne({ email: "admin@pms.com" });
        if (existing) {
            console.log("SuperAdmin already exists:", existing._id);
            return process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        const admin = await User.create({
            employeeId: "EMP003",
            firstName: "Super",
            lastName: "Admin",
            email: "admin@pms.com",
            phone: "9999999999",
            password: hashedPassword,
            role: "SuperAdmin",
            company: company._id,
            designation: "Administrator",
            department: "Management",
            status: "Active",
        });

        console.log("SuperAdmin created:", admin._id);
        console.log("Login with -> email: admin@pms.com | password: Admin@123");

        process.exit(0);
    } catch (error) {
        console.error("Seed failed:", error.message);
        process.exit(1);
    }
};

run();