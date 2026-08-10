const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const cookieOptions = {
    httpOnly: true,
    maxAge: 10 * 24 * 60 * 60 * 1000,
};


// auth

exports.auth = async (req, res, next) => {
    try {
        // extract JWT token
        // sirf cookie se — na body, na header
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token Missing',
            });
        }

        // verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);

            const user = await User.findById(decode.Id).select("-password");

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User belonging to this token no longer exists',
                });
            }

            if (user.status !== "Active") {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is not active. Contact your admin.',
                });
            }

            req.user = user;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'token is invalid',
            });
        }

        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong, while verifying the token',
            error: error.message,
        });
    }
};


// login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // verify password & generate a JWT token
        if (await bcrypt.compare(password, user.password)) {
            // password match

            if (user.status !== "Active") {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is not active. Contact your admin.',
                });
            }

            const token = generateToken(user._id);

            user.lastLogin = new Date();
            await user.save();

            res.cookie("token", token, cookieOptions).status(200).json({
                success: true,
                message: 'User Logged in successfully',
                user: {
                    id: user._id,
                    employeeId: user.employeeId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    company: user.company,
                },
            });
        }
        else {
            // password do not match
            return res.status(403).json({
                success: false,
                message: "Password Incorrect",
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Login Failure',
            error: error.message,
        });
    }
};


// getMe

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while fetching profile',
            error: error.message,
        });
    }
};


// changePassword

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Old password and new password are required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long',
            });
        }

        const user = await User.findById(req.user._id);

        if (await bcrypt.compare(oldPassword, user.password)) {
            // old password match
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Password changed successfully. Please log in again.',
            });
        }
        else {
            // old password do not match
            return res.status(401).json({
                success: false,
                message: "Old Password Incorrect",
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while changing password',
            error: error.message,
        });
    }
};


// logout

exports.logout = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while logging out',
            error: error.message,
        });
    }
};