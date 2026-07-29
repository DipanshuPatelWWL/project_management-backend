const mongoose = require ('mongoose ');

const DocumentModel = new mongoose.Schema({

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
        trim : true,    

        },

     createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        trim : true,
     },

     updatedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        trim : true,
     }, 
      

    
}, {timestamps : true});

module.exports = mongoose.model("Document", documentModel);