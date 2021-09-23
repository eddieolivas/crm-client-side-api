const express = require("express");
const router = express.Router();

const { insertUser } = require("../models/user/User.model");
const { hashPassword } = require("../helpers/bcrypt.helper");
const { json } = require("express");

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
router.post("/login", (req, res) => {
  res.json({ status: "success", message: "Login successful" });
});

module.exports = router;
