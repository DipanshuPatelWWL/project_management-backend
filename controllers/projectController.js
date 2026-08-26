const Project = require("../models/Project");
const User = require("../models/User");
const Client = require("../models/Client");
const sendProjectAssignmentEmail = require("../services/emailService");

exports.createProject = async (req, res) => {
    try {
        const {
            projectName,
            projectCode,
            description,
            company,
            client,
            projectManager,
            teamLead,
            teamMembers,
            budget,
            technologies,
            startDate,
            endDate,
            deadline,
            status,
            priority,
            progress,
            isArchived,
            isActive,
        } = req.body;

        if (!projectName || !company || !client) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        // Check Project Code
        if (projectCode) {
            const existingProjectCode = await Project.findOne({
                projectCode,
            });

            if (existingProjectCode) {
                return res.status(400).json({
                    success: false,
                    message: "Project code already exists",
                });
            }
        }

        const project = await Project.create({
            projectName,
            projectCode,
            description,
            company,
            client,
            projectManager,
            teamLead,
            teamMembers,
            budget,
            technologies,
            startDate,
            endDate,
            deadline,
            status,
            priority,
            progress,
            isArchived,
            isActive,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            project,
        });
       
        await sendProjectAssignmentEmail({
             user : createdBy,
             project : projectName,
        });



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: error.message,
        });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();

        return res.status(200).json({
            success: true,
            count: projects.length,
            message: "Projects fetched successfully",
            projects,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch project data",
            error: error.message,
        });
    }
};

exports.getProjectById = async (req,res) => {

    try {
       const projects = await company.findById( req.param.companyId);
     
       if(!companies){ 
       return res.status(400).json({
        success :false,
        message : "project not found",
         });
       }
   

    return res.status(200) .json ({
        success: true,
        message: "project found",
    });

    }catch(error) {
         return res.status(200) .json ({
        success: true,
        message: error.message,

    });
    }
};



exports.updateProject = async (req, res) => {
    try {
        const {
            projectName,
            projectCode,
            description,
            company,
            client,
            projectManager,
            teamLead,
            teamMembers,
            budget,
            technologies,
            startDate,
            endDate,
            deadline,
            status,
            priority,
            progress,
            isArchived,
            isActive,
        } = req.body;

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // Check Project Code
        if (projectCode) {
            const existingProjectCode = await Project.findOne({
                projectCode,
                _id: { $ne: req.params.projectId },
            });

            if (existingProjectCode) {
                return res.status(400).json({
                    success: false,
                    message: "Project code already exists",
                });
            }

            project.projectCode = projectCode;
        }

        // Update remaining fields
        if (projectName) project.projectName = projectName;
        if (description) project.description = description;
        if (company) project.company = company;
        if (client) project.client = client;
        if (projectManager) project.projectManager = projectManager;
        if (teamLead) project.teamLead = teamLead;
        if (teamMembers) project.teamMembers = teamMembers;
        if (budget) project.budget = budget;
        if (technologies) project.technologies = technologies;
        if (startDate) project.startDate = startDate;
        if (endDate) project.endDate = endDate;
        if (deadline) project.deadline = deadline;
        if (status) project.status = status;
        if (priority) project.priority = priority;
        if (progress !== undefined) project.progress = progress;
        if (isArchived !== undefined) project.isArchived = isArchived;
        if (isActive !== undefined) project.isActive = isActive;

        project.updatedBy = req.user._id;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update project",
            error: error.message,
        });
    }
};

exports.deleteProject = async (req, res) => {
    try {

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        await Project.findByIdAndDelete(req.params.projectId);

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete project",
            error: error.message,
        });
    }
};

exports.assignProjectManager = async (req, res) => {
    try {
        const { projectManager } = req.body;

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const manager = await User.findById(projectManager);

        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Project manager not found",
            });
        }

        project.projectManager = projectManager;
        project.updatedBy = req.user._id;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project manager assigned successfully",
            project,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to assign project manager",
            error: error.message,
        });
    }
};

exports.assignTeamLead = async (req, res) => {
    try {
        const { teamLead } = req.body;

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const lead = await User.findById(teamLead);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Team lead not found",
            });
        }

        project.teamLead = teamLead;
        project.updatedBy = req.user._id;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Team lead assigned successfully",
            project,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to assign team lead",
            error: error.message,
        });
    }
};

exports.assignMembers = async (req, res) => {
    try {
        const { teamMembers } = req.body;

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const member = await User.findById(teamMembers);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        project.teamMembers = teamMembers;
        project.updatedBy = req.user._id;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Member assigned successfully",
            project,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to assign member",
            error: error.message,
        });
    }
};