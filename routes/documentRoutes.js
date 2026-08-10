const express = require("express");
const router = express.Router();

const {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    downloadDocument,
} = require("../controllers/documentController");





router.post("/", createDocument);


router.get("/",  getDocuments);

router.get("/:documentId",  getDocumentById);


router.put("/:documentId", updateDocument);


router.delete("/:documentId",  deleteDocument);

router.get("/:documentId/download", downloadDocument);

module.exports = router;