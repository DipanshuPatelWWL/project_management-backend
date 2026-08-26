const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    assignProjectManager,
    assignTeamLead, 
    assignMembers,
} = require("../controllers/projectController");




router.post("/", protect ,createProject);


router.get("/", getProjects);


router.get("/:projectId",  getProjectById);


router.put("/:projectId", protect, updateProject);


router.delete("/:projectId",  deleteProject);


router.put("/:projectId/assign-manager", protect, assignProjectManager);


router.put("/:projectId/assign-teamlead", protect, assignTeamLead);


router.put("/:projectId/assign-members",protect ,assignMembers);

module.exports = router;

