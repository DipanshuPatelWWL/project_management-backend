const Project = require("../models/Project");
const Task = require("../models/Task");
const Sprint = require("../models/Sprint");
const Bug = require("../models/Bug");
const TimeLog = require("../models/TimeLog");

exports.projectReport = async (req, res) => {
    try {

        // Get projectId from params or query
        const projectId = req.params.projectId || req.query.projectId;

        // Find the project
        const project = await Project.findById(projectId);

        // If project does not exist
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // Get project tasks
        const tasks = await Task.find({
            project: projectId
        });

        // Get project sprints
        const sprints = await Sprint.find({
            project: projectId
        });

        // Get project bugs
        const bugs = await Bug.find({
            project: projectId
        });
      
        // Get project time logs
        const timeLogs = await TimeLog.find({
            project: projectId
        });
        
        // Calculate total tasks
        const totalTasks = tasks.length;

        // Calculate completed tasks
      const completedTasks = await Task.countDocuments({
        project : projectId,
        status : "completed",  
    });

    // calculate pending tasks 
      const pendingTasks = await Task.countDocuments({
        project : ProjectId,
        status : " pending " ,
      });
    
      //calculate total sprints 
      const totalSprints = await Sprint.countDocuments({
        project: projectId
         });

     //calculate completed sprints 
     const completedSprints = await Sprint.countDocuments({
        project : projectId,
        status : " pending" ,
     });
        
     // calculate total bugs 
     const totalBugs = await Bugs.countDocuments({
        project : projectId ,
     });
     
     //calculate open bugs 
     const openBugs = await Bugs.CountDocuments({
        project : projectId,
         status : "open",
    });
    // calculate resolved bugs 
    const resolvedBugs = await Bugs.CountDocuments({
         project : projectId,
         status : "resolved",
    });

        // Calculate project progress
        const projectProgress = await Project.countDocuments({
            progress :  {$gte : 0 , $lte : 100 }
        });

        // calculate total logged hours 

        const loggedHours = await TimeLog.countDocuments({
            project : projectId,

        })

     
        // Return Project Report
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
                projectProgress
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to generate project report",
            error: error.message
        });

    }
};

exports.sprintReport = (req,res) => {
   
    try {
         const sprintId =  req.params.id;


         // find sprint 

         const sprint = await Sprint.find(sprintId);

         if (!sprint ) {
            return res.status(404) .json ({
                success : false ,
                message : " sprint not found" ,

            });
         }

         //get sprint tasks 
       const sprintTasks = await tasks.find({
        sprint: sprintId,
       });

       //calculate total tasks 
       const totalTasks = sprintTasks.length;

       // Calculate completed tasks
    const completedTasks = await Task.countDocuments({
    sprint: sprintId,
    status: "completed"
       });

     // Calculate pending tasks
      const pendingTasks = await Task.countDocuments({
        sprint: sprintId,
        status: "pending"
       });

       // calculate in progress tasks 
     const completedTasks = await Tasks.countDocuments({
          sprint : sprintId,
         status  : "in-progress",
     });
     
     // total story points 
     const totalStoryPoints = sprint.totalStoryPoints || 0;
  
     // completed story points 
    const completedStoryPoints = sprint.completedStoryPoints || 0;


        // sprint progress
       const sprintProgress =
           totalStoryPoints > 0
        ? (completedStoryPoints / totalStoryPoints) * 100
        : 0;
              
        //total bugs 
            const totalBugs = await Bug.countDocuments({
          sprint: sprintId,
     });
         // resolved bugs 
       const resolvedBugs = await Bug.countDocuments({
        sprint: sprintId,
        status: "Resolved",
       });

       return res.status(200).json({
          success: true,
          message: "Sprint report generated successfully",
         report: {
         sprint,
         sprintTasks,
         totalTasks,
         completedTasks,
         pendingTasks,
         completedTasks,
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
            message: "Failed to generate project report",
            error: error.message
        });

    }

};

// employee report 
exports.employeeReport = async (req, res) => {
    try {
        // Get employeeId
        const employeeId = req.params.employeeId;

        // Find employee
        const employee = await User.findById(employeeId);

        // If employee does not exist
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        // Get employee tasks
        const tasks = await Task.find({
            assignedTo: employeeId,
        });

        // Get employee bugs
        const bugs = await Bug.find({
            assignedTo: employeeId,
        });

        // Get employee time logs
        const timeLogs = await TimeLog.find({
            user: employeeId,
        });

        // Calculate total assigned tasks
        const totalAssignedTasks = tasks.length;

        // Calculate completed tasks
        const completedTasks = await Task.countDocuments({
            assignedTo: employeeId,
            status: "completed",
        });

        // Calculate pending tasks
        const pendingTasks = await Task.countDocuments({
            assignedTo: employeeId,
            status: "to-do",
        });

        // Calculate total assigned bugs
        const totalAssignedBugs = bugs.length;

        // Calculate resolved bugs
        const resolvedBugs = await Bug.countDocuments({
            assignedTo: employeeId,
            status: "resolved",
        });

        // Calculate total working hours
        const totalWorkingHours = timeLogs.reduce(
            (total, log) => total + (log.hoursWorked || 0),
            0
        );

        // Calculate overtime
        const overtime = totalWorkingHours > 8
            ? totalWorkingHours - 8
            : 0;

        // Calculate task completion rate
        const taskCompletionRate = totalAssignedTasks > 0
            ? (completedTasks / totalAssignedTasks) * 100
            : 0;

        return res.status(200).json({
            success: true,
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
            message: error.message,
        });
    }
};


// task report 
// timelog report 
// bug report 