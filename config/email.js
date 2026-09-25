
// Load environment variables
require("dotenv").config();

const nodemailer = require("nodemailer");

// Get SMTP host
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";

// Get SMTP port
const smtpPort = process.env.SMTP_PORT || 587;

// Get SMTP username/email
const smtpUser = process.env.EMAIL_USER;

// Get SMTP password
const smtpPassword = process.env.EMAIL_PASSWORD;

// Create email transporter
const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,

    // Configure secure connection
    secure: smtpPort == 465,   // 465 = SSL (secure true), 587 = TLS (secure false)

    auth: {
        user: smtpUser,
        pass: smtpPassword,
    },
});

// Export transporter
module.exports = transporter;