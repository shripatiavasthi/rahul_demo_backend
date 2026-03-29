const express = require("express");

const {
  createProject,
  getProjects,
  getProjectBySlug,
  updateProject,
  addProjectGalleryImages,
  deleteProjectGalleryImage,
  deleteProject
} = require("../controllers/projectController");
const { requireAdminAuth } = require("../middleware/authMiddleware")

const router = express.Router();

router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);
router.post("/", requireAdminAuth, createProject);
router.put("/:slug", requireAdminAuth, updateProject);
router.delete("/:slug", requireAdminAuth, deleteProject);
router.post("/:slug/gallery", requireAdminAuth, addProjectGalleryImages);
router.delete("/:slug/gallery", requireAdminAuth, deleteProjectGalleryImage);

module.exports = router;
