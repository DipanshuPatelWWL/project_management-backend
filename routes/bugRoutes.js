const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    createBug,
    getBugs,
    getBugById,
    updateBug,
    deleteBug,
    assignBug,
    changeBugStatus,
    getNextBugId,
} = require("../controllers/bugController");

router.post("/", protect, upload.array("attachments", 5), createBug);
router.get("/next-id", protect, getNextBugId);
router.get("/", protect, getBugs);
router.get("/:bugId", protect, getBugById);
router.put("/:bugId", protect, upload.array("attachments", 5), updateBug);
router.delete("/:bugId", protect, deleteBug);
router.put("/:bugId/assign", protect, assignBug);
router.put("/:bugId/status", protect, changeBugStatus);

module.exports = router;