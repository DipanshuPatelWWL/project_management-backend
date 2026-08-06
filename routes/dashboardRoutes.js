const express = require("express");
const router = express.Router();

const {
    getSuperAdminDashboard,
    getAdminDashboard,
    getProjectManagerDashboard,
    getTeamLeadDashboard,
    getDeveloperDashboard,
    getQADashboard,
    getClientDashboard,
} = require("../controllers/dashboardController");


router.get("/super-admin", getSuperAdminDashboard);

router.get("/admin", getAdminDashboard);

router.get("/project-manager", getProjectManagerDashboard);

router.get("/team-lead", getTeamLeadDashboard);

router.get("/developer", getDeveloperDashboard);

router.get("/qa", getQADashboard);

router.get("/client", getClientDashboard);


module.exports = router;