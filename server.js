require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is not set. User CRUD routes will fail until it is configured.");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
