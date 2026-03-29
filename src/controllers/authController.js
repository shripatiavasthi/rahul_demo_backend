const { ADMIN_TOKEN, loginAdmin } = require("../middleware/authMiddleware")

const login = (req, res) => {
  const { username, password } = req.body

  if (!loginAdmin(username, password)) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    })
  }

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token: ADMIN_TOKEN,
      username
    }
  })
}

const me = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      username: process.env.ADMIN_USERNAME || "admin"
    }
  })
}

module.exports = {
  login,
  me
}
