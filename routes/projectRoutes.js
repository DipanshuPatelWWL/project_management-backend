const express = require("express");
const router = express.Router();

const {
    createProject,getProjects,getProjectById,updateProject,deleteProject,assignProjectManager,assignTeamLead, assignMembers,
} = require("../controllers/projectController");




router.post("/", createProject);


router.get("/", getProjects);


router.get("/:projectId",  getProjectById);


router.put("/:projectId",  updateProject);


router.delete("/:projectId",  deleteProject);


router.put("/:projectId/assign-manager",  assignProjectManager);


router.put("/:projectId/assign-teamlead", assignTeamLead);


router.put("/:projectId/assign-members",assignMembers);

module.exports = router;