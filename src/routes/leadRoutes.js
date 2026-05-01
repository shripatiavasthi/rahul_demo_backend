const express = require("express");

const { getLeads, createLead, updateLeadStatus, deleteLead } = require("../controllers/leadController");

const router = express.Router();

router.get("/", getLeads);
router.post("/", createLead);
router.patch("/:id/status", updateLeadStatus);
router.delete("/:id", deleteLead);

module.exports = router;
