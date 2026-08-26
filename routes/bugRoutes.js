const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


const {
    createBug,
    getBugs,
    updateBug,
    deleteBug,
    assignBug,
    changeBugStatus,
} = require("../controllers/bugController");



router.post("/", upload.array("attachments", 5), createBug);

router.get("/", getBugs);


router.put("/:bugId", protect, updateBug);


router.delete("/:bugId", protect, deleteBug);


router.put("/:bugId/assign", protect, assignBug);


router.put("/:bugId/status", protect, changeBugStatus);


module.exports = router;