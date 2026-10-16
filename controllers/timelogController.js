const mongoose = require("mongoose");
const TimeLog = require("../models/TimeLog");
const logAudit = require("../utils/auditLogger");

// Generate sequential TimeLog ID (e.g. TL001, TL002)
const generateTimeLogId = async () => {
    const timeLogs = await TimeLog.find({
        timeLogId: { $exists: true, $ne: "" },
    }).select("timeLogId");

    let highestNumber = 0;

    timeLogs.forEach((t) => {
        if (t.timeLogId) {
            const number = parseInt(t.timeLogId.replace("TL", "").replace("LOG", ""), 10);
            if (!isNaN(number) && number > highestNumber) {
                highestNumber = number;
            }
        }
    });

    const nextNumber = highestNumber + 1;
    return `TL${String(nextNumber).padStart(3, "0")}`;
};

// Get Next TimeLog ID
exports.getNextTimeLogId = async (req, res) => {
    try {
        const nextTimeLogId = await generateTimeLogId();
        return res.status(200).json({
            success: true,
            nextTimeLogId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate time log ID",
            error: error.message,
        });
    }
};

// Get Time Log By ID
exports.getTimeLogById = async (req, res) => {
    try {
        const { timeLogId } = req.params;
        let timeLog = null;

        if (mongoose.Types.ObjectId.isValid(timeLogId)) {
            timeLog = await TimeLog.findById(timeLogId)
                .populate("project")
                .populate("sprint")
                .populate("task")
                .populate("user");
        }

        if (!timeLog) {
            timeLog = await TimeLog.findOne({ timeLogId: timeLogId.toUpperCase() })
                .populate("project")
                .populate("sprint")
                .populate("task")
                .populate("user");
        }

        if (!timeLog) {
            return res.status(404).json({
                success: false,
                message: "Time log not found",
            });
        }

        return res.status(200).json({
            success: true,
            timeLog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch time log",
            error: error.message,
        });
    }
};

// Create Time Log
exports.createTimeLog = async (req, res) => {
    try {
        const {
            timeLogId,
            project,
            sprint,
            task,
            user,
            workDate,
            hoursWorked,
            Description,
            description,
            status,
        } = req.body;

        if (!project || !workDate || !hoursWorked) {
            return res.status(400).json({
                success: false,
                message: "Project, work date and hours worked are required",
            });
        }

        const nextId =
            timeLogId && timeLogId.trim() !== ""
                ? timeLogId.trim().toUpperCase()
                : await generateTimeLogId();

        const descText = description || Description || "";

        const timeLog = await TimeLog.create({
            timeLogId: nextId,
            project,
            sprint: sprint || undefined,
            task: task || undefined,
            user: user || req.user?._id,
            workDate,
            hoursWorked: Number(hoursWorked),
            Description: descText,
            description: descText,
            status: status || "Logged",
        });

        await logAudit({
            req,
            module: "TimeLog",
            action: "CREATE",
            description: `Created time log entry (${timeLog.timeLogId}) for ${timeLog.hoursWorked} hrs`,
            entityType: "TimeLog",
            entityId: timeLog._id,
        });

        return res.status(201).json({
            success: true,
            message: "Time log created successfully",
            timeLog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create time log",
            error: error.message,
        });
    }
};

// Get All Time Logs
exports.getTimeLogs = async (req, res) => {
    try {
        const timeLogs = await TimeLog.find()
            .populate("project")
            .populate("sprint")
            .populate("task")
            .populate("user")
            .sort({ createdAt: -1 });

        // Auto-backfill missing timeLogId if any
        for (let i = 0; i < timeLogs.length; i++) {
            if (!timeLogs[i].timeLogId) {
                timeLogs[i].timeLogId = await generateTimeLogId();
                await timeLogs[i].save();
            }
        }

        return res.status(200).json({
            success: true,
            count: timeLogs.length,
            message: "Time logs fetched successfully",
            timeLogs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch time logs",
            error: error.message,
        });
    }
};


// Get My Time Logs
exports.getMyTimeLogs = async(req,res) => {

    try {

        const timeLogs = await TimeLog.find({
            user: req.user._id,
        })
            .populate("project")
            .populate("sprint")
            .populate("task");

        return res.status(200).json({
            success: true,
            count: timeLogs.length,
            message: "My time logs fetched successfully",
            timeLogs,
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch my time logs",
            error: error.message,
        });
    }
};


