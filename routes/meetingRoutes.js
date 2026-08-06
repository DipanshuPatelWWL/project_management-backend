const express = require("express");
const router = express.Router();

const {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    changeMeetingStatus,
    addMeetingNotes,
    deleteMeeting,
} = require("../controllers/meetingController");



router.post("/", createMeeting);


router.get("/", getMeetings);

router.get("/:meetingId", getMeetingById);


router.put("/:meetingId", updateMeeting);


router.patch("/:meetingId/status", changeMeetingStatus);


router.patch("/:meetingId/notes", addMeetingNotes);

router.delete("/:meetingId", deleteMeeting);


module.exports = router;