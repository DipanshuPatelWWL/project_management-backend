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


router.post("/", protect, createProject);


router.get("/", protect, getProjects);


router.get("/:projectId", protect, getProjectById);


router.put("/:projectId", protect, updateProject);


// FIX: protect was missing here - this let anyone delete any project
// with no login at all, and would have crashed once soft delete needed
// req.user._id for updatedBy.

router.delete("/:projectId", protect, deleteProject);


router.put("/:projectId/assign-manager", protect, assignProjectManager);


router.put("/:projectId/assign-teamlead", protect, assignTeamLead);


router.put("/:projectId/assign-members", protect, assignMembers);

module.exports = router;