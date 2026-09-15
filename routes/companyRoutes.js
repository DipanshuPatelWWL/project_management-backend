const express = require("express");

const router = express.Router();

const { createCompany, getCompany, getCompanyById, updateCompany, deleteCompany}
     = require("../controllers/companyController");
 
     const { authorize } = require("../middleware/roleMiddleware");
const { protect } = require("../middleware/authMiddleware");

router.post(
    "/",
    protect,
    authorize("SuperAdmin","Admin"),
    createCompany
);

router.get(
    "/",
    protect,
    authorize("SuperAdmin","Admin"),
    getCompany
);

router.get(
    "/:companyId",
    protect,
    authorize("SuperAdmin","Admin"),
    getCompanyById
);

router.put(
    "/:companyId",
    protect,
    authorize("SuperAdmin","Admin"),
    updateCompany
);

router.delete(
    "/:companyId",
    protect,
    authorize("SuperAdmin","Admin"),
    deleteCompany
);

module.exports = router;