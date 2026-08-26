const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");  
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





router.post("/", upload.array("attachments", 5), createTask);

router.get("/",  getTasks);

router.get("/:taskId",  getTaskById);


router.put("/:taskId",upload.array("attachments", 5), protect,updateTask);


router.delete("/:taskId", protect, deleteTask);


router.put("/:taskId/assign", protect, assignTask);


router.put("/:taskId/status",protect, changeTaskStatus);


router.put("/:taskId/priority",protect, changePriority);


module.exports = router;


