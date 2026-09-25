const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
    {
        isDeleted: {
            type: Boolean,
            default: false,
        },

        // clientId stays permanently unique - never reused,
        // same as companyId.
        clientId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        ClientName: {
            type: String,
            required: true,
            trim: true,
        },

        company: {
            type: String,
            required: true,
            trim: true,
        },

        // NOTE: unique: true removed - enforced only among
        // non-deleted clients via the partial index below.
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },

        // NOTE: unique: true removed - same reasoning.
        phone: {
            type: String,
            required: true,
            trim: true,
        },

        designation: {
            type: String,
            trim: true,
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        country: {
            type: String,
            trim: true,
            default: "India",
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        pincode: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "on-leave"],
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
    }
);

// Partial unique indexes: only enforced among clients where
// isDeleted is false, so a soft-deleted client's email/phone
// become reusable again.
ClientSchema.index(
    { phone: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: false },
    }
);

ClientSchema.index(
    { email: 1 },
    {
        unique: true,
        partialFilterExpression: {
            isDeleted: false,
            email: { $type: "string" },
        },
    }
);

module.exports =
    mongoose.models.Client || mongoose.model("Client", ClientSchema);