const fs = require("fs");
const path = require("path");

exports.getFileDetails = (file) => {
    if (!file) return null;

    return {
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        originalName: file.originalname,
    };
};

exports.deleteFile = (fileUrl) => {
    try { 
        if (!fileUrl) return;
        const filePath = path.join(__dirname, "..", fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
              console.log(`File deleted: ${fileUrl}`);
        }
    } catch (error) {
       console.error  ("Error deleting file:", error.message);
    }
};