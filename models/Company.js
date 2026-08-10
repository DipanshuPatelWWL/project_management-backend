const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
    {
        
        companyName : {
            type :String,
            trim : true,

        },
         
        companyCode : {
            type : String,
            required : true,
            unique:true,
            upperCase : true,
        },


        companyLogo : {
            type : String,
            trim : true,

        },
         companyType : {
            type : String,
            trim :true,

         },

         industry : {
            type :String,
            trim :true

         },
         officialEmail :{
            type :String,
            unique:true,
            lowercase :true,
            trim : true,
             
         },

         contactNumber : {
            type : String,
            trim : true,

         },

         website :{
            type : String,
            trim :true,

         },

         adressLine1 :{
            type :String,
            trim :true,

         },

         city : {
            type :String,
            trim :true ,

         },
                state : {
            type : String,
            trim :true,

         },

         country : {
            type :String,
            trim :true

         },
         pincode:{
            type :String,
            unique:true,
            trim : true,
             
         },

         timeZone: {
            type : String,
            trim : true,

         },

         currency :{
            type : String,
            trim :true,

         },

         workingDays:{
            type :String,
            trim :true,

         },

         officeStartTime : {
            type :String,
            trim :true ,

         },

         officeEndTime : {
            type :String,
            trim :true

         },
         status:{
            type :String,
            enum :["active" ,"inactive", "on leave"],
            trim: true,
             
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
    

module.exports = mongoose.models.Company || mongoose.model("Company", CompanySchema);