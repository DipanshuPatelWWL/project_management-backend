const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         trim: true,
      },
      module: {
         type: String,
         trim: true,
      },
      action: {
         type: String,
         trim: true,
      },
      description: {
         type: String,
         trim: true,
      },
      entityType: {
         type: String,
         trim: true,
      },
      entityId: {
         type: mongoose.Schema.Types.ObjectId,
      },
      ipAddress: {
         type: String,
         trim: true,
      },
      browser: {
         type: String,
         trim: true,
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);