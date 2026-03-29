const express = require("express");

const {
  listFiles,
  uploadFile,
  getFileUrl
} = require("../controllers/fileController");

const router = express.Router();

router.get("/", listFiles);
router.post("/upload", uploadFile);
router.post("/store", uploadFile);
router.get("/url", getFileUrl);

module.exports = router;
