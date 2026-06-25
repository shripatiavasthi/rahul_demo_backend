const jwt = require("jsonwebtoken")

const User = require("../models/User")
const connectDB = require("../config/db")

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gis@123"
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "gis-static-admin-token"
const JWT_SECRET = process.env.JWT_SECRET || "replace-with-a-strong-secret"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

const loginAdmin = (username, password) =>
  username === ADMIN_USERNAME && password === ADMIN_PASSWORD

const signAuthToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    })
  }

  if (token === ADMIN_TOKEN) {
    req.user = {
      userName: ADMIN_USERNAME,
      roles: ["admin"]
    }
    return next()
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    await connectDB()
    const user = await User.findById(payload.sub).select("-passwordHash")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      })
    }

    req.user = user
    return next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    })
  }
}

const authorize = (...roles) => (req, res, next) => {
  const hasAccess = roles.some((role) => req.user?.roles?.includes(role))

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: "Forbidden"
    })
  }

  return next()
}

module.exports = {
  ADMIN_TOKEN,
  authenticate,
  authorize,
  loginAdmin,
  requireAdminAuth: authenticate,
  signAuthToken
}
