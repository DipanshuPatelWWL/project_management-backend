exports.authorize = (...roles) => {
    if (!roles.length) {
        throw new Error("No roles provided to authorize middleware.");
    }

    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required.",
                });
            }
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role(s): ${roles.join(", ")}`,
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization failed.",
                error: error.message,
            });
        }
    };
};