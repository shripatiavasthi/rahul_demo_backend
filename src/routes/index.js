const express = require("express");

const authRoutes = require("./authRoutes");
const fileRoutes = require("./fileRoutes");
const healthRoutes = require("./healthRoutes");
const leadRoutes = require("./leadRoutes");
const projectRoutes = require("./projectRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/files", fileRoutes);
router.use("/health", healthRoutes);
router.use("/leads", leadRoutes);
router.use("/projects", projectRoutes);
router.use("/users", userRoutes);

module.exports = router;
