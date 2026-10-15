const AuditLog = require("../models/AuditLog");

/**
 * Reusable Audit Log Helper
 * @param {Object} options
 * @param {Object} options.req - Express request object (user, IP, headers)
 * @param {String} [options.userId] - Optional fallback user ID if req.user is not yet attached
 * @param {String} options.module - Module name (e.g., "Auth", "User", "Project", "Task", "Bug")
 * @param {String} options.action - Action name (e.g., "CREATE", "UPDATE", "DELETE", "LOGIN", "STATUS_CHANGE")
 * @param {String} options.description - Human-readable details
 * @param {String} [options.entityType] - Target entity type (e.g., "User", "Project", "Task", "Bug")
 * @param {String} [options.entityId] - Target entity ObjectId
 */
const logAudit = async ({
    req,
    userId,
    module,
    action,
    description,
    entityType,
    entityId,
}) => {
    try {
        let ipAddress = "127.0.0.1";
        let browser = "Unknown";

        if (req) {
            ipAddress =
                req.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
                req.socket?.remoteAddress ||
                req.ip ||
                "127.0.0.1";

            browser = req.headers?.["user-agent"] || "Unknown Browser";
        }

        const effectiveUserId = userId || req?.user?._id || req?.user?.id || null;

        await AuditLog.create({
            user: effectiveUserId,
            module,
            action,
            description,
            entityType,
            entityId,
            ipAddress,
            browser,
        });
    } catch (error) {
        // Non-blocking catch to ensure core business logic never fails due to audit logging
        console.error("Audit log error:", error.message);
    }
};

module.exports = logAudit;
