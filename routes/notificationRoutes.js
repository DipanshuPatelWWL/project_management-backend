
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    createNotification,
    getNotification,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
} = require("../controllers/notificationController");


router.post("/", createNotification);

router.get("/", getNotification);

router.get("/:notificationId", getNotificationById);

router.patch("/read-all", markAllAsRead);

router.patch("/:notificationId/read", markAsRead);

router.delete("/:notificationId", protect, deleteNotification);

router.delete("/",protect , deleteAllNotifications);


module.exports = router;
