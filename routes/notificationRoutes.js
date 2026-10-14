
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


router.post("/", protect, createNotification);

router.get("/", protect, getNotification);

router.get("/:notificationId", protect, getNotificationById);

router.patch("/read-all", protect, markAllAsRead);

router.patch("/:notificationId/read", protect, markAsRead);

router.delete("/:notificationId", protect, deleteNotification);

router.delete("/", protect, deleteAllNotifications);


module.exports = router;
