const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const companyRoute = require("./routes/companyRoutes");
const clientRoute = require("./routes/clientRoutes");
const projectRoute = require("./routes/projectRoutes");
const sprintRoute = require("./routes/sprintRoutes");
const taskRoute = require("./routes/taskRoutes");
const bugRoute = require("./routes/bugRoutes");
const meetingRoute = require("./routes/meetingRoutes");
const documentRoute = require("./routes/documentRoutes")
const notificationRoute = require("./routes/notificationRoutes");
const timelogRoute = require("./routes/timelogRoutes");
const dashboardRoute = require("./routes/dashboardRoutes");
const auditLogRoute = require("./routes/auditLogRoutes");
const searchRoute = require("./routes/searchRoutes");
const reportRoute = require("./routes/reportRoutes");

// Check route imports
// console.log("authRoute:", typeof authRoute);
// console.log("userRoute:", typeof userRoute);
// console.log("companyRoute:", typeof companyRoute);
// console.log("clientRoute:", typeof clientRoute);
// console.log("projectRoute:", typeof projectRoute);

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =======================
// API Routes
// =======================
app.use("/api/auth", authRoute);
app.use("/api/company", companyRoute);
app.use("/api/users", userRoute);
app.use("/api/client", clientRoute);
app.use("/api/project", projectRoute);
app.use("/api/sprint", sprintRoute);
app.use("/api/task", taskRoute);
app.use("/api/bug", bugRoute);
app.use("/api/meeting", meetingRoute);
app.use("/api/document", documentRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/timeLog", timelogRoute);
app.use("api/dashboard", dashboardRoute);
app.use("/api/audit-logs", auditLogRoute);
app.use("/api/search", searchRoute);
app.use("/api/reports", reportRoute);


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Project Management System API Running",
    });
});


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found",
    });
});


module.exports = app;