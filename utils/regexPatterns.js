// utils/regexPatterns.js

module.exports = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // sirf 6+ characters, kam se kam 1 letter aur 1 number
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
    // sirf 10 digit number
    phone: /^[6-9]\d{9}$/,
    // sirf letters aur space allowed (name ke liye)
    name: /^[A-Za-z\s]{2,50}$/,
};