const mongoose = require("mongoose");

const BugSchema = new mongoose.Schema(
    {
        bugTitle: {
            type: String,
            required: true,
            trim: true
        },

        description : {
            type : String,
            trim : true,
        },

        project : {
            type :mongoose.Schema.Types.ObjectId,
            ref : "Project",
        trim: true,
        },

        sprint : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Sprint",
            trim : true,
        },      
        task : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Task",
            trim : true,
        },
        reportedBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",           
        },
        assignedTo : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            trim : true,
        },
        severity : {
            type : String,
            enum : ["low", "medium", "high", "critical"],
        },
        priority : {
            type : String,
            enum : ["low", "medium", "high", "critical"],   
        },
        status : {
            type : String,
            enum : ["open", "in-progress", "resolved", "closed","reopened"],
                default : "open",
        },
        stepsToReproduce : {
            type : String,
            trim : true,    

    },

        expectedResult : {
            type : String,
            trim : true,
        },

        actualResult : {
            type : String,
            trim : true,
        },  

        attachments : {
            type : [String],
        },

        resolvedDate : {
            type : Date,
        },



        createdBy: {
            type : mongoose.Schema.Types.ObjectId,
            ref :"User",            
        },
        updatedBy:{
            type : mongoose.Schema.Types.ObjectId,      
             ref : "User",
        },
    },
    {timestamps : true}
);

module.exports = mongoose.model("Bug", BugSchema);