const Meeting = require("../models/meeting");
const sendMeetingInvitationEmail = require("../services/emailService");


exports.createMeeting = async (req, res) => {
    try {

        const {
            meetingTitle,
            project,
            agenda,
            description,
            participants,
            meetingDate,
            startTime,
            endTime,
            meetingLink,
            meetingNotes,
            status
        } = req.body;

        if (!meetingTitle || !project) {
            return res.status(400).json({
                success: false,
                message: "Meeting title and project are required",
            });
        }

        // Check meeting title
        if (meetingTitle) {
            const existingMeetingTitle = await Meeting.findOne({
                meetingTitle
            });

            if (existingMeetingTitle) {
                return res.status(400).json({
                    success: false,
                    message: "Meeting already exists",
                });
            }
        }

        const meeting = await Meeting.create({
            meetingTitle,
            project,
            agenda,
            description,
            participants,
            meetingDate,
            startTime,
            endTime,
            meetingLink,
            meetingNotes,
            status,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Meeting created successfully",
            meeting,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create meeting",
            error: error.message,
        });
    }
};


exports.getMeetings = async (req, res) => {

    try {

        const meetings = await Meeting.find()
       .populate("project", "projectName")
       .populate("participants", "firstName lastName"); 

        return res.status(200).json({
            success: true,
            count: meetings.length,
            message: "Meetings fetched successfully",
            meetings,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch meeting data",
            error: error.message,
        });

    }
};


exports.getMeetingById = async (req, res) => {
    try {

        const meeting = await Meeting.findById(req.params.meetingId);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Meeting found",
            meeting,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch meeting",
            error: error.message
        });
    }
};


exports.updateMeeting = async (req, res) => {
    try {

        const {
            meetingTitle,
            project,
            agenda,
            description,
            participants,
            meetingDate,
            startTime,
            endTime,
            meetingLink,
            meetingNotes,
            status
        } = req.body;

        const meeting = await Meeting.findById(req.params.meetingId);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        // Check meeting title
        if (meetingTitle) {
            const existingMeetingTitle = await Meeting.findOne({
                meetingTitle,
                _id: { $ne: req.params.meetingId },
            });

            if (existingMeetingTitle) {
                return res.status(400).json({
                    success: false,
                    message: "Meeting title already exists",
                });
            }

            meeting.meetingTitle = meetingTitle;
        }

        if (project) meeting.project = project;
        if (agenda) meeting.agenda = agenda;
        if (description) meeting.description = description;
        if (participants) meeting.participants = participants;
        if (meetingDate) meeting.meetingDate = meetingDate;
        if (startTime) meeting.startTime = startTime;
        if (endTime) meeting.endTime = endTime;
        if (meetingLink) meeting.meetingLink = meetingLink;
        if (meetingNotes) meeting.meetingNotes = meetingNotes;
        if (status) meeting.status = status;

        meeting.updatedBy = req.user._id;

        await meeting.save();

        return res.status(200).json({
            success: true,
            message: "Meeting updated successfully",
            meeting,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update meeting",
            error: error.message,
        });
    }
};


exports.deleteMeeting = async (req, res) => {
    try {

        const meeting = await Meeting.findById(req.params.meetingId);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        await Meeting.findByIdAndDelete(req.params.meetingId);

        return res.status(200).json({
            success: true,
            message: "Meeting deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete meeting",
            error: error.message,
        });
    }
};


exports.addMeetingNotes = async (req, res) => {
    try {

        const { meetingNotes } = req.body;

        const meeting = await Meeting.findById(req.params.meetingId);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        meeting.meetingNotes = meetingNotes;
        meeting.updatedBy = req.user._id;

        await meeting.save();

        return res.status(200).json({
            success: true,
            message: "Meeting notes added successfully",
            meeting,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add meeting notes",
            error: error.message,
        });
    }
};


exports.changeMeetingStatus = async (req, res) => {
    try {

        const { status } = req.body;

        const meeting = await Meeting.findById(req.params.meetingId);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        meeting.status = status;
        meeting.updatedBy = req.user._id;

        await meeting.save();

        return res.status(200).json({
            success: true,
            message: "Meeting status changed successfully",
            meeting,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to change meeting status",
            error: error.message,
        });
    }
};