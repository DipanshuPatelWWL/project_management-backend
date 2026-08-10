const express = require("express");

const router = express.Router();

const {
    createSprint,
    getSprints,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
} = require("../controllers/sprintController");



router.get("/",  getSprints);


router.put("/:sprintId",  updateSprint);


router.delete("/:sprintId", deleteSprint);


router.put("/:sprintId/start", startSprint);


router.put("/:sprintId/complete", completeSprint);

module.exports = router;

