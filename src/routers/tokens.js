const express = require("express");
const { token } = require("morgan");
const router = express.Router();

const { createAccessJWT, verifyRefreshJWT } = require("../helpers/jwt.helper");
const { getUserByEmail } = require("../models/user/User.model");

// Return fresh JWT
router.get("/", async (req, res, next) => {
  const { authorization } = req.headers;

  // TODO
  // 1. Make sure the token is valid
  const decoded = await verifyRefreshJWT(authorization);

  if (decoded.email) {
    // 2. Check if the JWT exists in Mongo database
    const userProfile = await getUserByEmail(decoded.email);

    if (userProfile._id) {
      // 3. Make sure JWT is not expired
      let tokenExpires = userProfile.refreshJWT.addedOn;
      const dbRefreshToken = userProfile.refreshJWT.token;

      tokenExpires = tokenExpires.setDate(
        tokenExpires.getDate() + +process.env.JWT_REFRESH_TOKEN_EXPIRES
      );

      const today = new Date();

      if (dbRefreshToken !== authorization && tokenExpires < today) {
        // Token is expired
        return res.status(403).json({ message: "Forbidden" });
      }

      const accessJWT = await createAccessJWT(
        decoded.email,
        userProfile._id.toString()
      );

      // Delete old token from Redis db

      return res.json({ status: "success", accessJWT });
    }
  }

  res.status(403).json({ message: "Forbidden" });
});

module.exports = router;
