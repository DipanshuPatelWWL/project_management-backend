const transporter = require("../config/email");
const User = require("../models/User");

/**
 * Helper to reliably resolve an email address and display name
 * from a string, an ObjectId, or a populated User object.
 */
const resolveRecipient = async (recipient) => {
    if (!recipient) return { email: null, name: "User", username: "User", employeeId: null };

    // Case 1: Plain email string
    if (typeof recipient === "string" && recipient.includes("@")) {
        const username = recipient.split("@")[0];
        return { email: recipient.trim(), name: username, username, employeeId: null };
    }

    // Case 2: Populated user object
    if (typeof recipient === "object" && recipient.email) {
        const fullName = `${recipient.firstName || ""} ${recipient.lastName || ""}`.trim();
        const username = recipient.username || recipient.email.split("@")[0] || fullName;
        return {
            email: recipient.email,
            name: fullName || recipient.name || recipient.email,
            username: username,
            employeeId: recipient.employeeId || null,
        };
    }

    // Case 3: MongoDB ObjectId or ID string
    try {
        const userId = recipient._id || recipient;
        const found = await User.findById(userId).select("firstName lastName email employeeId username");
        if (found) {
            const fullName = `${found.firstName || ""} ${found.lastName || ""}`.trim();
            const username = found.username || found.email.split("@")[0] || fullName;
            return {
                email: found.email,
                name: fullName || found.email,
                username: username,
                employeeId: found.employeeId || null,
            };
        }
    } catch (_) {
        // Not a valid ObjectId or lookup failed
    }

    return { email: null, name: "User", username: "User", employeeId: null };
};

/**
 * Base mail dispatcher with error insulation and logging
 */
const sendMail = async ({ to, subject, html }) => {
    if (!to) {
        console.warn("⚠️ Email skipped: No valid recipient email address provided.");
        return false;
    }

    try {
        const senderEmail = (process.env.EMAIL_USER || "amitwwl2005@gmail.com").trim();
        const fromAddress = senderEmail.toLowerCase() === "amitwwl@gmail.com" ? "amitwwl2005@gmail.com" : senderEmail;
        const mailOptions = {
            from: `"Project Management" <${fromAddress}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully sent to ${to} [Message ID: ${info.messageId}]`);
        return true;
    } catch (error) {
        console.error(`❌ Email delivery failed to ${to}:`, error.message);
        return false;
    }
};

/**
 * 1. Welcome Email
 */
exports.sendWelcomeEmail = async (emailOrUser, temporaryPassword) => {
    const { email, name, username, employeeId } = await resolveRecipient(emailOrUser);
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").trim();

    return sendMail({
        to: email,
        subject: "Welcome to Project Management Portal - Your Account Details",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; padding: 24px; background-color: #ffffff;">
                <h2 style="color: #2b3a67; margin-top: 0;">Welcome, ${name}!</h2>
                <p>Your account has been successfully created in the <b>Project Management System</b>.</p>
                
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 14px 0; font-size: 15px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                        🔑 Your Login Credentials
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 7px 0; color: #64748b; width: 140px;"><b>Username / Name:</b></td>
                            <td style="padding: 7px 0; color: #0f172a; font-weight: 600;">${name || username}</td>
                        </tr>
                        <tr>
                            <td style="padding: 7px 0; color: #64748b;"><b>Email Address:</b></td>
                            <td style="padding: 7px 0; color: #0f172a; font-weight: 600;"><code>${email}</code></td>
                        </tr>
                        ${employeeId ? `
                        <tr>
                            <td style="padding: 7px 0; color: #64748b;"><b>Employee ID:</b></td>
                            <td style="padding: 7px 0; color: #0f172a; font-weight: 600;"><code>${employeeId}</code></td>
                        </tr>` : ""}
                        ${temporaryPassword ? `
                        <tr>
                            <td style="padding: 7px 0; color: #64748b;"><b>Password:</b></td>
                            <td style="padding: 7px 0; color: #0f172a; font-weight: 600;"><code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; color: #0f172a; font-size: 14px;">${temporaryPassword}</code></td>
                        </tr>` : ""}
                    </table>
                </div>

                <p style="margin: 24px 0;">
                    <a href="${clientUrl}/login" style="background: #5865f2; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Your Account</a>
                </p>

                <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
                    <b>How to log in:</b> Go to the login page, enter your email (<code>${email}</code>) and the temporary password above.
                </p>

                <hr style="border: none; border-top: 1px solid #e1e4e8; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">If you did not request this account, please contact your system administrator.</p>
            </div>
        `,
    });
};

/**
 * 2. Password Reset Email
 */
exports.sendPasswordResetEmail = async (userOrEmail, resetToken) => {
    const { email, name } = await resolveRecipient(userOrEmail);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    return sendMail({
        to: email,
        subject: "Password Reset Request",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; padding: 24px;">
                <h2 style="color: #2b3a67;">Password Reset Request</h2>
                <p>Hi ${name},</p>
                <p>We received a request to reset your password. Click the button below to set a new password. This link is valid for <b>15 minutes</b>.</p>
                <p style="margin-top: 24px;">
                    <a href="${resetLink}" style="background: #5865f2; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                </p>
                <p style="color: #888; font-size: 12px; margin-top: 24px;">If you did not request a password reset, you can safely ignore this email.</p>
            </div>
        `,
    });
};

