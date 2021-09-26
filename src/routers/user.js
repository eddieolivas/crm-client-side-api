const express = require("express");
const router = express.Router();

const {
  insertUser,
  getUserById,
  getUserByEmail,
} = require("../models/user/User.model");
const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");
const {
  userAuthorization,
} = require("../middleware/userAuthorization.middleware");

router.all("/", (req, res, next) => {
  //res.json({ message: "Response from user router." });
  next();
});

// User profile router
router.get("/", userAuthorization, async (req, res) => {
  // Example user data from database.
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

module.exports = router;
