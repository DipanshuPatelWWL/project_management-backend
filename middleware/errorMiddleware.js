// middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);   // debugging ke liye server console mein poora error dikha do

    // agar error mein khud status code diya gaya hai, wahi use karo, warna default 500
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        // development mein poora stack trace bhi bhejo (debugging ke liye), production mein nahi
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

module.exports = errorHandler;