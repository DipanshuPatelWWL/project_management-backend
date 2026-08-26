const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
    createSprint,
    getSprints,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
} = require("../controllers/sprintController");



router.get("/",   getSprints);

router.post("/", protect, createSprint);


router.put("/:sprintId", protect,  updateSprint);


router.delete("/:sprintId", protect,deleteSprint);


router.put("/:sprintId/start", protect, startSprint);


router.put("/:sprintId/complete", protect,completeSprint);

module.exports = router;

