const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendWelcomeEmail } = require("../services/emailService");

// Generate next Employee ID
const generateEmployeeId = async () => {
  // Find the user with the highest Employee ID number
  const lastUser = await User.findOne({
    employeeId: { $exists: true },
  }).sort({ employeeId: -1 });

  let nextNumber = 1;

  if (lastUser && lastUser.employeeId) {
    const lastNumber = parseInt(lastUser.employeeId.replace("EMP", ""), 10);

    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `EMP${String(nextNumber).padStart(3, "0")}`;
};

// Create User
exports.createUser = async (req, res) => {
  console.log("request", req.body);
     const employeeId = await generateEmployeeId();
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

    // Check required fields
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

    // Generate Employee ID from backend
    const employeeId = await generateEmployeeId();

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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
      reportingManager: req.user._id || "N/A",
      joiningDate: new Date(),
      employmentType,
      workLocation,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    console.log("email start");

    await sendWelcomeEmail(email, firstName);

    // Don't send password back
    const createdUser = await User.findById(user._id).select("-password");

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
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
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
    }).select("-password");

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

    // Check employee ID
    if (employeeId) {
      const existingEmployee = await User.findOne({
        employeeId,
        _id: { $ne: req.params.userId },
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
        });
      }

      user.employeeId = employeeId;
    }

    // Check email
    if (email) {
      const existingEmail = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      user.email = email.trim().toLowerCase();
    }

    // Check phone
    if (phone) {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: req.params.id },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }

      user.phone = phone;
    }

    // Update remaining fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (company) user.company = company;
    if (designation) user.designation = designation;
    if (department) user.department = department;
    if (status) user.status = status;

    // Update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
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

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      isDeleted: false,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "no user found",
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
    return res.status(401).json({
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

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check email
    if (email) {
      const existingEmail = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.userId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      user.email = email.trim().toLowerCase();
    }

    // Check phone
    if (phone) {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: req.user._id },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }

      user.phone = phone;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (company) user.company = company;
    if (designation) user.designation = designation;
    if (department) user.department = department;

    // Update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
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
    const { userId } = req.params;
    const { status } = req.body;

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

    res.status(200).json({
      success: true,
      message: "Status updated",
    });
  } catch (error) {
    res.status(500).json({
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

    res.status(200).json({
      success: true,
      message: "Role updated",
    });
  } catch (error) {
    res.status(500).json({
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

    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile image",
      error: error.message,
    });
  }
};

// Get next Employee ID preview
// exports.getNextEmployeeId = async (req, res) => {
//   try {
//     const employeeId = await generateEmployeeId();

//     return res.status(200).json({
//       success: true,
//       employeeId,
//     });
//   } catch (error) {
//     console.error("GET NEXT EMPLOYEE ID ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to generate Employee ID",
//       error: error.message,
//     });
//   }
// };
