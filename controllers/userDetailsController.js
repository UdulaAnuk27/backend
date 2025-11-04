const User = require("../models/User");
const UserDetails = require("../models/UserDetails");
const path = require("path");

// GET user details
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["id", "first_name", "last_name", "mobile", "created_at"],
      include: [
        {
          model: UserDetails,
          as: "details",
          attributes: ["id", "email", "profile_image", "date_of_birth", "address", "created_at"],
        },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const profileImage = user.details?.profile_image
      ? `${req.protocol}://${req.get("host")}/uploads/profile_pictures/${user.details.profile_image}`
      : "https://cdn-icons-png.flaticon.com/512/847/847969.png";

    res.status(200).json({
      message: "User details fetched successfully",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
        details: {
          email: user.details?.email || "",
          profile_image: profileImage,
          date_of_birth: user.details?.date_of_birth || null,
          address: user.details?.address || "",
        },
      },
    });
  } catch (err) {
    console.error("Get details error:", err);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};

// CREATE or UPDATE user details (with image)
exports.updateUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, date_of_birth, address } = req.body;

    let profile_image;
    if (req.file) {
      profile_image = req.file.originalname;
    }

    let details = await UserDetails.findOne({ where: { user_id: userId } });

    if (!details) {
      details = await UserDetails.create({
        user_id: userId,
        email,
        profile_image,
        date_of_birth,
        address,
      });
    } else {
      await details.update({ email, profile_image, date_of_birth, address });
    }

    // Return full image URL
    const fullProfileImage = details.profile_image
      ? `${req.protocol}://${req.get("host")}/uploads/profile_pictures/${details.profile_image}`
      : null;

    res.status(200).json({
      message: "User details updated successfully",
      details: {
        ...details.toJSON(),
        profile_image: fullProfileImage,
      },
    });
  } catch (err) {
    console.error("Update details error:", err);
    res.status(500).json({ message: "Failed to update user details" });
  }
};

// DELETE user details
exports.deleteUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const details = await UserDetails.findOne({ where: { user_id: userId } });

    if (!details) return res.status(404).json({ message: "User details not found" });

    await details.destroy();
    res.status(200).json({ message: "User details deleted successfully" });
  } catch (err) {
    console.error("Delete details error:", err);
    res.status(500).json({ message: "Failed to delete user details" });
  }
};
