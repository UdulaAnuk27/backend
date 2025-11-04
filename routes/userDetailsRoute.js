const express = require("express");
const router = express.Router();
const {
  getUserDetails,
  updateUserDetails,
  deleteUserDetails,
} = require("../controllers/userDetailsController");
const { verifyUser } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Get user details
router.get("/", verifyUser, getUserDetails);

// Update user details with optional profile image
router.put("/update", verifyUser, upload.single("profile_image"), updateUserDetails);

// Delete user details
router.delete("/delete", verifyUser, deleteUserDetails);

module.exports = router;
