const AuditLog = require("../models/AuditLog");
const User = require("../models/User");

exports.getAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            action,
            user,
            entityType,
            entityId,
            startDate,
            endDate,
        } = req.query;
    
        const conditions = [];

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");
            const matchedUsers = await User.find({
                $or: [
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { email: searchRegex },
                    { employeeId: searchRegex },
                ],
            }).select("_id");
            const matchedUserIds = matchedUsers.map((u) => u._id);

            conditions.push({
                $or: [
                    { description: searchRegex },
                    { module: searchRegex },
                    { action: searchRegex },
                    { ipAddress: searchRegex },
                    { browser: searchRegex },
                    ...(matchedUserIds.length ? [{ user: { $in: matchedUserIds } }] : []),
                ],
            });
        }
    
        if (action) {
            conditions.push({ action });
        }
        if (user) {
            conditions.push({ user });
        }
        if (entityType) {
            conditions.push({
                $or: [{ entityType: entityType }, { module: entityType }],
            });
        }
        if (entityId) {
            conditions.push({ entityId });
        }
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            conditions.push({ createdAt: dateFilter });
        }

        const filter = conditions.length > 0 ? { $and: conditions } : {};

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