const express = require("express");

const { getLeads, createLead } = require("../controllers/leadController");

const router = express.Router();

router.get("/", getLeads);
router.post("/", createLead);

module.exports = router;
