const connectDB = require("../config/db");
const Lead = require("../models/Lead");

const getLeads = async (req, res) => {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });

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

module.exports = {
  getLeads,
  createLead
};
