const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

const authRoute= require("./routes/authRoutes")


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
app.use("/app/auth",authRoute);

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