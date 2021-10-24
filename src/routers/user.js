const express = require("express");
const router = express.Router();

const {
  insertUser,
  getUserById,
  getUserByEmail,
  updatePassword,
  storeUserRefreshJWT,
  verifyUser,
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
const {
  resetPassReqValidation,
  updatePassValidation,
  newUserValidation,
} = require("../middleware/formValidation.middleware");
const { deleteJWT } = require("../helpers/redis.helper");

const verificationUrl = "http://localhost:3000/verification/";

router.all("/", (req, res, next) => {
  //res.json({ message: "Response from user router." });
  next();
});

// Get user profile router
router.get("/", userAuthorization, async (req, res) => {
  const _id = req.userId;

  const userProfile = await getUserById(_id);
  const { name, email } = userProfile;
  res.json({
    user: { _id, name, email },
  });
});

// Create new user router
router.post("/", newUserValidation, async (req, res) => {
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

    // Send activation email
    await emailProcessor({
      email,
      type: "new-user-activation",
      link: verificationUrl + result._id + "/" + result.email,
    });

    res.json({
      status: "success",
      message:
        "New user created. Please check your email to activate your account.",
      result,
    });
  } catch (error) {
    let message = "Unable to create user, please try again later.";
    if (error.message.includes("duplicate key error collection")) {
      message = "A user with this email address already exists.";
    }
    res.json({ status: "error", message });
  }
});

// Verify user router
router.patch("/verify", async (req, res) => {
  try {
    const { _id, email } = req.body;

    // Update our user isVerified value in db
    result = await verifyUser(_id, email);

    if (result && result.id) {
      return res.json({
        status: "success",
        message: "Your user account has been verified. You may log in now.",
      });
    }

    return res.json({
      status: "error ",
      message: "Invalid request.",
    });
  } catch (error) {
    return res.json({
      status: "error ",
      message: "Invalid request.",
    });
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

  if (!user.isVerified) {
    return res.json({
      status: "error",
      message:
        "Your user account has not been verified. Please check your email and verify your account before you log in.",
    });
  }

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

// Reset password router
router.post("/reset-password", resetPassReqValidation, async (req, res) => {
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
}); // End reset password request router

router.patch("/reset-password", updatePassValidation, async (req, res) => {
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
}); // End update password router

// User logout and invalidate JWTs
router.delete("/logout", userAuthorization, async (req, res) => {
  const { authorization } = req.headers;
  const _id = req.userId;

  // Delete accessJWT from Redis
  deleteJWT(authorization);

  // Delete refreshJWT from Mongodb
  const result = await storeUserRefreshJWT(_id, "");

  if (result && result._id) {
    return res.json({
      status: "success",
      message: "User successfully logged out.",
    });
  }

  res.json({
    status: "error",
    message: "Unable to log you out, please try again later.",
  });
});

module.exports = router;
