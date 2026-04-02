const { DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

const connectDB = require("../config/db");
const { getS3Bucket, getS3Client, getS3Region } = require("../config/s3");
const Project = require("../models/Project");

const buildPublicUrl = (key) =>
  `https://${getS3Bucket()}.s3.${getS3Region()}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, "/")}`;

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const uploadImageToS3 = async ({ folder, fileName, content, contentType }) => {
  const s3 = getS3Client();
  const safeName = fileName || `${folder}-${Date.now()}.jpg`;
  const key = `${folder}/${Date.now()}-${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: key,
      Body: Buffer.from(content, "base64"),
      ContentType: contentType || "image/jpeg"
    })
  );

  return {
    key,
    url: buildPublicUrl(key)
  };
};

const deleteImageFromS3 = async (key) => {
  const s3 = getS3Client()

  await s3.send(
    new DeleteObjectCommand({
      Bucket: getS3Bucket(),
      Key: key
    })
  )
}

const mapProjectCard = (project) => ({
  id: project._id,
  slug: project.slug,
  name: project.name,
  shortDescription: project.shortDescription,
  coverImage: project.coverImage,
  galleryCount: project.galleryImages.length
});

const createProject = async (req, res) => {
  try {
    await connectDB();

    const {
      name,
      shortDescription,
      coverPhoto,
      gallery = []
    } = req.body;

    if (!name || !shortDescription || !coverPhoto?.content) {
      return res.status(400).json({
        success: false,
        message: "name, shortDescription, and coverPhoto.content are required"
      });
    }

    const slug = slugify(name);
    const existingProject = await Project.findOne({ slug });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "A project with this name already exists"
      });
    }

    const uploadedCover = await uploadImageToS3({
      folder: "projects/covers",
      fileName: coverPhoto.fileName,
      content: coverPhoto.content,
      contentType: coverPhoto.contentType
    });

    const galleryImages = [];

    for (const image of gallery) {
      if (!image?.content) {
        continue;
      }

      const uploadedImage = await uploadImageToS3({
        folder: "projects/gallery",
        fileName: image.fileName,
        content: image.content,
        contentType: image.contentType
      });

      galleryImages.push({
        ...uploadedImage,
        caption: image.caption || ""
      });
    }

    const project = await Project.create({
      name,
      slug,
      shortDescription,
      coverImage: {
        ...uploadedCover,
        caption: coverPhoto.caption || ""
      },
      galleryImages
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message
    });
  }
};

const getProjects = async (req, res) => {
  try {
    await connectDB();
    const projects = await Project.find({ isFeatured: true }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: projects.map(mapProjectCard)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message
    });
  }
};

const updateProject = async (req, res) => {
  try {
    await connectDB()
    const project = await Project.findOne({ slug: req.params.slug })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      })
    }

    const { name, shortDescription, coverPhoto, isFeatured } = req.body

    if (name) {
      const nextSlug = slugify(name)
      if (nextSlug !== project.slug) {
        const existingProject = await Project.findOne({ slug: nextSlug })
        if (existingProject) {
          return res.status(409).json({
            success: false,
            message: "Another project with this name already exists"
          })
        }

        project.slug = nextSlug
      }

      project.name = name
    }

    if (shortDescription) {
      project.shortDescription = shortDescription
    }

    if (typeof isFeatured === "boolean") {
      project.isFeatured = isFeatured
    }

    if (coverPhoto?.content) {
      if (project.coverImage?.key) {
        await deleteImageFromS3(project.coverImage.key)
      }

      const uploadedCover = await uploadImageToS3({
        folder: "projects/covers",
        fileName: coverPhoto.fileName,
        content: coverPhoto.content,
        contentType: coverPhoto.contentType
      })

      project.coverImage = {
        ...uploadedCover,
        caption: coverPhoto.caption || ""
      }
    }

    await project.save()

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message
    })
  }
}

const getProjectBySlug = async (req, res) => {
  try {
    await connectDB();
    const project = await Project.findOne({ slug: req.params.slug });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      data: project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message
    });
  }
};

const addProjectGalleryImages = async (req, res) => {
  try {
    await connectDB();
    const project = await Project.findOne({ slug: req.params.slug });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const { gallery = [] } = req.body;

    if (!Array.isArray(gallery) || gallery.length === 0) {
      return res.status(400).json({
        success: false,
        message: "gallery array is required"
      });
    }

    for (const image of gallery) {
      if (!image?.content) {
        continue;
      }

      const uploadedImage = await uploadImageToS3({
        folder: "projects/gallery",
        fileName: image.fileName,
        content: image.content,
        contentType: image.contentType
      });

      project.galleryImages.push({
        ...uploadedImage,
        caption: image.caption || ""
      });
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Gallery images added successfully",
      data: project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add gallery images",
      error: error.message
    });
  }
};

const deleteProjectGalleryImage = async (req, res) => {
  try {
    await connectDB()
    const imageKey = req.query.key

    if (!imageKey) {
      return res.status(400).json({
        success: false,
        message: "key query parameter is required"
      })
    }

    const project = await Project.findOne({ slug: req.params.slug })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      })
    }

    const image = project.galleryImages.find((item) => item.key === imageKey)

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found"
      })
    }

    await deleteImageFromS3(image.key)
    project.galleryImages = project.galleryImages.filter((item) => item.key !== imageKey)
    await project.save()

    return res.status(200).json({
      success: true,
      message: "Gallery image deleted successfully",
      data: project
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete gallery image",
      error: error.message
    })
  }
}

const updateProjectGalleryImageCaption = async (req, res) => {
  try {
    await connectDB()
    const { key, caption } = req.body

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "key is required"
      })
    }

    const project = await Project.findOne({ slug: req.params.slug })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      })
    }

    const image = project.galleryImages.find((item) => item.key === key)

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found"
      })
    }

    image.caption = typeof caption === "string" ? caption.trim() : ""
    await project.save()

    return res.status(200).json({
      success: true,
      message: "Gallery image caption updated successfully",
      data: project
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update gallery image caption",
      error: error.message
    })
  }
}

const deleteProject = async (req, res) => {
  try {
    await connectDB()
    const project = await Project.findOne({ slug: req.params.slug })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      })
    }

    if (project.coverImage?.key) {
      await deleteImageFromS3(project.coverImage.key)
    }

    for (const image of project.galleryImages) {
      await deleteImageFromS3(image.key)
    }

    await Project.deleteOne({ _id: project._id })

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message
    })
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectBySlug,
  updateProject,
  addProjectGalleryImages,
  updateProjectGalleryImageCaption,
  deleteProjectGalleryImage,
  deleteProject
};
