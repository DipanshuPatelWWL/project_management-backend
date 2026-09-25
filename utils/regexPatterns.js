// utils/regexPatterns.js

module.exports = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|in|co|io|ai|biz|info|me|dev|app|tech|cloud|online|site|store|[a-zA-Z]{2}(?:\.[a-zA-Z]{2})?)$/i,
    // Option B: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_\-])[A-Za-z\d@$!%*?&#^~_\-]{8,}$/,
    // 10-digit number starting with 6, 7, 8, 9
    phone: /^[6-9]\d{9}$/,
    // 6-digit postal pincode starting with 1-9
    pincode: /^[1-9][0-9]{5}$/,
    // letters and spaces only
    name: /^[A-Za-z\s]{2,50}$/,
};