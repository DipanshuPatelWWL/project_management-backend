
const express = require("express");
const router = express.Router();

const {
    createTimeLog,
    getTimeLogs,
    getMyTimeLogs,
    updateTimeLog,
    deleteTimeLog,
    weeklySummary,
    monthlySummary,
} = require("../controllers/timeLogController");


router.post("/", createTimeLog);


router.get("/", getTimeLogs);


router.get("/my", getMyTimeLogs);


router.get("/summary/weekly", weeklySummary);


router.get("/summary/monthly", monthlySummary);


router.put("/:timeLogId", updateTimeLog);


router.delete("/:timeLogId", deleteTimeLog);


module.exports = router;
