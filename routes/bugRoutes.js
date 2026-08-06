const express = require("express");
const router = express.Router();

const {
    createBug,
    getBugs,
    updateBug,
    deleteBug,
    assignBug,
    changeBugStatus,
} = require("../controllers/bugController");



router.post("/", createBug);


router.get("/", getBugs);


router.put("/:bugId", updateBug);


router.delete("/:bugId", deleteBug);


router.put("/:bugId/assign", assignBug);


router.put("/:bugId/status", changeBugStatus);


module.exports = router;