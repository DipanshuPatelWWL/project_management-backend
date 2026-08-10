const mongoose = require ("mongoose");

const MeetingSchema = new mongoose.Schema(
    {
        meetingTitle : {  
            type :String,
            required:true,

        },

        project :{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Project",
            trim : true,
        },

        agenda : {
            type : String,
            trim : true,
        },

        description : {
            type : String,
            trim : true,    
        },

        participants : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            trim : true,
        },

        meetingDate : {
            type : Date,
            trim : true,
        },  

        startTime : {
            type : String,
            trim : true,
        },      

        endTime : {
            type : String,
            trim : true,
        },      

        meetingLink : {
            type : String,  
            trim : true,
        },

        meetingNotes : {
            type : String,
            trim : true,    
        },

        status : {
            type : String,
            enum : ["scheduled", "in-progress", "completed", "cancelled"],
            default : "scheduled",
        },
        
        createdBy: {
            type : mongoose.Schema.Types.ObjectId,
            ref :"User",
            trim : true,
        },

        updatedBy:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",   
        },

    },

    {timestamps : true}

    );
module.exports =
    mongoose.models.Meeting ||
    mongoose.model("Meeting", MeetingSchema);