const express = require("express");
const router = express.Router();

const { insertUser } = require("../models/user/User.model");

router.all("/", (req, res, next) => {
  //res.json({ message: "Response from user router." });
  next();
});

router.post("/", async (req, res) => {
  try {
    const result = await insertUser(req.body);
    console.log(result);

    res.json({ message: "New user created.", result });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

module.exports = router;
