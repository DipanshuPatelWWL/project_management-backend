const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

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

router.get("/team-lead", protect,getTeamLeadDashboard);

router.get("/developer", protect, getDeveloperDashboard);

router.get("/qa", protect,  getQADashboard);

router.get("/client", getClientDashboard);


module.exports = router;