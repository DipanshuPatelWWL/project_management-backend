const jwt = require("jsonwebtoken");

// sirf userId ko payload me daal ke token banata hai
const generateToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = generateToken;