// Update Time Log
exports.updateTimeLog = async (req, res) => {
    try {
        const {
            project,
            sprint,
            task,
            user,
            workDate,
            hoursWorked,
            Description,
            description,
            status,
        } = req.body;

        const { timeLogId } = req.params;
        let timeLog = null;

        if (mongoose.Types.ObjectId.isValid(timeLogId)) {
            timeLog = await TimeLog.findById(timeLogId);
        }
        if (!timeLog) {
            timeLog = await TimeLog.findOne({ timeLogId: timeLogId.toUpperCase() });
        }

        if (!timeLog) {
            return res.status(404).json({
                success: false,
                message: "Time log not found",
            });
        }

        if (project) timeLog.project = project;
        if (sprint !== undefined) timeLog.sprint = sprint || null;
        if (task !== undefined) timeLog.task = task || null;
        if (user) timeLog.user = user;
        if (workDate) timeLog.workDate = workDate;
        if (hoursWorked !== undefined) timeLog.hoursWorked = Number(hoursWorked);
        if (description !== undefined || Description !== undefined) {
            const desc = description !== undefined ? description : Description;
            timeLog.description = desc;
            timeLog.Description = desc;
        }
        let statusChanged = false;
        const oldTimeLogStatus = timeLog.status;
        if (status) {
            if (status !== oldTimeLogStatus) {
                statusChanged = true;
            }
            timeLog.status = status;
        }

        await timeLog.save();

        if (statusChanged) {
            await logAudit({
                req,
                module: "TimeLog",
                action: "STATUS_CHANGE",
                description: `Changed time log (${timeLog.timeLogId}) status from "${oldTimeLogStatus}" to "${status}"`,
                entityType: "TimeLog",
                entityId: timeLog._id,
            });
        } else {
            await logAudit({
                req,
                module: "TimeLog",
                action: "UPDATE",
                description: `Updated time log entry (${timeLog.timeLogId})`,
                entityType: "TimeLog",
                entityId: timeLog._id,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Time log updated successfully",
            timeLog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update time log",
            error: error.message,
        });
    }
};

// Delete Time Log
exports.deleteTimeLog = async (req, res) => {
    try {
        const { timeLogId } = req.params;
        let timeLog = null;

        if (mongoose.Types.ObjectId.isValid(timeLogId)) {
            timeLog = await TimeLog.findById(timeLogId);
        }
        if (!timeLog) {
            timeLog = await TimeLog.findOne({ timeLogId: timeLogId.toUpperCase() });
        }

        if (!timeLog) {
            return res.status(404).json({
                success: false,
                message: "Time log not found",
            });
        }

        await TimeLog.findByIdAndDelete(timeLog._id);

        await logAudit({
            req,
            module: "TimeLog",
            action: "DELETE",
            description: `Deleted time log entry (${timeLog.timeLogId || timeLog._id})`,
            entityType: "TimeLog",
            entityId: timeLog._id,
        });

        return res.status(200).json({
            success: true,
            message: "Time log deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete time log",
            error: error.message,
        });
    }
};


// Weekly Summary 

exports.weeklySummary = async(req,res) => {

    try {

        // Get Logged-in User
        const user = req.user._id;


        // Find Current Week Start Date
        const today = new Date();

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
    

        // Find Current Week End Date
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        weekEnd.setHours(0, 0, 0, 0);


        // Get all TimeLogs of this user between
        // Week Start Date and Week End Date
        const timeLogs = await TimeLog.find({
            user: user,
            workDate: {
                $gte: weekStart,
                $lt: weekEnd,
            },
        });


        // If no TimeLogs found
        // Return Empty Summary
        if(timeLogs.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No time logs found for this week",
                summary: {
                    totalWorkingHours: 0,
                    totalWorkingDays: 0,
                    averageHoursPerDay: 0,
                    totalProjectsWorked: 0,
                    totalTasksWorked: 0,
                    overtimeHours: 0,
                },
            });
        }


        // Calculate Total Working Hours
        const totalWorkingHours = timeLogs.reduce(
            (total, log) => total + log.hoursWorked,
            0
        );


        // Calculate Total Working Days
        const workingDays = new Set(
            timeLogs.map(log => 
                new Date(log.workDate).toDateString()
            )
        );

        const totalWorkingDays = workingDays.size;


        // Calculate Average Hours Per Day
        const averageHoursPerDay =
            totalWorkingHours / totalWorkingDays;


        // Calculate Total Projects Worked
        const projects = new Set(
            timeLogs
                .filter(log => log.project)
                .map(log => log.project.toString())
        );

        const totalProjectsWorked = projects.size;


        // Calculate Total Tasks Worked
        const tasks = new Set(
            timeLogs
                .filter(log => log.task)
                .map(log => log.task.toString())
        );

        const totalTasksWorked = tasks.size;


        // Calculate Overtime Hours
        const overtimeHours =
            totalWorkingHours > 40
                ? totalWorkingHours - 40
                : 0;


        // Return Weekly Summary
        return res.status(200).json({
            success: true,
            message: "Weekly summary fetched successfully",
            summary: {
                weekStart,
                weekEnd,
                totalWorkingHours,
                totalWorkingDays,
                averageHoursPerDay,
                totalProjectsWorked,
                totalTasksWorked,
                overtimeHours,
            },
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch weekly summary",
            error: error.message,
        });
    }
};

