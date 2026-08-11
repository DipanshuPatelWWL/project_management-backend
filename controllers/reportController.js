const Project = require("../models/Project");
const Task = require("../models/Task");
const Sprint = require("../models/Sprint");
const Bug = require("../models/Bug");
const TimeLog = require("../models/TimeLog");
const User = require("../models/User");

exports.projectReport = async (req, res) => {
    try {
        const projectId =
            req.params.projectId || req.query.projectId;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required",
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const tasks = await Task.find({
            project: projectId,
        });

        const sprints = await Sprint.find({
            project: projectId,
        });

        const bugs = await Bug.find({
            project: projectId,
        });

        const timeLogs = await TimeLog.find({
            project: projectId,
        });

        const totalTasks = tasks.length;

        const completedTasks = await Task.countDocuments({
            project: projectId,
            status: "completed",
        });

        const pendingTasks = await Task.countDocuments({
            project: projectId,
            status: "pending",
        });

        const totalSprints = sprints.length;

        const completedSprints = await Sprint.countDocuments({
            project: projectId,
            status: "Completed",
        });

        const totalBugs = bugs.length;

        const openBugs = await Bug.countDocuments({
            project: projectId,
            status: "open",
        });

        const resolvedBugs = await Bug.countDocuments({
            project: projectId,
            status: "resolved",
        });

        const totalLoggedHours = timeLogs.reduce(
            (total, log) =>
                total + Number(log.hoursWorked || 0),
            0
        );

        const projectProgress = Number(
            project.progress || 0
        );

        return res.status(200).json({
            success: true,
            message: "Project report generated successfully",

            report: {
                project,

                totalTasks,
                completedTasks,
                pendingTasks,

                totalSprints,
                completedSprints,

                totalBugs,
                openBugs,
                resolvedBugs,

                totalLoggedHours,

                projectProgress,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate project report",
            error: error.message,
        });
    }
};

exports.sprintReport = async (req, res) => {
    try {
        const sprintId =
            req.params.sprintId || req.params.id;

        if (!sprintId) {
            return res.status(400).json({
                success: false,
                message: "Sprint ID is required",
            });
        }
        const sprint = await Sprint.findById(sprintId);

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: "Sprint not found",
            });
        }
        const sprintTasks = await Task.find({
            sprint: sprintId,
        });

        const totalTasks = sprintTasks.length;

        const completedTasks = await Task.countDocuments({
            sprint: sprintId,
            status: "completed",
        });

        const pendingTasks = await Task.countDocuments({
            sprint: sprintId,
            status: "pending",
        });

        const inProgressTasks = await Task.countDocuments({
            sprint: sprintId,
            status: "in-progress",
        });

        const totalStoryPoints = sprintTasks.reduce(
            (total, task) =>
                total + Number(task.storyPoints || 0),
            0
        );

        const completedStoryPoints =
            sprintTasks
                .filter(
                    (task) => task.status === "completed"
                )
                .reduce(
                    (total, task) =>
                        total + Number(task.storyPoints || 0),
                    0
                );
        const sprintProgress =
            totalStoryPoints > 0
                ? Number(
                    (
                        (completedStoryPoints /
                            totalStoryPoints) *
                        100
                    ).toFixed(2)
                )
                : 0;

        const totalBugs = await Bug.countDocuments({
            sprint: sprintId,
        });

        const resolvedBugs = await Bug.countDocuments({
            sprint: sprintId,
            status: "resolved",
        });

        return res.status(200).json({
            success: true,
            message: "Sprint report generated successfully",

            report: {
                sprint,

                totalTasks,
                completedTasks,
                pendingTasks,
                inProgressTasks,

                totalStoryPoints,
                completedStoryPoints,

                sprintProgress,

                totalBugs,
                resolvedBugs,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate sprint report",
            error: error.message,
        });
    }
};

exports.employeeReport = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }

        const employee = await User.findById(employeeId)
            .select("-password");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const tasks = await Task.find({
            assignedTo: employeeId,
        });

        const bugs = await Bug.find({
            assignedTo: employeeId,
        });

        const timeLogs = await TimeLog.find({
            user: employeeId,
        });
        const totalAssignedTasks = tasks.length;

        const completedTasks = await Task.countDocuments({
            assignedTo: employeeId,
            status: "completed",
        });

        const pendingTasks = await Task.countDocuments({
            assignedTo: employeeId,
            status: "pending",
        });

        const totalAssignedBugs = bugs.length;

        const resolvedBugs = await Bug.countDocuments({
            assignedTo: employeeId,
            status: "resolved",
        });

        const totalWorkingHours = timeLogs.reduce(
            (total, log) =>
                total + Number(log.hoursWorked || 0),
            0
        );


        const overtime =
            totalWorkingHours > 8
                ? totalWorkingHours - 8
                : 0;
        const taskCompletionRate =
            totalAssignedTasks > 0
                ? Number(
                    (
                        (completedTasks /
                            totalAssignedTasks) *
                        100
                    ).toFixed(2)
                )
                : 0;

        return res.status(200).json({
            success: true,
            message: "Employee report generated successfully",

            employee,

            report: {
                totalAssignedTasks,
                completedTasks,
                pendingTasks,

                totalAssignedBugs,
                resolvedBugs,

                totalWorkingHours,
                overtime,

                taskCompletionRate,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate employee report",
            error: error.message,
        });
    }
};

