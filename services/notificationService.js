const Notification = require("../models/Notification");
const { getIO } = require("../socket/socket");

exports.sendNotification = async ({
    receiver,
    sender = null,
    title,
    message,
    type,
    project = null,
    entityType = null,
    entityId = null,
}) => {
    try {
        const notification = await Notification.create({
            receiver,
            sender,
            title,
            message,
            type,
            project,
            entityType,
            entityId,
            isRead: false,
        });

        const populatedNotification = await Notification.findById(notification._id)
            .populate("sender", "firstName lastName profileImage employeeId")
            .populate("receiver", "firstName lastName profileImage employeeId")
            .populate("project", "projectName projectId");

        try {
            const io = getIO();
            const receiverRoom = `user:${receiver}`;
            io.to([receiverRoom, "superadmin"]).emit("newNotification", populatedNotification);
        } catch (socketErr) {
            console.error("Socket emit notification error:", socketErr.message);
        }

        return populatedNotification;
    } catch (error) {
        console.error("Notification Service Error:", error.message);
        return null;
    }
};