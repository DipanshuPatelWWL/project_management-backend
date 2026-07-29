const mongoose = require ("moongoose ");
const Company = require("./Company");

const ProjectSchema = new moongoseSchema(

    {
      projectName : {
            type :string,
            trim : true,

        },
         
        projectCode : {
            type : string,
            trim : true,
        },


         description : {
            type : string,
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
            type :string,
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
            type : string,
            enum :["planning","active","on hold","completed","Cancelled"],
            default : "planning",

         },

         priority :{
            type :string,
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
            type : boolean,
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
 {timeStamp : true}

);
module.export =  mongoose.model("Project",ProjectSchema)