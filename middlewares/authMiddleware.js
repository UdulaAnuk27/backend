const jwt = require("jsonwebtoken");

// Verify token
const verifyToken = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.header("Authorization")?.startsWith("Bearer ")
        ? req.header("Authorization").replace("Bearer ", "")
        : null);

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Verify user role
const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({ message: "Access restricted to users only." });
    }
    next();
  });
};

// Verify admin role
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access restricted to admins only." });
    }
    next();
  });
};

module.exports = { verifyToken, verifyUser, verifyAdmin };
