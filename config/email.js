
// Load environment variables
require("dotenv").config();

const nodemailer = require("nodemailer");

// Get SMTP host
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";

// Get SMTP port
const smtpPort = Number(process.env.SMTP_PORT) || 587;

// Get SMTP username/email
const rawUser = process.env.EMAIL_USER || "amitwwl2005@gmail.com";
const smtpUser = rawUser.trim().toLowerCase() === "amitwwl@gmail.com" ? "amitwwl2005@gmail.com" : rawUser.trim();

// Get SMTP password
const smtpPassword = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, "") : "";

// Create email transporter
const transporter = nodemailer.createTransport(
    smtpHost === "smtp.gmail.com"
        ? {
              service: "gmail",
              auth: {
                  user: smtpUser,
                  pass: smtpPassword,
              },
          }
        : {
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                  user: smtpUser,
                  pass: smtpPassword,
              },
          }
);

// Export transporter
module.exports = transporter;