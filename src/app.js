const express = require("express");
const cors = require("cors");

const apiRouter = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GIS backend is running on Vercel.",
    docs: {
      health: "/api/health",
      users: "/api/users"
    }
  });
});

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

module.exports = app;
