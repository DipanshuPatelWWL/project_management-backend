
const Document = require("../models/Document");

// Generate permanent sequential Document ID (e.g. DOC001, DOC002)
const generateDocumentId = async () => {
    const documents = await Document.find({
        documentId: { $exists: true, $ne: "" },
    }).select("documentId");

    let highestNumber = 0;

    documents.forEach((d) => {
        if (d.documentId) {
            const number = parseInt(d.documentId.replace("DOC", ""), 10);
            if (!isNaN(number) && number > highestNumber) {
                highestNumber = number;
            }
        }
    });
  
    const nextNumber = highestNumber + 1;
    return `DOC${String(nextNumber).padStart(3, "0")}`;
};

exports.getNextDocumentId = async (req, res) => {
    try {
        const nextDocumentId = await generateDocumentId();
        return res.status(200).json({
            success: true,
            nextDocumentId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate document ID",
            error: error.message,
        });
    }
};

exports.createDocument = async(req,res) => {

    try{
        const {
            documentId,
            documentName,
            project,
            category,
            fileUrl,
            fileType,
            fileSize,
            version,
            
        } = req.body;
      
        if(!documentName || !project) {
            return res.status(400).json({
                success:false, 
                message : "fill required fields"
            });
        }

        
        if(documentName){
            const existingDocumentName = await Document.findOne({
                documentName,
            });


            if(existingDocumentName) {
                return res.status(400).json({
                    success:false,
                    message : "document already exists "
                });
            }
        }

        const nextDocId = documentId || (await generateDocumentId());

        const document = await Document.create({
            documentId: nextDocId,
            documentName,
            project,
            category,
            fileUrl,
            fileType,
            fileSize,
            version,
            uploadedBy : req.user._id,
            createdBy : req.user._id,
            updatedBy : req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "document created successfully",
            document,
        });

    } catch (error){
        return res.status(500).json({
            success: false,
            message: "Failed to create document",
            error: error.message,
        });
    }
 
};


exports.getDocuments = async(req,res) => {
     
    try { 
         
        const documents = await Document.find()
            .populate("project", "projectName projectId")
            .populate("uploadedBy", "firstName lastName email")
            .populate("createdBy", "firstName lastName email")
            .sort({ createdAt: -1 });

        // Auto backfill documentId for existing documents if missing
        for (let i = 0; i < documents.length; i++) {
            if (!documents[i].documentId) {
                const autoId = `DOC${String(i + 1).padStart(3, "0")}`;
                documents[i].documentId = autoId;
                Document.updateOne({ _id: documents[i]._id }, { documentId: autoId }).exec().catch(() => {});
            }
        }

        return res.status(200).json({
            success: true,
            count: documents.length,
            message: "document fetched successfully",
            documents,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch document data",
            error: error.message,
        });
    }

};


exports.getDocumentById = async(req,res) => {  

    try {

        const document = await Document.findById(req.params.documentId)
            .populate("project", "projectName projectId")
            .populate("uploadedBy", "firstName lastName email")
            .populate("createdBy", "firstName lastName email");
     
        if(!document){ 
            return res.status(404).json({
                success :false,
                message : "document not found",
            });
        }
   
        return res.status(200).json({
            success: true,
            message: "document found",
            document,
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch document",
            error: error.message,
        });
    }
};


exports.updateDocument = async(req,res) => {

    try {

        const {
            documentName,
            project,
            category,
            fileUrl,
            fileType,
            fileSize,
            version,
        } = req.body;

        const document = await Document.findById(req.params.documentId);

        if(!document) {
            return res.status(404).json({
                success: false,
                message: "document not found",
            });
        }

        if(documentName) {
            const existingDocumentName = await Document.findOne({
                documentName,
                _id: { $ne: req.params.documentId },
            });

            if(existingDocumentName) {
                return res.status(400).json({
                    success: false,
                    message: "document already exists",
                });
            }
        }

        document.documentName = documentName || document.documentName;
        document.project = project || document.project;
        document.category = category || document.category;
        document.fileUrl = fileUrl || document.fileUrl;
        document.fileType = fileType || document.fileType;
        document.fileSize = fileSize || document.fileSize;
        document.version = version || document.version;

        document.updatedBy = req.user._id;

        await document.save();

        return res.status(200).json({
            success: true,
            message: "document updated successfully",
            document,
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to update document",
            error: error.message,
        });
    }
};


exports.deleteDocument = async(req,res) => {

    try {

        const document = await Document.findById(req.params.documentId);

        if(!document) {
            return res.status(404).json({
                success: false,
                message: "document not found",
            });
        }

        await Document.findByIdAndDelete(req.params.documentId);

        return res.status(200).json({
            success: true,
            message: "document deleted successfully",
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to delete document",
            error: error.message,
        });
    }
};


exports.downloadDocument = async(req,res) => {

    try {

        const document = await Document.findById(req.params.documentId);

        if(!document) {
            return res.status(404).json({
                success: false,
                message: "document not found",
            });
        }

        if(!document.fileUrl) {
            return res.status(404).json({
                success: false,
                message: "document file not found",
            });
        }

        return res.download(document.fileUrl, document.documentName);

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to download document",
            error: error.message,
        });
    }
};

