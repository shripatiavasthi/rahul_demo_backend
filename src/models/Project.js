const mongoose = require("mongoose");

const projectImageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    _id: false
  }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true
    },
    coverImage: {
      type: projectImageSchema,
      required: true
    },
    galleryImages: {
      type: [projectImageSchema],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Project || mongoose.model("Project", projectSchema);
