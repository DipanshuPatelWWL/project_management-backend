const bcrypt = require("bcryptjs");
const User = require("../models/User");


// Create User
exports.createUser = async (req, res) => {
    try {
        const {employeeId,firstName,lastName,email,phone,password,role,company,designation,department, status,} = req.body;

        
        if ( !employeeId ||!firstName || !lastName || !email ||!phone || !password ||!role ||!company ||!designation ||!department) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        // Check if employee ID already exists
        const existingEmployee = await User.findOne({ employeeId });
        if (existingEmployee) {
            return res.status(400).json({success: false,  message: "Employee already exists",
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: email });

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
            email: email,
            phone,
            password: hashedPassword,
            role,
            company,
            designation,
            department,
            status: status ,
        });

        // password wapis nahi bhejna 
        const createdUser = await User.findById(user._id).select("-password");

        return res.status(201).json({success: true, message: "User created successfully",
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
        const users = await User.find().select("-password");
         
        return res.status(200).json({ success: true, message: "Users fetched successfully",
             });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch users",
        });
    }
};

// get user by  Id 
exports.getUserById = async (req,res ) => {
    try {
        const users = await User.findById(req.param.id).select("-password");
      if (!user )
        return res.status(400).json({success:false , message:"user do not exists"  ,}
    );
    return res.status (200) .json ({success: true , message : "user exists "}

    );

    }
    catch(error) {
        return res.status(400). json ({success: false  , message : error.message}

        );

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
        } = req.body;

        const user = await User.findById(req.params.id);

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
                _id: { $ne: req.params.id },
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

            user.email = email.toLowerCase();
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


exports.deleteUser = async(req,res) => {

    try {
        const user = await user.findById(req.param.id) ;

        if (!user ){
           return  res.status(400) . json({success :false, message: "no user found" });

        }

        await user.deleteOne();
        
        return res.status(200) .json ({success : true ,message :"user deleted "});
    }
    catch (error) {

        return res.status(401) .json ({success : false , message : error.message});

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
                _id: { $ne: req.user._id },
            });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            user.email = email.toLowerCase();
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

        if (firstName)user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (company) user.company = company;
        if (designation) user.designation = designation;
        if (department) user.department = department;

        // Update password if provided
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

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

//userStatus
exports.changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = status;
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
//userRole

exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: "Role updated",});
  } 
  catch (error) {res.status(500).json({ success: false, message: "Something went wrong", });
  }
};