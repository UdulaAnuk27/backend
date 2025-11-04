// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const sequelize = require("./config/db");

// Routes
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userDetailsRoutes = require("./routes/userDetailsRoute");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_ORIGIN, // Deployed frontend (e.g., Vercel)
      "http://localhost:5173",     // Local dev
    ],
    credentials: true,
  })
);

// ===============================
// Static file serving
// ===============================
app.use(
  "/uploads/profile_pictures",
  express.static(path.join(__dirname, "uploads/profile_pictures"))
);

// ===============================
// Routes
// ===============================
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user-details", userDetailsRoutes);
app.use("/api/tickets", ticketRoutes);

// ===============================
// Database & server start
// ===============================
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Database synced");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Database sync failed:", err.message);
  });
