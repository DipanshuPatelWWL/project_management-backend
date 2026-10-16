const Meeting = require("../models/Meeting");
const { sendMeetingInvitationEmail } = require("../services/emailService");
const { sendNotification } = require("../services/notificationService");

// Generate permanent sequential Meeting ID (e.g. MTG001, MTG002)
const generateMeetingId = async () => {
    const meetings = await Meeting.find({
        meetingId: { $exists: true, $ne: "" },
    }).select("meetingId");

    let highestNumber = 0;

    meetings.forEach((m) => {
        if (m.meetingId) {
            const number = parseInt(m.meetingId.replace("MTG", "").replace("MEET", ""), 10);
            if (!isNaN(number) && number > highestNumber) {
                highestNumber = number;
            }
        }
    });

    const nextNumber = highestNumber + 1;
    return `MTG${String(nextNumber).padStart(3, "0")}`;
};

// Helper to extract participant, organizer, and creator IDs
const getMeetingTargetUserIds = (meeting) => {
    const ids = new Set();
    if (!meeting) return [];

    if (meeting.participants) {
        if (Array.isArray(meeting.participants)) {
            meeting.participants.forEach((p) => {
                if (p) ids.add(p._id ? p._id.toString() : p.toString());
            });
        } else {
            ids.add(meeting.participants._id ? meeting.participants._id.toString() : meeting.participants.toString());
        }
    }

    if (meeting.organizer) {
        ids.add(meeting.organizer._id ? meeting.organizer._id.toString() : meeting.organizer.toString());
    }

    if (meeting.createdBy) {
        ids.add(meeting.createdBy._id ? meeting.createdBy._id.toString() : meeting.createdBy.toString());
    }

    return Array.from(ids);
};

exports.getNextMeetingId = async (req, res) => {
    try {
        const nextMeetingId = await generateMeetingId();
        return res.status(200).json({
            success: true,
            nextMeetingId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate meeting ID",
            error: error.message,
        });
    }
};