/**
 * 3. Task Assignment Email
 * Supports both:
 *   - Object signature: sendTaskAssignmentEmail({ assignedUser, task, project })
 *   - Positional signature: sendTaskAssignmentEmail(assignedUser, task, project)
 */
exports.sendTaskAssignmentEmail = async (assignedUserOrParams, taskArg, projectArg) => {
    let targetUser = assignedUserOrParams;
    let task = taskArg;
    let project = projectArg;

    // Handle single object signature: { assignedUser, task, project }
    if (
        assignedUserOrParams &&
        typeof assignedUserOrParams === "object" &&
        !assignedUserOrParams.email &&
        (assignedUserOrParams.assignedUser || assignedUserOrParams.task)
    ) {
        targetUser = assignedUserOrParams.assignedUser;
        task = assignedUserOrParams.task;
        project = assignedUserOrParams.project;
    }

    const { email, name } = await resolveRecipient(targetUser);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const taskTitle = typeof task === "object" ? task?.taskTitle || "New Task" : task || "New Task";
    const projectName = typeof project === "object" ? project?.projectName || "Project" : project || "Project";
    const dueDate = typeof task === "object" && task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not specified";
    const priority = typeof task === "object" && task?.priority ? task.priority : "Normal";

    return sendMail({
        to: email,
        subject: `New Task Assigned: ${taskTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; padding: 24px;">
                <h2 style="color: #2b3a67;">New Task Assigned</h2>
                <p>Hi ${name},</p>
                <p>You have been assigned to a task in project <b>${projectName}</b>.</p>
                <div style="background: #f4f6fa; border-left: 4px solid #5865f2; padding: 14px; margin: 16px 0; border-radius: 4px;">
                    <p style="margin: 0 0 6px 0;"><b>Task:</b> ${taskTitle}</p>
                    <p style="margin: 0 0 6px 0;"><b>Priority:</b> <span style="text-transform: capitalize;">${priority}</span></p>
                    <p style="margin: 0;"><b>Due Date:</b> ${dueDate}</p>
                </div>
                <p style="margin-top: 24px;">
                    <a href="${clientUrl}/tasks" style="background: #5865f2; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block;">View Tasks</a>
                </p>
            </div>
        `,
    });
};

/**
 * 4. Project Assignment Email
 */
exports.sendProjectAssignmentEmail = async (userOrParams, projectArg) => {
    let targetUser = userOrParams;
    let project = projectArg;

    if (userOrParams && typeof userOrParams === "object" && !userOrParams.email && userOrParams.user) {
        targetUser = userOrParams.user;
        project = userOrParams.project;
    }

    const { email, name } = await resolveRecipient(targetUser);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const projectName = typeof project === "object" ? project?.projectName || "New Project" : project || "New Project";
    const projectDescription = typeof project === "object" ? project?.description || "" : "";

    return sendMail({
        to: email,
        subject: `You've been added to project: ${projectName}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; padding: 24px;">
                <h2 style="color: #2b3a67;">Project Invitation</h2>
                <p>Hi ${name},</p>
                <p>You have been added to the project <b>${projectName}</b>.</p>
                ${projectDescription ? `<p style="color: #555;">${projectDescription}</p>` : ""}
                <p style="margin-top: 24px;">
                    <a href="${clientUrl}/projects" style="background: #5865f2; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block;">View Project</a>
                </p>
            </div>
        `,
    });
};

/**
 * 5. Meeting Invitation Email
 */
exports.sendMeetingInvitationEmail = async (participantOrParams, meetingArg) => {
    let participant = participantOrParams;
    let meeting = meetingArg;

    if (participantOrParams && typeof participantOrParams === "object" && !participantOrParams.email && participantOrParams.participant) {
        participant = participantOrParams.participant;
        meeting = participantOrParams.meeting;
    }

    const { email, name } = await resolveRecipient(participant);
    const title = meeting?.title || "Upcoming Meeting";
    const date = meeting?.date || "TBD";
    const time = meeting?.time || "TBD";
    const location = meeting?.locationOrLink || "Online";

    return sendMail({
        to: email,
        subject: `Meeting Invitation: ${title}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; padding: 24px;">
                <h2 style="color: #2b3a67;">Meeting Invitation</h2>
                <p>Hi ${name},</p>
                <p>You are invited to attend <b>${title}</b>.</p>
                <div style="background: #f4f6fa; border-left: 4px solid #5865f2; padding: 14px; margin: 16px 0; border-radius: 4px;">
                    <p style="margin: 0 0 6px 0;"><b>Date:</b> ${date}</p>
                    <p style="margin: 0 0 6px 0;"><b>Time:</b> ${time}</p>
                    <p style="margin: 0;"><b>Location / Link:</b> ${
                        location.startsWith("http")
                            ? `<a href="${location}">${location}</a>`
                            : location
                    }</p>
                </div>
            </div>
        `,
    });
};

/**
 * 6. System Notification Email
 */
exports.sendNotificationEmail = async (receiver, title, message) => {
    const { email } = await resolveRecipient(receiver);

    return sendMail({
        to: email,
        subject: title || "New Notification",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; padding: 24px;">
                <h2 style="color: #2b3a67;">${title || "Notification"}</h2>
                <p>${message || ""}</p>
            </div>
        `,
    });
};