// monthly summary 

exports.monthlySummary = async (req, res) => {
    try {

        // Get Logged-in User
        const userId = req.user._id;

        // Find Current Month Start Date
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        // Find Current Month End Date
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(1);
        endDate.setHours(0, 0, 0, 0);

        // Get all TimeLogs of this user between
        // Month Start Date and Month End Date
        const timeLogs = await TimeLog.find({
            user: userId,
            workDate: {
                $gte: startDate,
                $lt: endDate,
            },
        });

        // If no TimeLogs found
        if (timeLogs.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No TimeLogs found for this month",
                summary: {
                    totalWorkingHours: 0,
                    totalWorkingDays: 0,
                    averageHoursPerDay: 0,
                    totalProjectsWorked: 0,
                    totalTasksWorked: 0,
                    overtimeHours: 0,
                    mostWorkedProject: null,
                },
            });
        }

        // Calculate Total Working Hours
        const totalWorkingHours = timeLogs.reduce(
            (total, log) => total + log.hoursWorked,
            0
        );

        // Calculate Total Working Days
        const workingDays = new Set(
            timeLogs.map(log =>
                log.workDate.toISOString().split("T")[0]
            )
        );

        const totalWorkingDays = workingDays.size;

        
        // Calculate Average Hours Per Day
        const averageHoursPerDay =
            totalWorkingHours / totalWorkingDays;

        // Calculate Total Projects Worked
        const projects = new Set(
            timeLogs
                .filter(log => log.project)
                .map(log => log.project.toString())
        );

        const totalProjectsWorked = projects.size;

        // Calculate Total Tasks Worked
        const tasks = new Set(
            timeLogs
                .filter(log => log.task)
                .map(log => log.task.toString())
        );

        const totalTasksWorked = tasks.size;

        // Calculate Overtime Hours
        const normalWorkingHours = totalWorkingDays * 8;

        const overtimeHours = Math.max(
            0,
            totalWorkingHours - normalWorkingHours
        );

        // Calculate Most Worked Project
        const projectHours = {};

        timeLogs.forEach(log => {

            if (log.project) {

                const projectId = log.project.toString();

                if (!projectHours[projectId]) {
                    projectHours[projectId] = 0;
                }

                projectHours[projectId] += log.hoursWorked;
            }
        });

        let mostWorkedProject = null;
        let maxHours = 0;

        for (const projectId in projectHours) {

            if (projectHours[projectId] > maxHours) {
                maxHours = projectHours[projectId];
                mostWorkedProject = projectId;
            }
        }

        // Return Monthly Summary
        return res.status(200).json({
            success: true,
            message: "Monthly summary fetched successfully",
            summary: {
                totalWorkingHours,
                totalWorkingDays,
                averageHoursPerDay,
                totalProjectsWorked,
                totalTasksWorked,
                overtimeHours,
                mostWorkedProject,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch monthly summary",
            error: error.message,
        });

    }
};