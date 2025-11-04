const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminDashboard,
} = require("../controllers/adminController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

// 🔹 Admin Authentication Routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", verifyAdmin, logoutAdmin);

// 🔹 Protected Route (Admin Dashboard)
router.get("/dashboard", verifyAdmin, getAdminDashboard);

module.exports = router;