exports.createMeeting = async (req, res) => {
    try {

        const {
            meetingId,
            meetingTitle,
            project,
            organizer,
            agenda,
            description,
            participants,
            meetingDate,
            startTime,
            endTime,
            meetingType,
            meetingLink,
            meetingNotes,
            status
        } = req.body;

        if (!meetingTitle?.trim() || !project || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Meeting title, project, start time, and end time are required",
            });
        }

        // Check startTime vs endTime
        if (startTime && endTime && startTime >= endTime) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time",
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

        const nextMeetingId = meetingId || (await generateMeetingId());

        const meeting = await Meeting.create({
            meetingId: nextMeetingId,
            meetingTitle,
            project,
            organizer: organizer || req.user?._id,
            agenda,
            description,
            participants,
            meetingDate,
            startTime,
            endTime,
            meetingType: meetingType || "Video Call",
            meetingLink,
            meetingNotes,
            status: status || "scheduled",
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        // 1. Notify the invited participant if present
        let participantIdStr = null;
        if (participants) {
            if (Array.isArray(participants) && participants.length > 0) {
                participantIdStr = participants[0]?._id ? participants[0]._id.toString() : participants[0].toString();
            } else {
                participantIdStr = participants._id ? participants._id.toString() : participants.toString();
            }
        }

        if (participantIdStr && req.user?._id && participantIdStr !== req.user._id.toString()) {
            await sendNotification({
                receiver: participantIdStr,
                sender: req.user._id,
                title: "New Meeting Invitation",
                message: `You are invited to meeting: "${meeting.meetingTitle}".`,
                type: "meeting",
                project: meeting.project,
                entityType: "Meeting",
                entityId: meeting._id,
            });

            // Send Meeting Invitation Email (non-blocking)
            sendMeetingInvitationEmail(participantIdStr, {
                title: meeting.meetingTitle,
                date: meeting.meetingDate,
                time: `${meeting.startTime || ""} - ${meeting.endTime || ""}`,
                locationOrLink: meeting.meetingLink,
            }).catch((emailErr) =>
                console.error("Meeting invite email delivery failed:", emailErr.message)
            );
        }

        // 2. Notify the scheduler/creator so they get real-time confirmation & popup
        if (req.user?._id) {
            await sendNotification({
                receiver: req.user._id,
                sender: req.user._id,
                title: "Meeting Scheduled",
                message: `Meeting "${meeting.meetingTitle}" has been scheduled successfully.`,
                type: "meeting",
                project: meeting.project,
                entityType: "Meeting",
                entityId: meeting._id,
            });
        }

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
            .populate("project", "projectName projectId")
            .populate("participants", "firstName lastName email employeeId")
            .populate("organizer", "firstName lastName email employeeId")
            .populate("createdBy", "firstName lastName email")
            .sort({ createdAt: -1 });

        // Auto backfill meetingId for existing meetings if missing
        for (let i = 0; i < meetings.length; i++) {
            if (!meetings[i].meetingId) {
                const autoId = `MTG${String(i + 1).padStart(3, "0")}`;
                meetings[i].meetingId = autoId;
                Meeting.updateOne({ _id: meetings[i]._id }, { meetingId: autoId }).exec().catch(() => { });
            }
        }

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

        const meeting = await Meeting.findById(req.params.meetingId)
            .populate("project", "projectName projectId")
            .populate("participants", "firstName lastName email employeeId")
            .populate("organizer", "firstName lastName email employeeId")
            .populate("createdBy", "firstName lastName email");

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
            organizer,
            agenda,
            description,
            participants,
            meetingDate,
            startTime,
            endTime,
            meetingType,
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

        if (meetingTitle !== undefined && !meetingTitle.trim()) {
            return res.status(400).json({
                success: false,
                message: "Meeting title is required",
            });
        }

        if (project !== undefined && !project) {
            return res.status(400).json({
                success: false,
                message: "Project is required",
            });
        }

        if (startTime !== undefined && !startTime) {
            return res.status(400).json({
                success: false,
                message: "Start time is required",
            });
        }

        if (endTime !== undefined && !endTime) {
            return res.status(400).json({
                success: false,
                message: "End time is required",
            });
        }

        // Check meeting title
        if (meetingTitle) {
            const existingMeetingTitle = await Meeting.findOne({
                meetingTitle: meetingTitle.trim(),
                _id: { $ne: req.params.meetingId },
            });

            if (existingMeetingTitle) {
                return res.status(400).json({
                    success: false,
                    message: "Meeting title already exists",
                });
            }

            meeting.meetingTitle = meetingTitle.trim();
        }

        // Check startTime vs endTime
        const finalStart = startTime !== undefined ? startTime : meeting.startTime;
        const finalEnd = endTime !== undefined ? endTime : meeting.endTime;
        if (finalStart && finalEnd && finalStart >= finalEnd) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time",
            });
        }

        if (project !== undefined) meeting.project = project;
        if (organizer !== undefined) meeting.organizer = organizer;
        if (agenda !== undefined) meeting.agenda = agenda;
        if (description !== undefined) meeting.description = description;
        if (participants !== undefined) meeting.participants = participants;
        if (meetingDate !== undefined) meeting.meetingDate = meetingDate;
        if (startTime !== undefined) meeting.startTime = startTime;
        if (endTime !== undefined) meeting.endTime = endTime;
        if (meetingType !== undefined) meeting.meetingType = meetingType;
        if (meetingLink !== undefined) meeting.meetingLink = meetingLink;
        if (meetingNotes !== undefined) meeting.meetingNotes = meetingNotes;
        if (status !== undefined) meeting.status = status;

        meeting.updatedBy = req.user._id;

        await meeting.save();

        const updateTargets = getMeetingTargetUserIds(meeting);
        if (req.user?._id && !updateTargets.includes(req.user._id.toString())) {
            updateTargets.push(req.user._id.toString());
        }
        for (const uId of updateTargets) {
            await sendNotification({
                receiver: uId,
                sender: req.user._id,
                title: "Meeting Updated",
                message: `The meeting "${meeting.meetingTitle}" has been updated.`,
                type: "meeting",
                project: meeting.project,
                entityType: "Meeting",
                entityId: meeting._id,
            });
        }

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

        const deleteTargets = getMeetingTargetUserIds(meeting);
        for (const uId of deleteTargets) {
            await sendNotification({
                receiver: uId,
                sender: req.user._id,
                title: "Meeting Cancelled",
                message: `The meeting "${meeting.meetingTitle}" has been cancelled.`,
                type: "meeting",
                project: meeting.project,
                entityType: "Meeting",
                entityId: meeting._id,
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

        const statusTargets = getMeetingTargetUserIds(meeting);
        if (req.user?._id && !statusTargets.includes(req.user._id.toString())) {
            statusTargets.push(req.user._id.toString());
        }
        for (const uId of statusTargets) {
            await sendNotification({
                receiver: uId,
                sender: req.user._id,
                title: "Meeting Status Updated",
                message: `Meeting "${meeting.meetingTitle}" status is now ${status}.`,
                type: "meeting",
                project: meeting.project,
                entityType: "Meeting",
                entityId: meeting._id,
            });
        }

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