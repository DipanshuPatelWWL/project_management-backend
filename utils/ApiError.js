// utils/ApiError.js

class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);       // parent Error class ko message diya
        this.statusCode = statusCode;
    }
}

module.exports = ApiError;