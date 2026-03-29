const mongoose = require("mongoose");

const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
};

module.exports = {
  getHealthStatus
};
