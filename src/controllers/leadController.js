const connectDB = require("../config/db");
const Lead = require("../models/Lead");

const validStatuses = ["new", "pending", "completed", "rejected"];

const getLeads = async (req, res) => {
  try {
    await connectDB();
    const leads = await Lead.find({ isVisible: { $ne: false } }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: leads
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message
    });
  }
};

const createLead = async (req, res) => {
  try {
    await connectDB();

    const {
      fullName,
      phone,
      email,
      location,
      message,
      source
    } = req.body;

    if (!fullName || !phone || !email || !location || !message) {
      return res.status(400).json({
        success: false,
        message: "fullName, phone, email, location, and message are required"
      });
    }

    const lead = await Lead.create({
      fullName,
      phone,
      email,
      location,
      message,
      source: source || "contact-page"
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to create lead",
      error: error.message
    });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    await connectDB();

    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: lead
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update lead status",
      error: error.message
    });
  }
};

const deleteLead = async (req, res) => {
  try {
    await connectDB();

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isVisible: false },
      {
        new: true,
        runValidators: true
      }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead hidden successfully",
      data: lead
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to hide lead",
      error: error.message
    });
  }
};

module.exports = {
  getLeads,
  createLead,
  updateLeadStatus,
  deleteLead
};
