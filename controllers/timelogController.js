
const TimeLog = require("../models/timeLog");


// Create Time Log
exports.createTimeLog = async(req,res) => {

    try {
    
        const {
            project,
            sprint,
            task,
            user,
            workDate,
            hoursWorked,
            Description,
        } = req.body;

        if(!project || !workDate || !hoursWorked) {
            return res.status(400).json({
                success: false,
                message: "Project, work date and hours worked are required",
            });
        }

        const timeLog = await TimeLog.create({
            project,
            sprint,
            task,
            user: user || req.user._id,
            workDate,
            hoursWorked,
            Description,
        });

        return res.status(201).json({
            success: true,
            message: "Time log created successfully",
            timeLog,
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to create time log",
            error: error.message,
        });
    }
};


// Get All Time Logs
exports.getTimeLogs = async(req,res) => {

    try {

        const timeLogs = await TimeLog.find()
            .populate("project")
            .populate("sprint")
            .populate("task")
            .populate("user");


        return res.status(200).json({
            success: true,
            count: timeLogs.length,
            message: "Time logs fetched successfully",
            timeLogs,
        });

    } catch(error) {

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
exports.updateTimeLog = async(req,res) => {

    try {

        const {
            project,
            sprint,
            task,
            user,
            workDate,
            hoursWorked,
            Description,
        } = req.body;
    
        const timeLog = await TimeLog.findById(req.params.timeLogId);
    
        if(!timeLog) {
            return res.status(404).json({
                success: false,
                message: "Time log not found",
            });
        }

         if (project) timeLog.project = project;
         if (sprint) timeLog.sprint = sprint;
         if (task) timeLog.task = task;
        if (user) timeLog.user = user;
        if (workDate) timeLog.workDate = workDate;
        if (hoursWorked) timeLog.hoursWorked = hoursWorked;
        if (Description) timeLog.Description = Description;
        

        await timeLog.save();

        return res.status(200).json({
            success: true,
            message: "Time log updated successfully",
            timeLog,
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Failed to update time log",
            error: error.message,
        });
    }
};


// Delete Time Log
exports.deleteTimeLog = async(req,res) => {

    try {

        const timeLog = await TimeLog.findById(req.params.timeLogId);

        if(!timeLog) {
            return res.status(404).json({
                success: false,
                message: "Time log not found",
            });
        }

        await TimeLog.findByIdAndDelete(req.params.timeLogId);

        return res.status(200).json({
            success: true,
            message: "Time log deleted successfully",
        });

    } catch(error) {

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