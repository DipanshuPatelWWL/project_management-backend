// middleware/validationMiddleware.js
const regex = require("../utils/regexPatterns");

exports.validateRegister = (req, res, next) => {
    const {
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        password,
        role,
        company,
        designation,
        department,
    } = req.body;

    const errors = [];

    // required-field check (empty hai ya nahi)
    if (!employeeId) errors.push("Employee ID is required");
    if (!firstName) errors.push("First name is required");
    if (!lastName) errors.push("Last name is required");
    if (!email) errors.push("Email is required");
    if (!phone) errors.push("Phone is required");
    if (!password) errors.push("Password is required");
    if (!role) errors.push("Role is required");
    if (!company) errors.push("Company is required");
    if (!designation) errors.push("Designation is required");
    if (!department) errors.push("Department is required");

    // agar koi field khaali hai, toh format check karne ki zaroorat nahi — turant reject karo
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    // ab format check — regex se
    if (!regex.name.test(firstName)) {
        errors.push("First name must contain only letters (2-50 characters)");
    }

    if (!regex.name.test(lastName)) {
        errors.push("Last name must contain only letters (2-50 characters)");
    }

    if (!regex.email.test(email)) {
        errors.push("Invalid email format");
    }

    if (!regex.phone.test(phone)) {
        errors.push("Phone number must be a valid 10-digit number");
    }

    if (!regex.password.test(password)) {
        errors.push("Password must be at least 6 characters and include a letter and a number");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    // sab sahi hai — aage badho
    next();
};


exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email) errors.push("Email is required");
    if (!password) errors.push("Password is required");

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    if (!regex.email.test(email)) {
        errors.push("Invalid email format");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    next();
};