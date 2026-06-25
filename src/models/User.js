const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    accountId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    userName: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String
    },
    roles: {
      type: [String],
      default: ["user"]
    },
    profile: {
      firstName: String,
      lastName: String,
      middleName: String,
      firmName: String,
      addressSearch: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      lawyerName: String,
      licenseNumber: String,
      jurisdictionType: String,
      accountType: String,
      paymentMethod: String,
      cardholderName: String,
      cardNumberLast4: String,
      authorizationUploaded: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
