const mongoose = require("mongoose");

const SprintSchema = new mongoose.Schema(
    {
        sprintName : {
            type :string,
            trim : true,
        },
       sprintgoal:{
            type : string,
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
            type :string,
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

 {timeStamp :true}
    );
    module.exports = mongoose.model("Sprint", SprintSchema);
    