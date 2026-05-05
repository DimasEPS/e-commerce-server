const User = require("../../models/User");
const Product = require("../../models/Product");

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (e) {
    console.log("Error in getAllUsers:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting yourself
    if (userToDelete._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (e) {
    console.log("Error in deleteUser:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get dashboard statistics (admin only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const recentUsers = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);
    const recentProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalAdmins,
        recentUsers,
        recentProducts,
      },
    });
  } catch (e) {
    console.log("Error in getDashboardStats:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getAllUsers, deleteUser, getDashboardStats };
