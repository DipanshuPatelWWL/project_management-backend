const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema({
    project : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Project",
        trim : true,
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

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        trim : true,

    },

    workDate : {
        type : Date,
        trim : true,

    },
    hoursWorked : {
        type : Number ,
        trim : true,
    },
    Description : {
        type : String,
        trim : true,
    },
},
{timeStamp : true} );

module.exports = mongoose.model("TimeLog", timeLogSchema);
    