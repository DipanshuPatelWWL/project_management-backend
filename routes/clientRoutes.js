const express = require("express");

const router = express.Router();

const { createClient, getClient, getClientById, updateClient, deleteClient}
     = require("../controllers/clientController");


router.post("/",  createClient);


router.get("/",  getClient);


router.get("/:clientId",  getClientById);


router.put("/:clientId", updateClient);


router.delete("/:clientId",  deleteClient);

module.exports = router;