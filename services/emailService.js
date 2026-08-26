const transporter = require("../config/email");

exports.sendWelcomeEmail = async (email,name) => {
    console.log(email, name)
    try {
        const userEmail = email;
        const userName = name;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Welcome to the Project Management System",
            html: `
                <h2>Hi ${userName},</h2>
                <p>Your account has been successfully created.</p>
                <a href="${process.env.CLIENT_URL}/login">Login here</a>
            `,
        };

        await transporter.sendMail(mailOptions);
         } catch (error) {
        console.error ("Error sending welcome email:", error.message);
    }
};

exports.sendPasswordResetEmail = async (user, resetToken) => {
    try {
        const userEmail = user.email;
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Reset Your Password",
            html: `
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
                <a href="${resetLink}">Reset Password</a>
            `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending reset email:", error.message);
    }
};


exports.sendTaskAssignmentEmail = async (assignedUser, task, project) => {
    try {
        const userEmail = assignedUser;
        // const userName = `${assignedUser.firstName} ${assignedUser.lastName}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `New Task Assigned: ${task.taskTitle}`,
            html: `
                <h2>Hi ${userName},</h2>
                <p>You have been assigned a new task in project <b>${project.projectName}</b>.</p>
                <p><b>Task:</b> ${task.taskTitle}</p>
                <p><b>Due Date:</b> ${task.dueDate}</p>
                <a href="${process.env.CLIENT_URL}/tasks/${task._id}">View Task</a>
            `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending task assignment email:", error.message);
    }
};

exports.sendProjectAssignmentEmail = async (user, project) => {
    try {
        // Get user email
        const userEmail = user.email;

        // Get project details
        const projectName = project.projectName;
        const projectDescription = project.description;

        // Prepare project assignment email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `You've been added to project: ${projectName}`,
            html: `
                <h2>Hi ${user.firstName},</h2>
                <p>You have been added to the project <b>${projectName}</b>.</p>
                <p>${projectDescription || ""}</p>
                <a href="${process.env.CLIENT_URL}/projects/${project._id}">View Project</a>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending project assignment email:", error.message);
    }
};


exports.sendMeetingInvitationEmail = async (participant, meeting) => {
    try {
        // Get participant email
        const participantEmail = participant.email;

        // Get meeting title
        const meetingTitle = meeting.title;

        // Get meeting date
        const meetingDate = meeting.date;

        // Get meeting time
        const meetingTime = meeting.time;

        // Get meeting link/location
        const meetingLocation = meeting.locationOrLink;

        // Prepare meeting invitation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: participantEmail,
            subject: `Meeting Invitation: ${meetingTitle}`,
            html: `
                <h2>You're Invited: ${meetingTitle}</h2>
                <p><b>Date:</b> ${meetingDate}</p>
                <p><b>Time:</b> ${meetingTime}</p>
                <p><b>Location/Link:</b> ${meetingLocation}</p>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending meeting invitation email:", error.message);
    }
};



exports.sendNotificationEmail = async (receiver, title, message) => {
    try {
        // Get receiver email
        const receiverEmail = receiver.email;

        // Get notification title
        const notificationTitle = title;

        // Get notification message
        const notificationMessage = message;

        // Prepare notification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: receiverEmail,
            subject: notificationTitle,
            html : `
                <h2>${notificationTitle}</h2>
                <p>${notificationMessage}</p>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending notification email:", error.message);
    }
};