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
        const totalMeetings =   await Meeting.countDocuments();

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





exports.getAdminDashboard = async (req,res) => {
   try {
       //users 
       const totalUsers = await users.countDocument();

       //total projects 
       const  totalProjects = await Projects.countDocument();

     // total tasks
       const totalTasks = await Tasks.countDocument();

       //bugs 
       const totalbugs =  await Bugs.CountDocument();



       //all notifications 
        const totalNotifications = await Notifications.countDocument();

       return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            
            dashboard :{
                totalUsers,
                totalProjects,
                totalTasks,
                totalBugs,
                totalNotifications,
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

exports.getProjectManagerDashboard = async(req,res) => {
      try {
        
        // my project 
       const myProject = await ProjectManager.countDocument({
        project : req.param.projectId
    });

      // active sprints
         const activeSprints = await Sprints.countDocuments({
            status : "active",
         })

        // team members 
        const teamMembers = await Project.countDocuments({
            teamMembers,
        });

        //pendingTasks 
        const pendingTasks = await Task.countDocuments({
             status : "in - progress",
        });
        // open bugs 
        const openBugs = await Bug.countDocuments({
            status: "open",
        });

        // upcoming meetings 
        const upcomingMeetings = await Meeting.countDocument({
               status : " scheduled",
        });
           return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard : {
                myProject,
                activeSprints,
                teamMembers,
                pendingTasks,
                openBugs,
                upcomingMeetings,
            }
           });

      } catch (error ) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });

      }
     
};

exports.getTeamLeadDashboard = async (req,res)=> {
    try {
        
      // my  team 
const myTeam = await Project.countDocuments({
    teamLead: req.user._id
});

// My Sprint
const mySprint = await Sprint.countDocuments({
    status: "active"
});

// Pending Review
const pendingReview = await Task.countDocuments({
    status: "completed"
});

// Assigned Tasks
const assignedTasks = await Task.countDocuments({
    assignedTo: req.user._id
});

// Bugs
const bugs = await Bug.countDocuments({
    assignedTo: req.user._id
});

return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard : {
                myTeam,
                mySprint,
             pendingReview,
             assignedTasks,
                    Bugs,
            }
           });
    }catch(error) {
         return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};

exports.getDeveloperDashboard = async(req,res)=> {
  

      //my task 
        const myTask = await Task.CountDocuments({
            assignedTo : req.user._id,
        });

        //todays task
        const todayTask = await Task.countDocuments({
               assignedTo: req.user._id,
            dueDate: {
            $gte: startOfToday,
            $lt: startOfTomorrow
    }
});

  // pending task 
       const pendingTask = await Task.CountDocuments({
           status : "in-progress",
        });

   //completed task 
     const completedTask = await Task.CountDocuments({
           status : "completed",
        });

        //my bugs
        const closedBugs = await Bug.countDocuments({
            assignedTo : req.user._id,
        });

        // time logged 
        const timeLogged = await TimeLog.countDocuments();

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard : {
                myTasks,
              todaysTasks,
              pendingTasks,
             completedTasks,
                  myBugs,
                timeLogged,
            }
           });

};

exports.getQADashboard = async (req,res) => {
    try {
        // assigned bugs 
         const assignedBugs = await Bugs.countDocuments({
            assignedTo : req.user._id
        });

        //open bugs 
        const openBugs = await Bug.countDocuments({
            status: "open",
        });

        //fixed bugs 
        const fixedBugs = await Bug.countDocuments({
            status: "resolved"
        });

        //retestingBugs
       const retestingBugs = await Bug.countDocuments({
            status: "reopened"
        });   
            return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard : {
                     assignedBugs,
                       openBugs,
                      fixedBugs,
                     retestingBugs,
            }
           });

       

    }catch (error) {
         return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};


exports.getClientDashboard = async(req,res) => {
  
    try {
        // my project 
         const myProject = await ProjectManager.countDocument({
        project : req.param.projectId
    });

    // project progress
        const projectProgress = await Project.countDocument({
        progress :
        {$gte: 0,
        $lte: 100} 
    });
    // total documents
            const totalDocuments = await Document.countDocuments();

    // total meeting
            const totalMeetings = await Meeting.countDocuments();


        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",

            dashboard : {
                    myProjects,
                 ProjectProgress,
                     totalDocuments,
                 totalMeetings,
            }
           });

    } catch (error) {
           return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};

