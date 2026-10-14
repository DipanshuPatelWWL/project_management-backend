const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    createTimeLog,
    getTimeLogs,
    getTimeLogById,
    getNextTimeLogId,
    getMyTimeLogs,
    updateTimeLog,
    deleteTimeLog,
    weeklySummary,
    monthlySummary,
} = require("../controllers/timelogController");

router.post("/", protect, createTimeLog);
router.get("/", getTimeLogs);
router.get("/next-id", getNextTimeLogId);
router.get("/my", protect, getMyTimeLogs);
router.get("/summary/weekly", protect, weeklySummary);
router.get("/summary/monthly", protect, monthlySummary);
router.get("/:timeLogId", getTimeLogById);
router.put("/:timeLogId", protect, updateTimeLog);
router.delete("/:timeLogId", protect, deleteTimeLog);

module.exports = router;
