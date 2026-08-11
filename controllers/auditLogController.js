const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            action,
            user,
            entityType,
            entityId,
            startDate,
            endDate,
        } = req.query;

        const filter = {};

        if (action) {
            filter.action = action;
        }
        if (user) {
            filter.user = user;
        }
        if (entityType) {
            filter.entityType = entityType;
        }
        if (entityId) {
            filter.entityId = entityId;
        }
        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                filter.createdAt.$lte = end;
            }
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .populate("user", "firstName lastName email employeeId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            AuditLog.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch audit logs.",
            error: error.message,
        });
    }
};

exports.getAuditLogById = async (req, res) => {
    try {
        const { auditLogId } = req.params;

        const log = await AuditLog.findById(auditLogId)
            .populate(
                "user",
                "firstName lastName email employeeId role"
            );

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Audit log not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: log,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch audit log.",
            error: error.message,
        });
    }
};


exports.getUserAuditLogs = async (req, res) => {
    try {
        const { userId } = req.params;

        const logs = await AuditLog.find({
            user: userId,
        })
            .populate(
                "user",
                "firstName lastName email employeeId role"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user audit logs.",
            error: error.message,
        });
    }
};


exports.getProjectAuditLogs = async (req, res) => {
    try {
        const { projectId } = req.params;

        const logs = await AuditLog.find({
            entityType: "Project",
            entityId: projectId,
        })
            .populate(
                "user",
                "firstName lastName email employeeId role"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch project audit logs.",
            error: error.message,
        });
    }
};

exports.deleteAuditLog = async (req, res) => {
    try {
        const { auditLogId } = req.params;

        const log = await AuditLog.findById(auditLogId);

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Audit log not found.",
            });
        }

        await log.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Audit log deleted successfully.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete audit log.",
            error: error.message,
        });
    }
};