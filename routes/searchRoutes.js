const express = require("express");

const router = express.Router();

const {
    globalSearch,
    searchUsers,
    searchCompanies,
    searchClients,
    searchProjects,
    searchTasks,
    searchBugs,
} = require("../controllers/searchController");

const { protect } = require("../middleware/authMiddleware");


router.get(
    "/",
    protect,
    globalSearch
);

router.get(
    "/users",
    protect,
    searchUsers
);

router.get(
    "/companies",
    protect,
    searchCompanies
);

router.get(
    "/clients",
    protect,
    searchClients
);

router.get(
    "/projects",
    protect,
    searchProjects
);

router.get(
    "/tasks",
    protect,
    searchTasks
);

router.get(
    "/bugs",
    protect,
    searchBugs
);


module.exports = router;