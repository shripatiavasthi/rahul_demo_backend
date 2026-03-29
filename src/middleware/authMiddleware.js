const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gis@123"
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "gis-static-admin-token"

const loginAdmin = (username, password) =>
  username === ADMIN_USERNAME && password === ADMIN_PASSWORD

const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""

  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    })
  }

  return next()
}

module.exports = {
  ADMIN_TOKEN,
  loginAdmin,
  requireAdminAuth
}
