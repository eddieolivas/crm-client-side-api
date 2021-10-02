const express = require("express");
const router = express.Router();

const {
  insertUser,
  getUserById,
  getUserByEmail,
  updatePassword,
} = require("../models/user/User.model");
const {
  setPasswordResetPin,
  getPinByEmailPin,
  deletePin,
} = require("../models/resetPin/ResetPin.model");
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

// C. Server side form validation
// 1. Create middleware to validate form data

router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);

  if (user && user._id) {
    // Create the unique password reset pin
    const setPin = await setPasswordResetPin(email);
    // Send the password reset pin email
    await emailProcessor({
      email,
      pin: setPin.pin,
      type: "request-new-password",
    });

    return res.json({
      status: "success",
      message:
        "If the user exists, the password reset pin will be sent shortly.",
    });
  }

  res.json({
    status: "error",
    message: "If the user exists, the password reset pin will be sent shortly.",
  });
});

router.patch("/reset-password", async (req, res) => {
  const { email, pin, password } = req.body;

  const getPin = await getPinByEmailPin(email, pin);

  if (getPin) {
    const dbDate = getPin.addedAt;
    const expiresIn = 1;
    let expireDate = dbDate.setDate(dbDate.getDate() + expiresIn);

    const today = new Date();

    if (today > expireDate) {
      return res.json({ status: "error", message: "Invalid or expired pin." });
    }

    // Encrypt the new password
    const hashedPass = await hashPassword(password);

    // Update the password in Mongo
    const result = await updatePassword(email, hashedPass);

    if (result && result._id) {
      await emailProcessor({ email, type: "password-update-success" });

      // Delete pin from db
      deletePin(email, pin);

      return res.json({
        status: "success",
        message: "Your password has been updated",
      });
    }
  }

  res.json("Unable to update password, please try again later.");
});

module.exports = router;
