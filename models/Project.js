const mongoose = require("mongoose");
const Company = require("./Company");

const ProjectSchema = new mongoose.Schema(

    {
      projectName : {
            type :String,
            trim : true,
         
        },
         
        projectCode : {
            type : String,
            trim : true,
        },


         description : {
            type : String,
            trim : true,

        },
         company : {
            type :  mongoose.Schema.Types.ObjectId,
            ref: "Company",
            trim :true,

         },

         client: {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Client",
            trim :true,

         },
         projectManager :{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            trim : true,
             
         },

         teamLead: {
            type :  mongoose.Schema.Types.ObjectId,
            ref : "User",
            trim : true,

         },

         teamMembers :{
            type :  mongoose.Schema.Types.ObjectId,
            ref : "Client",
            trim :true,

         },

         budget :{
            type : Number,
            trim :true,

         },

         technologies : {
            type :String,
            trim :true ,

         },
           startDate : {
            type : Date,
            trim :true,

    },
        endDate :{
            type : Date,
            trim:true,
             
         },

         deadline: {
            type : Date,
            trim : true,

         },

         status :{
            type : String,
            enum :["planning","active","on hold","completed","Cancelled"],
            default : "planning",

         },

         priority :{
            type :String,
            enum :["low","high","critical","medium"],
            default : "medium",

         },

         progress : {
            type : Number,
            min :0,
            max : 100,
            default : 0,
            

         },
           isAchived : {
            type : Boolean,
            trim : false,

    },
        isActive : {
        type: Boolean,
        default : true,
        
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
 {timeStamps : true}

);
module.exports =  mongoose.model("Project",ProjectSchema)