const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema (
    {

        ClientName: {
            type: String,
            required: true,
            trim: true,
        },

        company: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim:true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        designation: {
            type: String,
            trim: true,
        },

        address: {
            type: String,
            required: true,
        },
        status : {
            type : String,
            enum :[ "active" ,"inactive","on-leave" ],
            trim:true,
        },
        createdBy: {
        type : mongoose.Schema.Types.ObjectId,       
          ref :"User",
          trim : true,
        
         },
        
        updatedBy:{
        type : mongoose.Schema.Types.ObjectId,
         ref : "User",
        trim :true,
        
         },
        
    },

    {timeStamps :true}   
);
module.exports = mongoose.models.Client || mongoose.model("Client", ClientSchema);