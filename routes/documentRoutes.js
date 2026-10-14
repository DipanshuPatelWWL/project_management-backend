const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    createDocument,
    getDocuments,
    getNextDocumentId,
    getDocumentById,
    updateDocument,
    deleteDocument,
    downloadDocument,
} = require("../controllers/documentController");





router.post("/", protect ,createDocument);


router.get("/",  getDocuments);

router.get("/next-id", protect, getNextDocumentId);

router.get("/:documentId",  getDocumentById);


router.put("/:documentId", protect ,updateDocument);


router.delete("/:documentId",  deleteDocument);

router.get("/:documentId/download", protect, downloadDocument);

module.exports = router;


