const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const sequelize = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userDetailsRoutes = require("./routes/userDetailsRoute");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN, // e.g., "http://localhost:5173"
    credentials: true,
  })
);

// Serve uploaded profile images statically
app.use(
  "/uploads/profile_pictures",
  express.static(path.join(__dirname, "uploads/profile_pictures"))
);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user-details", userDetailsRoutes);
app.use("/api/tickets", ticketRoutes);

// Sync database and start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Database synced");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Database sync failed:", err);
  });
