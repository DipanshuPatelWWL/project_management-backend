const express = require("express");
const router = express.Router();

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask,
    changeTaskStatus,
    changePriority,
} = require("../controllers/taskController");





router.post("/", createTask);


router.get("/",  getTasks);

router.get("/:taskId",  getTaskById);


router.put("/:taskId", updateTask);


router.delete("/:taskId",  deleteTask);


router.put("/:taskId/assign",  assignTask);


router.put("/:taskId/status", changeTaskStatus);


router.put("/:taskId/priority", changePriority);


module.exports = router;