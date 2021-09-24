const express = require("express");
const router = express.Router();

const { insertUser, getUserByEmail } = require("../models/user/User.model");
const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const { json } = require("express");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");

router.all("/", (req, res, next) => {
  //res.json({ message: "Response from user router." });
  next();
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

  const accessJWT = createAccessJWT(user.email);
  const refreshJWT = createRefreshJWT(user.email);

  console.log(`accessJWT: ${accessJWT}`);

  res.json({
    status: "success",
    message: "Login successful",
    accessJWT,
    refreshJWT,
  });
});

module.exports = router;
