const mongoose = require ("mongoose ");

const NotificationSchema = new mongoose.Schema({

    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        trim : true,
    },

    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        trim : true,
    },

    project : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Project",
        trim : true,
    },

    title : {
        type : String,
        trim : true,    
    },

    message : {
        type : String,
        trim : true,    
    },  

     type : {
        type : String,
        enum : ["task","bug","meeting","project","general"],
         
     },

     isRead : {
        type : Boolean,
        default : false,
     }, 

},
{timestamps : true});

module.exports = mongoose.model("Notification", notificationSchema);