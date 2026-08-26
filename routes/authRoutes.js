const express = require("express");
const router = express.Router();
const {validateLogin} = require("../middleware/validationMiddleware");

const {
  login,
  getMe,
  changePassword,
  logout,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public Routes
router.post("/login", validateLogin, login);

// Protected Routes
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logout);

module.exports = router;

