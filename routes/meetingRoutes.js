const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    changeMeetingStatus,
    addMeetingNotes,
    deleteMeeting,
} = require("../controllers/meetingController");



router.post("/", protect, createMeeting);


router.get("/", getMeetings);

router.get("/:meetingId", getMeetingById);


router.put("/:meetingId", protect,updateMeeting);


router.patch("/:meetingId/status",protect, changeMeetingStatus);


router.patch("/:meetingId/notes", protect, addMeetingNotes);

router.delete("/:meetingId", protect, deleteMeeting);


module.exports = router;