const express = require("express");
const router = express.Router();

const {
  insertUser,
  getUserById,
  getUserByEmail,
} = require("../models/user/User.model");
const { setPasswordResetPin } = require("../models/resetPin/ResetPin.model");
const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");
const {
  userAuthorization,
} = require("../middleware/userAuthorization.middleware");
const { emailProcessor } = require("../helpers/email.helper");

router.all("/", (req, res, next) => {
  //res.json({ message: "Response from user router." });
  next();
});

// User profile router
router.get("/", userAuthorization, async (req, res) => {
  const _id = req.userId;

  const userProfile = await getUserById(_id);

  res.json({
    user: userProfile,
  });
});

// Create new user router
router.post("/", async (req, res) => {
  const { name, company, address, phone, email, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await hashPassword(password);

    const newUserObject = {
      name,
      company,
      address,
      phone,
      email,
      password: hashedPassword,
    };

    const result = await insertUser(newUserObject);
    console.log(result);

    res.json({ message: "New user created.", result });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// User sign in router
router.post("/login", async (req, res) => {
  console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    res.json({
      status: "error",
      message: "Please provide a valid email and password.",
    });
  }

  // Get user with email from db
  const user = await getUserByEmail(email);

  const passwordFromDb = user && user._id ? user.password : null;

  if (!passwordFromDb) {
    return res.json({ status: "error", message: "Invalid email or password." });
  }

  // Hash our password and compare with the db value
  const result = await comparePassword(password, passwordFromDb);

  if (!result) {
    return res.json({ status: "error", message: "Invalid email or password." });
  }

  const accessJWT = await createAccessJWT(user.email, `${user._id}`);
  const refreshJWT = await createRefreshJWT(user.email, `${user._id}`);

  res.json({
    status: "success",
    message: "Login successful",
    accessJWT,
    refreshJWT,
  });
}); // End user sign in router

// TODOS
// A. Create and send password reset pin number
// 1. Receive email - DONE
// 2. Check if user exists for that email - DONE
// 3. Create unique 6 digit pin - DONE
// 4. Email the pin

// B. Update password in DB
// 1. Receive email, pin, and new password
// 2. Validate pin
// 3. Encrypt new password
// 4. Update password in db
// 5. Send password changed email notification

// C. Server side form validation
// 1. Create middleware to validate form data

router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);

  if (user && user._id) {
    // Create the unique password reset pin
    const setPin = await setPasswordResetPin(email);
    const result = await emailProcessor(email, setPin.pin);

    if (result.messageId) {
      return res.json({
        status: "success",
        message:
          "If the user exists, the password reset pin will be sent shortly.",
      });
    }

    return res.json({
      status: "error",
      message: "Unable to process your request. Please try again later.",
    });
  }

  res.json({
    status: "error",
    message: "If the user exists, the password reset pin will be sent shortly.",
  });
});

module.exports = router;
