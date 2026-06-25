const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const connectDB = require("../config/db")
const User = require("../models/User")
const {
  ADMIN_TOKEN,
  loginAdmin,
  signAuthToken
} = require("../middleware/authMiddleware")

const sanitizeUser = (user) => ({
  id: user._id ? user._id.toString() : undefined,
  name: user.name,
  accountId: user.accountId,
  userName: user.userName,
  email: user.email,
  roles: user.roles,
  profile: user.profile
})

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim()

const generatePassword = () => {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$"
  return Array.from(crypto.randomBytes(10))
    .map((byte) => alphabet[byte % alphabet.length])
    .join("")
}

const generateUniqueAccountId = async () => {
  let accountId = ""

  do {
    accountId = `ACC-${crypto.randomInt(100000, 999999)}`
  } while (await User.findOne({ accountId }))

  return accountId
}

const generateUniqueUserName = async ({ firstName, lastName }) => {
  const baseName =
    slugify(`${firstName || ""}${lastName || ""}`) || "user"

  let userName = ""

  do {
    userName = `${baseName}${crypto.randomInt(1000, 9999)}`
  } while (await User.findOne({ userName }))

  return userName
}

const createCredentialsText = ({ firstName, lastName, accountId, userName, password }) => {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "User"

  return [
    "Legal Tasks Management and Monitoring Software",
    "",
    "Account Registration Details",
    "----------------------------",
    `Name: ${fullName}`,
    `Account ID: ${accountId}`,
    `Username: ${userName}`,
    `Password: ${password}`,
    "",
    "Keep this file secure. Use these credentials to log in to the application.",
  ].join("\n")
}

const register = async (req, res) => {
  try {
    await connectDB()

    const {
      firstName,
      lastName,
      middleName,
      firmName,
      addressSearch,
      city,
      state,
      postalCode,
      country,
      lawyerName,
      licenseNumber,
      jurisdictionType,
      accountType,
      authorizationUploaded
    } = req.body

    if (
      !firstName ||
      !lastName ||
      !firmName ||
      !addressSearch ||
      !city ||
      !state ||
      !postalCode ||
      !country ||
      !lawyerName ||
      !licenseNumber ||
      !jurisdictionType ||
      !accountType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required signup details before submitting"
      })
    }

    if (!authorizationUploaded) {
      return res.status(400).json({
        success: false,
        message: "Authorization form must be uploaded before submission"
      })
    }

    const accountId = await generateUniqueAccountId()
    const userName = await generateUniqueUserName({ firstName, lastName })
    const password = generatePassword()
    const passwordHash = await bcrypt.hash(password, 12)
    const name =
      [firstName, lastName].filter(Boolean).join(" ").trim() || userName

    const user = await User.create({
      name,
      accountId,
      userName,
      email,
      passwordHash,
      profile: {
        firstName,
        lastName,
        middleName,
        firmName,
        addressSearch,
        city,
        state,
        postalCode,
        country,
        lawyerName,
        licenseNumber,
        jurisdictionType,
        accountType,
        authorizationUploaded: Boolean(authorizationUploaded)
      }
    })

    const token = signAuthToken({
      sub: user._id.toString(),
      accountId: user.accountId,
      userName: user.userName,
      roles: user.roles
    })

    const credentialsText = createCredentialsText({
      firstName,
      lastName,
      accountId,
      userName,
      password
    })

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token,
        user: sanitizeUser(user),
        credentials: {
          accountId,
          userName,
          password
        },
        credentialsFileName: `${userName}-login-details.txt`,
        credentialsText
      }
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to register user",
      error: error.message
    })
  }
}

const login = async (req, res) => {
  try {
    await connectDB()

    const { accountId, userName, username, password } = req.body
    const requestedUserName = userName || username

    if (!requestedUserName || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      })
    }

    let user = null

    if (accountId) {
      user = await User.findOne({ accountId, userName: requestedUserName })
    } else {
      user = await User.findOne({
        $or: [{ userName: requestedUserName }, { email: requestedUserName }]
      })
    }

    if (user?.passwordHash) {
      const passwordMatches = await bcrypt.compare(password, user.passwordHash)

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        })
      }

      const token = signAuthToken({
        sub: user._id.toString(),
        accountId: user.accountId,
        userName: user.userName,
        roles: user.roles
      })

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: sanitizeUser(user)
        }
      })
    }

    if (!loginAdmin(requestedUserName, password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token: ADMIN_TOKEN,
        user: {
          userName: requestedUserName,
          roles: ["admin"]
        }
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message
    })
  }
}

const me = (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  })
}

module.exports = {
  register,
  login,
  me
}
