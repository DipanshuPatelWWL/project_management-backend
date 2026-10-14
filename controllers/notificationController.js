const Notification = require("../models/Notification");
const { sendNotificationEmail } = require("../services/emailService");
// Create Notification
exports.createNotification = async(req, res) => {

    try {

        const {
            sender,
            receiver,
            project,
            title,
            message,
            type
        } = req.body;


        if(!receiver || !title || !message || !type) {
            return res.status(400).json({
                success: false,
                message: "Receiver, title, message and type are required",
            });
        }


        const notification = await Notification.create({
            sender: sender || req.user?._id,
            receiver,
            project,
            title,
            message,
            type,
        });

        const populatedNotification = await Notification.findById(notification._id)
            .populate("sender", "firstName lastName email profileImage")
            .populate("receiver", "firstName lastName email profileImage")
            .populate("project", "projectName projectId");

        try {
            const { getIO } = require("../socket/socket");
            const io = getIO();
            io.to([`user:${receiver}`, "superadmin"]).emit("newNotification", populatedNotification);
        } catch (socketErr) {
            console.error("Socket emit notice:", socketErr.message);
        }

        try {
            await sendNotificationEmail(receiver, title, message);
        } catch (mailErr) {
            console.error("Email send notice:", mailErr.message);
        }

        return res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification: populatedNotification,
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to create notification",
            error: error.message,
        });
    }

};


// Get Notifications for logged-in user
exports.getNotification = async(req, res) => {

    try {
        const isSuperAdmin = req.user?.role?.toLowerCase() === "superadmin";
        const filter = isSuperAdmin
            ? {}
            : req.user
            ? { $or: [{ receiver: req.user._id }, { sender: req.user._id }] }
            : {};

        const notifications = await Notification.find(filter)
            .populate("sender", "firstName lastName email profileImage employeeId")
            .populate("receiver", "firstName lastName email profileImage employeeId")
            .populate("project", "projectName projectId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            message: "Notifications fetched successfully",
            notifications,
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
            error: error.message,
        });
    }

};

exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.notificationId)
            .populate("sender", "firstName lastName email profileImage")
            .populate("receiver", "firstName lastName email profileImage")
            .populate("project", "projectName projectId");

        if(!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification found",
            notification,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
 

exports.markAsRead = async(req, res) => {

    try {

        const notification = await Notification.findById(
            req.params.notificationId
        );

        if(!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }


        notification.isRead = true;

        await notification.save();


        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification,
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
            error: error.message,
        });
    }

};

// mark all as read

exports.markAllAsRead = async(req, res) => {

    try {

        const isSuperAdmin = req.user?.role?.toLowerCase() === "superadmin";
        const filter = isSuperAdmin
            ? { isRead: false }
            : {
                receiver: req.user._id,
                isRead: false,
            };

        await Notification.updateMany(
            filter,
            {
                $set: {
                    isRead: true,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read",
            error: error.message,
        });
    }

};

exports.deleteNotification = async (req, res) => {
    try {

        const notification = await Notification.findById(
            req.params.notificationId
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        await Notification.findByIdAndDelete(
            req.params.notificationId
        );

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete notification",
            error: error.message,
        });
    }
};


exports.deleteAllNotifications = async(req, res) => {

    try {

        const isSuperAdmin = req.user?.role?.toLowerCase() === "superadmin";
        const filter = isSuperAdmin ? {} : { receiver: req.user._id };

        await Notification.deleteMany(filter);

        return res.status(200).json({
            success: true,
            message: "All notifications deleted successfully",
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to delete all notifications",
            error: error.message,
        });
    }

};

