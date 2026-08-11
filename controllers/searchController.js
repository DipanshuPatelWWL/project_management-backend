const User = require("../models/User");
const Company = require("../models/Company");
const Client = require("../models/Client");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Bug = require("../models/Bug");


exports.globalSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required.",
            });
        }

        const search = q.trim();

        const regex = new RegExp(search, "i");

        const [
            users,
            companies,
            clients,
            projects,
            tasks,
            bugs,
        ] = await Promise.all([

            User.find({
                isDeleted: false,
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { email: regex },
                    { employeeId: regex },
                ],
            })
                .select("-password")
                .limit(10),

            Company.find({
                $or: [
                    { companyName: regex },
                    { email: regex },
                ],
            }).limit(10),

            Client.find({
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { email: regex },
                    { companyName: regex },
                ],
            }).limit(10),

            Project.find({
                $or: [
                    { projectName: regex },
                    { description: regex },
                ],
            }).limit(10),

            Task.find({
                $or: [
                    { taskName: regex },
                    { title: regex },
                    { description: regex },
                ],
            }).limit(10),
            Bug.find({
                $or: [
                    { title: regex },
                    { description: regex },
                ],
            }).limit(10),
        ]);

        return res.status(200).json({
            success: true,
            query: search,
            data: {
                users,
                companies,
                clients,
                projects,
                tasks,
                bugs,
            },
            counts: {
                users: users.length,
                companies: companies.length,
                clients: clients.length,
                projects: projects.length,
                tasks: tasks.length,
                bugs: bugs.length,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Global search failed.",
            error: error.message,
        });
    }
};


exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required.",
            });
        }

        const regex = new RegExp(q.trim(), "i");

        const users = await User.find({
            isDeleted: false,
            $or: [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { employeeId: regex },
            ],
        })
            .select("-password")
            .populate("company", "companyName")
            .limit(50);

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User search failed.",
            error: error.message,
        });
    }
};


exports.searchCompanies = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required.",
            });
        }

        const regex = new RegExp(q.trim(), "i");

        const companies = await Company.find({
            $or: [
                { companyName: regex },
                { email: regex },
            ],
        }).limit(50);

        return res.status(200).json({
            success: true,
            count: companies.length,
            data: companies,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Company search failed.",
            error: error.message,
        });
    }
};


exports.searchClients = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required.",
            });
        }

        const regex = new RegExp(q.trim(), "i");

        const clients = await Client.find({
            $or: [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { companyName: regex },
            ],
        }).limit(50);

        return res.status(200).json({
            success: true,
            count: clients.length,
            data: clients,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Client search failed.",
            error: error.message,
        });
    }
};


exports.searchProjects = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required.",
            });
        }

        const regex = new RegExp(q.trim(), "i");

        const projects = await Project.find({
            $or: [
                { projectName: regex },
                { description: regex },
            ],
        })
            .populate("company", "companyName")
            .populate("client", "firstName lastName email")
            .limit(50);

        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Project search failed.",
            error: error.message,
        });
    }
};


exports.searchTasks = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required.",
            });
        }

        const regex = new RegExp(q.trim(), "i");

        const tasks = await Task.find({
            $or: [
                { taskName: regex },
                { title: regex },
                { description: regex },
            ],
        })
            .populate("project", "projectName")
            .limit(50);

        return res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Task search failed.",
            error: error.message,
        });
    }
};


exports.searchBugs = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required.",
            });
        }
        const regex = new RegExp(q.trim(), "i");

        const bugs = await Bug.find({
            $or: [
                { title: regex },
                { description: regex },
            ],
        })
            .populate("project", "projectName")
            .limit(50);

        return res.status(200).json({
            success: true,
            count: bugs.length,
            data: bugs,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Bug search failed.",
            error: error.message,
        });
    }
};