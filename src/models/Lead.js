const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      default: "contact-page",
      trim: true
    },
    status: {
      type: String,
      default: "new",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
