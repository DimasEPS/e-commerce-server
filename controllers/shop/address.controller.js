const Address = require("../../models/Address");

// Get all addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: addresses });
  } catch (e) {
    console.log("Error in getAddresses:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add address
const addAddress = async (req, res) => {
  try {
    const { label, name, phone, address, city, province, postalCode } =
      req.body;

    // If this is the first address, make it default
    const count = await Address.countDocuments({ userId: req.user.id });
    const isDefault = count === 0;

    const newAddress = new Address({
      userId: req.user.id,
      label,
      name,
      phone,
      address,
      city,
      province,
      postalCode,
      isDefault,
    });

    await newAddress.save();
    res.status(201).json({
      success: true,
      message: "Address added",
      data: newAddress,
    });
  } catch (e) {
    console.log("Error in addAddress:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const addr = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!addr) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    const { label, name, phone, address, city, province, postalCode } =
      req.body;
    if (label !== undefined) addr.label = label;
    if (name !== undefined) addr.name = name;
    if (phone !== undefined) addr.phone = phone;
    if (address !== undefined) addr.address = address;
    if (city !== undefined) addr.city = city;
    if (province !== undefined) addr.province = province;
    if (postalCode !== undefined) addr.postalCode = postalCode;

    await addr.save();
    res
      .status(200)
      .json({ success: true, message: "Address updated", data: addr });
  } catch (e) {
    console.log("Error in updateAddress:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const addr = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!addr) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    // If deleted address was default, make the first remaining one default
    if (addr.isDefault) {
      const first = await Address.findOne({ userId: req.user.id });
      if (first) {
        first.isDefault = true;
        await first.save();
      }
    }

    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (e) {
    console.log("Error in deleteAddress:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Set address as default
const setDefaultAddress = async (req, res) => {
  try {
    // Unset all defaults for this user
    await Address.updateMany(
      { userId: req.user.id },
      { $set: { isDefault: false } }
    );

    const addr = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!addr) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    res.status(200).json({
      success: true,
      message: "Default address updated",
      data: addr,
    });
  } catch (e) {
    console.log("Error in setDefaultAddress:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
