const express = require("express");

const router = express.Router();

const { createCompany, getCompany, getCompanyById, updateCompany, deleteCompany}
     = require("../controllers/companyController");
 
     const { authorize } = require("../middleware/roleMiddleware");
const { protect } = require("../middleware/authMiddleware");

router.post(
    "/",
    protect,
    authorize("SuperAdmin","admin"),
    createCompany
);

router.get(
    "/",
    protect,
    authorize("SuperAdmin","admin"),
    getCompany
);

router.get(
    "/:companyId",
    protect,
    authorize("SuperAdmin","admin"),
    getCompanyById
);

router.put(
    "/:companyId",
    protect,
    authorize("SuperAdmin","admin"),
    updateCompany
);

router.delete(
    "/:companyId",
    protect,
    authorize("SuperAdmin","admin"),
    deleteCompany
);

module.exports = router;