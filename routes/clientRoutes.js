const express = require("express");
 
const { authMiddleware } = require("../middleware/authMiddleware");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

const { createClient, getClient, getClientById, updateClient, deleteClient}
     = require("../controllers/clientController");



router.post("/", protect, createClient);
router.get("/", getClient);
router.get("/:clientId", getClientById);
router.put("/:clientId", protect, updateClient);
router.delete("/:clientId", deleteClient);

module.exports = router;