const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
    {
        
        companyName : {
            type :string,
            trim : true,

        },
         
        companyCode : {
            type : string,
            required : true,
            unique:true,
            upperCase : true,
        },


        companyLogo : {
            type : string,
            trim : true,

        },
         companyType : {
            type : string,
            trim :true,

         },

         industry : {
            type :string,
            trim :true

         },
         officialEmail :{
            type :string,
            unique:true,
            lowercase :true,
            trim : true,
             
         },

         contactNumber : {
            type : string,
            trim : true,

         },

         website :{
            type : string,
            trim :true,

         },

         adressLine1 :{
            type :string,
            trim :true,

         },

         city : {
            type :string,
            trim :true ,

         },
                state : {
            type : string,
            trim :true,

         },

         country : {
            type :string,
            trim :true

         },
         pincode:{
            type :string,
            unique:true,
            
            trim : true,
             
         },

         timeZone: {
            type : string,
            trim : true,

         },

         currency :{
            type : string,
            trim :true,

         },

         workingDays:{
            type :string,
            trim :true,

         },

         officeStartTime : {
            type :string,
            trim :true ,

         },

         officeEndTime : {
            type :string,
            trim :true

         },
         status:{
            type :string,
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
    {timeStamp :true}
);
module.exports = mongoose.model("Company", CompanySchema);
