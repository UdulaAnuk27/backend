// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendSMS = require("../utils/sendSMS");

// ===============================
// Register User
// ===============================
exports.registerUser = async (req, res) => {
  const { first_name, last_name, mobile, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { mobile } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      first_name,
      last_name,
      mobile,
      password: hashedPassword,
    });

    // ✅ Send Registration SMS
    try {
      const msg = `Hi ${first_name} ${last_name}, welcome to Event Ticketing System! Your account has been created successfully.`;
      await sendSMS(mobile, msg);
      console.log("✅ Registration SMS sent to", mobile);
    } catch (smsErr) {
      console.warn("⚠️ Failed to send registration SMS:", smsErr.message);
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// Login User
// ===============================
exports.loginUser = async (req, res) => {
  const { mobile, password } = req.body;

  try {
    const user = await User.findOne({ where: { mobile } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Send Login SMS
    try {
      const msg = `Hello ${user.first_name} ${user.last_name}, you have successfully logged into Event Ticketing System!`;
      await sendSMS(user.mobile, msg);
      console.log("✅ Login SMS sent to", user.mobile);
    } catch (smsErr) {
      console.warn("⚠️ Failed to send login SMS:", smsErr.message);
    }

    // Send token cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// Logout User
// ===============================
exports.logoutUser = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// Get User Dashboard (Protected)
// ===============================
exports.getUserDashboard = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ["id", "first_name", "last_name", "mobile", "created_at"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
