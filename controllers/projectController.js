const Project = require("../models/Project");
const User = require("../models/User");
const Client = require("../models/Client");

// Generate permanent sequential Project ID.
// Soft-deleted projects are included in the scan so IDs are never
// reused - same approach as generateClientId / generateCompanyId.
const generateProjectId = async () => {
    const projects = await Project.find({
        projectId: { $exists: true, $ne: "" },
    }).select("projectId");

    let highestNumber = 0;

    projects.forEach((p) => {
        if (p.projectId) {
            const number = parseInt(p.projectId.replace("PRJ", ""), 10);

            if (!isNaN(number) && number > highestNumber) {
                highestNumber = number;
            }
        }
    });

    const nextNumber = highestNumber + 1;

    return `PRJ${String(nextNumber).padStart(3, "0")}`;
};

// Optional ObjectId ref fields (projectManager, teamLead) and optional
// date fields (startDate, endDate, deadline) come from <select>/<input
// type="date"> elements as an empty string "" when left blank. Mongoose
// throws a CastError trying to cast "" to an ObjectId or a Date, which
// is what was causing "Failed to create project" whenever these were
// left empty. This strips those empty strings down to undefined so
// Mongoose just skips them instead of failing to cast them.
const OPTIONAL_REF_AND_DATE_FIELDS = [
    "projectManager",
    "teamLead",
    "startDate",
    "endDate",
    "deadline",
];

const sanitizeOptionalFields = (data) => {
    const cleaned = { ...data };

    OPTIONAL_REF_AND_DATE_FIELDS.forEach((field) => {
        if (cleaned[field] === "") {
            cleaned[field] = undefined;
        }
    });

    return cleaned;
};

exports.createProject = async (req, res) => {
    try {
        const body = sanitizeOptionalFields(req.body);

        const {
            projectName,
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
        } = body;

        if (!projectName || !company || !client) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date",
            });
        }

        if (startDate && deadline && new Date(deadline) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: "Deadline cannot be before start date",
            });
        }

        if (endDate && deadline && new Date(deadline) < new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Deadline cannot be before end date",
            });
        }

        // Generate permanent Project ID only after validation
        const projectId = await generateProjectId();

        const project = await Project.create({
            projectId,
            projectName,
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
            isDeleted: false,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            project,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: error.message,
        });
    }
};

exports.getProjects = async (req, res) => {
    try {
        // Only active (non-deleted) projects are displayed
        const projects = await Project.find({ isDeleted: false })
            .populate("company")
            .populate("client")
            .populate("projectManager")
            .populate("teamLead")
            .populate("teamMembers");

        // Preview of the next Project ID, without incrementing anything
        const nextProjectId = await generateProjectId();

        return res.status(200).json({
            success: true,
            count: projects.length,
            message: "Projects fetched successfully",
            projects,
            nextProjectId,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch project data",
            error: error.message,
        });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            isDeleted: false,
        })
            .populate("company")
            .populate("client")
            .populate("projectManager")
            .populate("teamLead")
            .populate("teamMembers");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project found",
            project,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch project",
            error: error.message,
        });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const body = sanitizeOptionalFields(req.body);

        const {
            projectName,
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
        } = body;

        const project = await Project.findOne({
            _id: req.params.projectId,
            isDeleted: false,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const effectiveStartDate = startDate !== undefined ? startDate : project.startDate;
        const effectiveEndDate = endDate !== undefined ? endDate : project.endDate;
        const effectiveDeadline = deadline !== undefined ? deadline : project.deadline;

        if (effectiveStartDate && effectiveEndDate && new Date(effectiveEndDate) < new Date(effectiveStartDate)) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date",
            });
        }

        if (effectiveStartDate && effectiveDeadline && new Date(effectiveDeadline) < new Date(effectiveStartDate)) {
            return res.status(400).json({
                success: false,
                message: "Deadline cannot be before start date",
            });
        }

        if (effectiveEndDate && effectiveDeadline && new Date(effectiveDeadline) < new Date(effectiveEndDate)) {
            return res.status(400).json({
                success: false,
                message: "Deadline cannot be before end date",
            });
        }

        // Update fields
        if (projectName) project.projectName = projectName;
        if (description !== undefined) project.description = description;
        if (company) project.company = company;
        if (client) project.client = client;

        // projectManager/teamLead can be intentionally cleared, so we
        // check `!== undefined` rather than truthiness.
        if (projectManager !== undefined) {
            project.projectManager = projectManager || null;
        }
        if (teamLead !== undefined) {
            project.teamLead = teamLead || null;
        }

        if (teamMembers) project.teamMembers = teamMembers;
        if (budget !== undefined) project.budget = budget;
        if (technologies !== undefined) project.technologies = technologies;
        if (startDate !== undefined) project.startDate = startDate || null;
        if (endDate !== undefined) project.endDate = endDate || null;
        if (deadline !== undefined) project.deadline = deadline || null;
        if (status) project.status = status;
        if (priority) project.priority = priority;
        if (progress !== undefined) project.progress = progress;
        if (isArchived !== undefined) {
            project.isArchived = isArchived;
        }
        if (isActive !== undefined) {
            project.isActive = isActive;
        }

        project.updatedBy = req.user._id;

        await project.save({ validateModifiedOnly: true });

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update project",
            error: error.message,
        });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        // Soft delete instead of permanently deleting the document
        const project = await Project.findOne({
            _id: req.params.projectId,
            isDeleted: false,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        project.isDeleted = true;
        project.updatedBy = req.user._id;

        await project.save({ validateModifiedOnly: true });

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });

    } catch (error) {
        console.error(error);
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

        const project = await Project.findOne({
            _id: req.params.projectId,
            isDeleted: false,
        });

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

        await project.save({ validateModifiedOnly: true });

        return res.status(200).json({
            success: true,
            message: "Project manager assigned successfully",
            project,
        });

    } catch (error) {
        console.error(error);
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

        const project = await Project.findOne({
            _id: req.params.projectId,
            isDeleted: false,
        });

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

        await project.save({ validateModifiedOnly: true });

        return res.status(200).json({
            success: true,
            message: "Team lead assigned successfully",
            project,
        });

    } catch (error) {
        console.error(error);
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

        const project = await Project.findOne({
            _id: req.params.projectId,
            isDeleted: false,
        });

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

        await project.save({ validateModifiedOnly: true });

        return res.status(200).json({
            success: true,
            message: "Member assigned successfully",
            project,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to assign member",
            error: error.message,
        });
    }
};