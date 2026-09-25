const Notification = require("../models/Notification");
const { getIO } = require("../socket/socket");

exports.sendNotification = async ({
    receiver,
    sender = null,
    title,
    message,
    type,
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
            entityType,
            entityId,
            isRead: false,
        });

        const populatedNotification =
            await Notification.findById(
                notification._id
            )
                .populate(
                    "sender",
                    "firstName lastName profileImage"
                )
                .populate(
                    "receiver",
                    "firstName lastName profileImage"
                );

        const io = getIO();

        const receiverRoom =
            `user:${receiver}`;
        io.to(receiverRoom).emit(
            "newNotification",
            populatedNotification
        );
        return populatedNotification;
    } catch (error) {
        console.error(
            "Notification Service Error:",
            error.message
        );
        throw error;
    }
};