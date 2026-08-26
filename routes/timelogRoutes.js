
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    createTimeLog,
    getTimeLogs,
    getMyTimeLogs,
    updateTimeLog,
    deleteTimeLog,
    weeklySummary,
    monthlySummary,
} = require("../controllers/timeLogController");


router.post("/", protect ,createTimeLog);


router.get("/", getTimeLogs);


router.get("/my", getMyTimeLogs);


router.get("/summary/weekly",protect , weeklySummary);


router.get("/summary/monthly", protect, monthlySummary);


router.put("/:timeLogId", protect, updateTimeLog);


router.delete("/:timeLogId",protect, deleteTimeLog);


module.exports = router;
