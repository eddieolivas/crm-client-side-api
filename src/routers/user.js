const express = require("express");
const router = express.Router();

const { insertUser } = require("../models/user/User.model");
const { hashPassword } = require("../helpers/bcrypt.helper");

router.all("/", (req, res, next) => {
  //res.json({ message: "Response from user router." });
  next();
});

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

module.exports = router;
