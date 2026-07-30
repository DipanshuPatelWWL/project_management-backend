const express = require("express");
const router = express.Router();

const {
  auth,
  login,
  getMe,
  changePassword,
  logout,
} = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/me", auth, getMe);
router.put("/change-password", auth, changePassword);
router.post("/logout", logout);

module.exports = router;