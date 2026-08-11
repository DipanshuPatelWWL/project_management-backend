const express = require("express");

const router = express.Router();

const {
    getAuditLogs,
    getAuditLogById,
    getUserAuditLogs,
    getProjectAuditLogs,
    deleteAuditLog,
} = require("../controllers/auditLogController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");


router.get(
    "/",
    protect,
    authorize("SuperAdmin", "Admin"),
    getAuditLogs
);

router.get(
    "/:auditLogId",
    protect,
    authorize("SuperAdmin", "Admin"),
    getAuditLogById
);

router.get(
    "/user/:userId",
    protect,
    authorize("SuperAdmin", "Admin"),
    getUserAuditLogs
);

router.get(
    "/project/:projectId",
    protect,
    authorize(
        "SuperAdmin",
        "Admin",
        "ProjectManager"
    ),
    getProjectAuditLogs
);


router.delete(
    "/:auditLogId",
    protect,
    authorize("SuperAdmin"),
    deleteAuditLog
);


module.exports = router;