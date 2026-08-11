const express = require("express");

const router = express.Router();

const {
    projectReport,
    sprintReport,
    employeeReport,
    taskReport,
    bugReport,
    timeLogReport,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get(
    "/project/:projectId",
    protect,
    authorize("SuperAdmin", "Admin", "ProjectManager"),
    projectReport
);

router.get(
    "/sprint/:sprintId",
    protect,
    authorize("SuperAdmin", "Admin", "ProjectManager", "TeamLead"),
    sprintReport
);

router.get(
    "/employee/:employeeId",
    protect,
    authorize("SuperAdmin", "Admin", "ProjectManager", "TeamLead"),
    employeeReport
);

router.get(
    "/tasks",
    protect,
    authorize("SuperAdmin", "Admin", "ProjectManager", "TeamLead"),
    taskReport
);

router.get(
    "/bugs",
    protect,
    authorize("SuperAdmin", "Admin", "ProjectManager", "TeamLead", "QA"),
    bugReport
);

router.get(
    "/timelogs",
    protect,
    authorize("SuperAdmin", "Admin", "ProjectManager", "TeamLead"),
    timeLogReport
);

module.exports = router;