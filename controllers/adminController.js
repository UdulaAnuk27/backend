const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ===============================
// Register Admin
// ===============================
exports.registerAdmin = async (req, res) => {
  const { first_name, last_name, mobile, password } = req.body;

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { mobile } });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = await Admin.create({
      first_name,
      last_name,
      mobile,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin.id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        mobile: admin.mobile,
        created_at: admin.created_at,
      },
    });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// Login Admin
// ===============================
exports.loginAdmin = async (req, res) => {
  const { mobile, password } = req.body;

  try {
    // Find admin by mobile
    const admin = await Admin.findOne({ where: { mobile } });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    // Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        mobile: admin.mobile,
        created_at: admin.created_at,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// Logout Admin
// ===============================
exports.logoutAdmin = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Admin logout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// Get Admin Dashboard (Protected)
// ===============================
exports.getAdminDashboard = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { id: req.user.id },
      attributes: ["id", "first_name", "last_name", "mobile", "created_at"],
    });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    return res.status(200).json({
      admin,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
