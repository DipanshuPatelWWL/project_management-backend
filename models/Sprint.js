const mongoose = require("mongoose");

const SprintSchema = new mongoose.Schema(
    {
        sprintName : {
            type :String,
            trim : true,
        },
       sprintgoal:{
            type : String,
            trim : true,
        },
         
        project : {
            type :  mongoose.Schema.Types.ObjectId,
            ref: "Project",
            trim :true,
       },

       startDate : {
            type : Date,
            trim :true,
        },
        endDate : {
            type : Date,
            trim:true,
        },
        status:{
            type :String,
            enum :["active" ,"completed","cancelled","planning"],
            default:"planning",
        },
        progress :{
            type : Number,
            min : 0,
            max: 100,
            default : 0,

        },
        totalTasks :{
            type : Number,
            min : 0,
        },
        completedTasks :{
            type : Number,  
            trim : true,
        },
        totalStoryPoints : {
            type : Number,
            
        },
        completedStoryPoints :{
            type : Number,
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

 {timeStamps :true}
    );
    module.exports = mongoose.model("Sprint", SprintSchema);
    