const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    // companyId stays permanently unique - it should
    // never be reused, even after a company is deleted.
    companyId: {
      type: String,
      required: true,
      unique: true,
    },

    // NOTE: unique: true removed here.
    // Uniqueness is now enforced only among non-deleted
    // companies via the partial index below, so a
    // soft-deleted company's code can be reused.
    companyCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    companyLogo: {
      type: String,
      trim: true,
    },

    companyType: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
    },

    // NOTE: unique: true removed - same reasoning as companyCode.
    officialEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    addressLine1: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },

    // NOTE: unique: true removed. A pincode being globally
    // unique across every company doesn't make sense anyway
    // (two unrelated companies can share the same postal code) -
    // see the explanation below the code block.
    pincode: {
      type: String,
      trim: true,
    },

    timeZone: {
      type: String,
      trim: true,
    },

    currency: {
      type: String,
      trim: true,
    },

    workingDays: {
      type: [String],
    },

    officeStartTime: {
      type: String,
      trim: true,
    },

    officeEndTime: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "on leave"],
      trim: true,
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Partial unique indexes: uniqueness is only enforced among
// companies where isDeleted is false. Once a company is soft
// deleted, its companyCode/officialEmail become free again.
CompanySchema.index(
  { companyCode: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);

CompanySchema.index(
  { officialEmail: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      officialEmail: { $type: "string" },
    },
  },
);

// module.exports =
//   mongoose.models.Company || mongoose.model("Company", CompanySchema);

module.exports = mongoose.model("Company", CompanySchema);
