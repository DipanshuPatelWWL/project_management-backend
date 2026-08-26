const Company = require("../models/Company");
const Client = require("../models/Client");
const User = require("../models/User");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const Task = require("../models/Task");
const Bug = require("../models/Bug");
const Meeting = require("../models/Meeting");
const Document = require("../models/Document");
const TimeLog = require("../models/TimeLog");


exports.getSuperAdminDashboard = async (req, res) => {
    try {

        // Total companies
        const totalCompanies = await Company.countDocuments();

        // Total Clients
        const totalClients = await Client.countDocuments();

        // Total Users
        const totalUsers = await User.countDocuments();

        // Active Users
        const activeUsers = await User.countDocuments({
            isActive: true,
        });

        // Total Projects
        const totalProjects = await Project.countDocuments();

        // Active Projects
        const activeProjects = await Project.countDocuments({
            status: "active",
        });

        // Completed Projects
        const completedProjects = await Project.countDocuments({
            status: "completed",
        });

        // Total Sprints
        const totalSprints = await Sprint.countDocuments();

        // Active Sprints
        const activeSprints = await Sprint.countDocuments({
            status: "active",
        });

        // Total Tasks
        const totalTasks = await Task.countDocuments();

        // Completed Tasks
        const completedTasks = await Task.countDocuments({
            status: "completed",
        });

        // Pending Tasks
        const pendingTasks = await Task.countDocuments({
            status: {
                $ne: "completed",
            },
        });

        // Total Bugs
        const totalBugs = await Bug.countDocuments();

        // Open Bugs
        const openBugs = await Bug.countDocuments({
            status: "open",
        });

        // Closed Bugs
        const closedBugs = await Bug.countDocuments({
            status: "closed",
        });

        // Total Meetings
        const totalMeetings = await Meeting.countDocuments();

        // Total Documents
        const totalDocuments = await Document.countDocuments();

        // Total Time Logs
        const totalTimeLogs = await TimeLog.countDocuments();

        // Return Dashboard Data
        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard: {
                totalCompanies,
                totalClients,

                totalUsers,
                activeUsers,

                totalProjects,
                activeProjects,
                completedProjects,

                totalSprints,
                activeSprints,

                totalTasks,
                completedTasks,
                pendingTasks,

                totalBugs,
                openBugs,
                closedBugs,

                totalMeetings,
                totalDocuments,
                totalTimeLogs,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};


exports.getAdminDashboard = async (req, res) => {
    try {

        // Total Users
        const totalUsers = await User.countDocuments();

        // Total Projects
        const totalProjects = await Project.countDocuments();

        // Total Tasks
        const totalTasks = await Task.countDocuments();

        // Total Bugs
        const totalBugs = await Bug.countDocuments();

        // Return Dashboard Data
        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard: {
                totalUsers,
                totalProjects,
                totalTasks,
                totalBugs,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};


exports.getProjectManagerDashboard = async (req, res) => {
    try {

        // Get projectId
        const { projectId } = req.params;

        // My project
        const myProject = await Project.countDocuments({
            _id: projectId,
        });

        // Active sprints
        const activeSprints = await Sprint.countDocuments({
            project: projectId,
            status: "active",
        });

        // Team members
        const project = await Project.findById(projectId);

        const teamMembers = project && project.teamMembers
            ? project.teamMembers.length
            : 0;

        // Pending tasks
        const pendingTasks = await Task.countDocuments({
            project: projectId,
            status: {
                $ne: "completed",
            },
        });

        // Open bugs
        const openBugs = await Bug.countDocuments({
            project: projectId,
            status: "open",
        });

        // Upcoming meetings
        const upcomingMeetings = await Meeting.countDocuments({
            project: projectId,
            status: "scheduled",
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard: {
                myProject,
                activeSprints,
                teamMembers,
                pendingTasks,
                openBugs,
                upcomingMeetings,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};


exports.getTeamLeadDashboard = async (req, res) => {
    try {

        // My team
        const myTeam = await Project.countDocuments({
            teamLead: req.user._id,
        });

        // My Sprint
        const mySprint = await Sprint.countDocuments({
            status: "active",
        });

        // Pending Review
        const pendingReview = await Task.countDocuments({
            assignedBy: req.user._id,
            status: "completed",
        });

        // Assigned Tasks
        const assignedTasks = await Task.countDocuments({
            assignedTo: req.user._id,
        });

        // Bugs
        const bugs = await Bug.countDocuments({
            assignedTo: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard: {
                myTeam,
                mySprint,
                pendingReview,
                assignedTasks,
                bugs,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};


exports.getDeveloperDashboard = async (req, res) => {
    try {

        // My tasks
        const myTasks = await Task.countDocuments({
            assignedTo: req.user._id,
        });

        // Today's tasks
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        const todaysTasks = await Task.countDocuments({
            assignedTo: req.user._id,
            dueDate: {
                $gte: startOfToday,
                $lt: startOfTomorrow,
            },
        });

        // Pending tasks
        const pendingTasks = await Task.countDocuments({
            assignedTo: req.user._id,
            status: "in-progress",
        });

        // Completed tasks
        const completedTasks = await Task.countDocuments({
            assignedTo: req.user._id,
            status: "completed",
        });

        // My bugs
        const myBugs = await Bug.countDocuments({
            assignedTo: req.user._id,
        });

        // Time logged
        const timeLogged = await TimeLog.countDocuments({
            user: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard: {
                myTasks,
                todaysTasks,
                pendingTasks,
                completedTasks,
                myBugs,
                timeLogged,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};


exports.getQADashboard = async (req, res) => {
    try {

        // Assigned bugs
        const assignedBugs = await Bug.countDocuments({
            assignedTo: req.user._id,
        });

        // Open bugs
        const openBugs = await Bug.countDocuments({
            status: "open",
        });

        // Fixed bugs
        const fixedBugs = await Bug.countDocuments({
            status: "resolved",
        });

        // Retesting bugs
        const retestingBugs = await Bug.countDocuments({
            status: "reopened",
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard: {
                assignedBugs,
                openBugs,
                fixedBugs,
                retestingBugs,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};


exports.getClientDashboard = async (req, res) => {
    try {

        // Get projectId
        const { projectId } = req.params;

        // My project
        const myProjects = await Project.countDocuments({
            _id: projectId,
        });

        // Project progress
        const projectProgress = await Project.countDocuments({
            _id: projectId,
            progress: {
                $gte: 0,
                $lte: 100,
            },
        });

        // Total documents
        const totalDocuments = await Document.countDocuments();

        // Total meetings
        const totalMeetings = await Meeting.countDocuments();

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard: {
                myProjects,
                projectProgress,
                totalDocuments,
                totalMeetings,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};