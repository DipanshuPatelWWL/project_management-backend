const bcrypt = require("bcryptjs");
const User = require("../models/User");
const regex = require("../utils/regexPatterns");

// Generate next Employee ID
const generateEmployeeId = async () => {
    const users = await User.find({
        employeeId: { $exists: true, $ne: "" },
    }).select("employeeId");

    let highestNumber = 0;

    users.forEach((user) => {
        if (user.employeeId) {
            const number = parseInt(
                user.employeeId.replace("EMP", ""),
                10
            );

            if (!isNaN(number) && number > highestNumber) {
                highestNumber = number;
            }
        }
    });

    const nextNumber = highestNumber + 1;

    return `EMP${String(nextNumber).padStart(3, "0")}`;
};

// Create User
exports.createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            role,
            company,
            designation,
            department,
            status,
            reportingManager,
            joiningDate,
            employmentType,
            workLocation,
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password ||
            !role ||
            !company ||
            !designation ||
            !department
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        if (status && status !== "Active" && req.user.role !== "SuperAdmin") {
            return res.status(403).json({
                success: false,
                message: "Only SuperAdmin can change the status of a user",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!regex.email.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        if (!regex.phone.test(phone.trim())) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be a valid 10-digit number starting with 6, 7, 8, or 9",
            });
        }

        if (!regex.password.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long with uppercase, lowercase, number, and special character",
            });
        }

        const existingEmail = await User.findOne({
            email: normalizedEmail,
        });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const existingPhone = await User.findOne({
            phone,
        });

        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: "Phone number already exists",
            });
        }

        // Generate Employee ID only after validation
        const employeeId = await generateEmployeeId();

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            employeeId,
            firstName,
            lastName,
            email: normalizedEmail,
            phone,
            password: hashedPassword,
            role,
            company,
            designation,
            department,
            status: status || "Active",
            reportingManager:
                reportingManager || req.user._id,
            joiningDate:
                joiningDate || new Date(),
            employmentType,
            workLocation,
            isDeleted: false,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        const createdUser =
            await User.findById(user._id)
                .select("-password");

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: createdUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message,
        });
    }
};

// Get All Users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({
            isDeleted: false,
        })
            .select("-password")
            .populate("company", "companyName");

        const nextEmployeeId =
            await generateEmployeeId();

        return res.status(200).json({
            success: true,
            count: users.length,
            users,
            nextEmployeeId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};

// Get User By ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.userId,
            isDeleted: false,
        })
            .select("-password")
            .populate("company", "companyName");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "user do not exists",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Update User
exports.updateUser = async (req, res) => {
    try {
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
            status,
            reportingManager,
            joiningDate,
            employmentType,
            workLocation,
        } = req.body;

        const user = await User.findOne({
            _id: req.params.userId,
            isDeleted: false,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Employee ID can never be changed
        if (
            employeeId &&
            employeeId !== user.employeeId
        ) {
            return res.status(400).json({
                success: false,
                message: "Employee ID cannot be changed",
            });
        }

        if (email) {
            const normalizedEmail =
                email.trim().toLowerCase();

            if (!regex.email.test(normalizedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address",
                });
            }

            const existingEmail =
                await User.findOne({
                    email: normalizedEmail,
                    _id: {
                        $ne: req.params.userId,
                    },
                });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            user.email = normalizedEmail;
        }

        if (phone) {
            if (!regex.phone.test(phone.trim())) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number must be a valid 10-digit number starting with 6, 7, 8, or 9",
                });
            }

            const existingPhone =
                await User.findOne({
                    phone,
                    _id: {
                        $ne: req.params.userId,
                    },
                });

            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number already exists",
                });
            }

            user.phone = phone;
        }

        if (firstName) {
            user.firstName = firstName;
        }

        if (lastName) {
            user.lastName = lastName;
        }

        if (role) {
            user.role = role;
        }

        if (company) {
            user.company = company;
        }

        if (designation) {
            user.designation = designation;
        }

        if (department) {
            user.department = department;
        }

        if (status && status !== user.status) {
            if (req.user.role !== "SuperAdmin") {
                return res.status(403).json({
                    success: false,
                    message: "Only SuperAdmin can change the status of a user",
                });
            }
            if (!["Active", "Inactive", "OnLeave"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status value",
                });
            }
            user.status = status;
        }

        if (reportingManager) {
            user.reportingManager =
                reportingManager;
        }

        if (joiningDate) {
            user.joiningDate = joiningDate;
        }

        if (employmentType) {
            user.employmentType =
                employmentType;
        }

        if (workLocation) {
            user.workLocation = workLocation;
        }

        if (password) {
            if (!regex.password.test(password)) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 8 characters long with uppercase, lowercase, number, and special character",
                });
            }
            user.password =
                await bcrypt.hash(password, 10);
        }

        user.updatedBy = req.user._id;

        await user.save();

        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message,
        });
    }
};

// Soft Delete User
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.userId,
            isDeleted: false,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No user found",
            });
        }

        user.isDeleted = true;
        user.updatedBy = req.user._id;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            company,
            designation,
            department,
        } = req.body;

        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (email) {
            const existingEmail =
                await User.findOne({
                    email: email
                        .trim()
                        .toLowerCase(),
                    _id: {
                        $ne: req.user._id,
                    },
                });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            user.email = email
                .trim()
                .toLowerCase();
        }

        if (phone) {
            const existingPhone =
                await User.findOne({
                    phone,
                    _id: {
                        $ne: req.user._id,
                    },
                });

            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number already exists",
                });
            }

            user.phone = phone;
        }

        if (firstName) {
            user.firstName = firstName;
        }

        if (lastName) {
            user.lastName = lastName;
        }

        if (company) {
            user.company = company;
        }

        if (designation) {
            user.designation =
                designation;
        }

        if (department) {
            user.department =
                department;
        }

        if (password) {
            user.password =
                await bcrypt.hash(password, 10);
        }

        user.updatedBy = req.user._id;

        await user.save();

        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message,
        });
    }
};

// Change User Status
exports.changeUserStatus = async (req, res) => {
    try {
        if (req.user.role !== "SuperAdmin") {
            return res.status(403).json({
                success: false,
                message: "Only SuperAdmin can change the status of a user",
            });
        }

        const { userId } = req.params;
        const { status } = req.body;

        if (!status || !["Active", "Inactive", "OnLeave"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status (Active, Inactive, OnLeave) is required",
            });
        }

        const user = await User.findOne({
            _id: userId,
            isDeleted: false,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.status = status;
        user.updatedBy = req.user._id;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Status updated",
            user: {
                _id: user._id,
                employeeId: user.employeeId,
                status: user.status,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// Change User Role
exports.changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const user = await User.findOne({
            _id: userId,
            isDeleted: false,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        user.role = role;
        user.updatedBy = req.user._id;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Role updated",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// Update Profile Image
exports.updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }

        const imageUrl =
            `/uploads/${req.file.filename}`;

        const user =
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    profileImage: imageUrl,
                },
                {
                    new: true,
                }
            )
                .select("-password")
                .populate("company", "companyName companyCode");

        return res.status(200).json({
            success: true,
            message:
                "Profile image updated successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Failed to update profile image",
            error: error.message,
        });
    }
};