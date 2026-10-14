const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({

    documentId: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true,
    },

    documentName : {
        type : String,
        required : true,
    },

    project : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Project",
        trim : true,
    },

    category : {
        type : String,
        trim : true,
    },

    fileUrl : {
        type : String,
        trim : true,
    },

    fileType : {
        type : String,
        trim : true,
    },

    fileSize : {
        type : String,
        trim : true,
    },

    version : {
        type : String,
        trim : true,
    },

    uploadedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },

    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },

    updatedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },

}, { timestamps : true });

module.exports =
    mongoose.models.Document ||
    mongoose.model("Document", DocumentSchema);