const bcrypt = require("bcryptjs");
const User = require("../../models/User");

// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (e) {
    console.log("Error in getProfile:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { userName, phone, city, province, bio } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (userName !== undefined) user.userName = userName;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (province !== undefined) user.province = province;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const updated = user.toObject();
    delete updated.password;

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: updated,
    });
  } catch (e) {
    console.log("Error in updateProfile:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (e) {
    console.log("Error in changePassword:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
