const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserDashboard,
} = require("../controllers/userController");
const { verifyUser } = require("../middlewares/authMiddleware");

// 🔹 User Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUser, logoutUser);

// 🔹 Protected Route (User Dashboard)
router.get("/dashboard", verifyUser, getUserDashboard);

module.exports = router;
