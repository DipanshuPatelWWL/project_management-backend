const mongoose = require ("mongoose");

const MeetingSchema = new mongoose.Schema(
    {
        meetingId: {
            type: String,
            unique: true,
            sparse: true,
            uppercase: true,
            trim: true,
        },

        meetingTitle : {  
            type :String,
            required:true,

        },
    
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            trim: true,
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            trim: true,
        },
    
        agenda: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
            trim: true,    
        },
    
        participants: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            trim: true,
        },

        meetingDate: {
            type: Date,
            trim: true,
        },  

        startTime: {
            type: String,
            required: true,
            trim: true,
        },      

        endTime: {
            type: String,
            required: true,
            trim: true,
        },      

        meetingType : {
            type : String,
            trim : true,
            default : "Video Call",
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