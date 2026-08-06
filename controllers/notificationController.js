const Notification = require("../models/notification");


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
            sender : sender || req.user._id,
            receiver,
            project,
            title,
            message,
            type,
        });


        return res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification,
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to create notification",
            error: error.message,
        });
    }

};


// Get Notifications
exports.getNotification = async(req, res) => {

    try {

        const notifications = await Notification.find()
            .populate("sender")
            .populate("receiver")
            .populate("project");


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

exports.getNotificationById = async (req,res) => {
    try {
        const notification = await Notification.findById(req.param.notificationId);

       if(!notification) {
        return res.status(400).json({
        success :false,
        message : "notification not found",
         });
       }
       return res.status(200) .json ({
        success: true,
        message: "notification found",
    });

    } catch (error) {
         return res.status(200) .json ({
        success: true,
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

        await Notification.updateMany(
            {
                receiver: req.user._id,
                isRead: false,
            },
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

        const  notification = await Notification.findById(req.params.notificationId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "meeting not found",
            });
        }

        await meeting.findByIdAndDelete(req.params.notificationId);

        return res.status(200).json({
            success: true,
            message: "notification deleted successfully",
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

        await Notification.deleteMany({
            receiver: req.user._id,
        });

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