exports.taskReport = async (req, res) => {
    try {
        const {
            projectId,
            sprintId,
            assignedTo,
        } = req.query;

        const filter = {};

        if (projectId) {
            filter.project = projectId;
        }

        if (sprintId) {
            filter.sprint = sprintId;
        }

        if (assignedTo) {
            filter.assignedTo = assignedTo;
        }

        const tasks = await Task.find(filter);
        const totalTasks = tasks.length;

        const completedTasks = tasks.filter(
            (task) => task.status === "completed"
        ).length;

        const pendingTasks = tasks.filter(
            (task) => task.status === "pending"
        ).length;

        const inProgressTasks = tasks.filter(
            (task) => task.status === "in-progress"
        ).length;

        const priorityReport = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
        };

        tasks.forEach((task) => {
            const priority = String(
                task.priority || ""
            ).toLowerCase();

            if (
                Object.prototype.hasOwnProperty.call(
                    priorityReport,
                    priority
                )
            ) {
                priorityReport[priority]++;
            }
        });

        const totalStoryPoints = tasks.reduce(
            (total, task) =>
                total + Number(task.storyPoints || 0),
            0
        );

        const completedStoryPoints = tasks
            .filter(
                (task) => task.status === "completed"
            )
            .reduce(
                (total, task) =>
                    total + Number(task.storyPoints || 0),
                0
            );


        const completionRate =
            totalTasks > 0
                ? Number(
                    (
                        (completedTasks /
                            totalTasks) *
                        100
                    ).toFixed(2)
                )
                : 0;


        return res.status(200).json({
            success: true,
            message: "Task report generated successfully",

            report: {
                totalTasks,
                completedTasks,
                pendingTasks,
                inProgressTasks,

                totalStoryPoints,
                completedStoryPoints,

                completionRate,

                priorityReport,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate task report",
            error: error.message,
        });
    }
};

exports.bugReport = async (req, res) => {
    try {
        const {
            projectId,
            sprintId,
            assignedTo,
        } = req.query;

        const filter = {};

        if (projectId) {
            filter.project = projectId;
        }

        if (sprintId) {
            filter.sprint = sprintId;
        }

        if (assignedTo) {
            filter.assignedTo = assignedTo;
        }
        const bugs = await Bug.find(filter);
        const totalBugs = bugs.length;

        const openBugs = bugs.filter(
            (bug) => bug.status === "open"
        ).length;

        const resolvedBugs = bugs.filter(
            (bug) => bug.status === "resolved"
        ).length;

        const severityReport = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
        };

        bugs.forEach((bug) => {
            const severity = String(
                bug.severity || ""
            ).toLowerCase();

            if (
                Object.prototype.hasOwnProperty.call(
                    severityReport,
                    severity
                )
            ) {
                severityReport[severity]++;
            }
        });

        const priorityReport = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
        };

        bugs.forEach((bug) => {
            const priority = String(
                bug.priority || ""
            ).toLowerCase();

            if (
                Object.prototype.hasOwnProperty.call(
                    priorityReport,
                    priority
                )
            ) {
                priorityReport[priority]++;
            }
        });

        const resolutionRate =
            totalBugs > 0
                ? Number(
                    (
                        (resolvedBugs /
                            totalBugs) *
                        100
                    ).toFixed(2)
                )
                : 0;


        return res.status(200).json({
            success: true,
            message: "Bug report generated successfully",

            report: {
                totalBugs,
                openBugs,
                resolvedBugs,

                resolutionRate,

                severityReport,
                priorityReport,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate bug report",
            error: error.message,
        });
    }
};


exports.timeLogReport = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            projectId,
            userId,
        } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Start date and end date are required",
            });
        }


        const start = new Date(startDate);
        const end = new Date(endDate);

        end.setHours(23, 59, 59, 999);


        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid date range",
            });
        }

        if (start > end) {
            return res.status(400).json({
                success: false,
                message:
                    "Start date cannot be greater than end date",
            });
        }

        const filter = {
            createdAt: {
                $gte: start,
                $lte: end,
            },
        };

        if (projectId) {
            filter.project = projectId;
        }

        if (userId) {
            filter.user = userId;
        }
        const timeLogs = await TimeLog.find(filter);

        const totalLoggedHours = timeLogs.reduce(
            (total, log) =>
                total + Number(log.hoursWorked || 0),
            0
        );


        const totalOvertime = timeLogs.reduce(
            (total, log) =>
                total + Number(log.overtime || 0),
            0
        );

        const workingDays = new Set();

        timeLogs.forEach((log) => {

            const date =
                log.date ||
                log.createdAt;

            if (date) {
                workingDays.add(
                    new Date(date)
                        .toISOString()
                        .split("T")[0]
                );
            }
        });


        const totalWorkingDays =
            workingDays.size;


        const averageHoursPerDay =
            totalWorkingDays > 0
                ? Number(
                    (
                        totalLoggedHours /
                        totalWorkingDays
                    ).toFixed(2)
                )
                : 0;

        return res.status(200).json({
            success: true,
            message:
                "Time log report generated successfully",

            report: {
                startDate,
                endDate,

                totalLogs: timeLogs.length,

                totalLoggedHours,
                totalOvertime,

                totalWorkingDays,
                averageHoursPerDay,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Failed to generate time log report",
            error: error.message,
        });
    }
};