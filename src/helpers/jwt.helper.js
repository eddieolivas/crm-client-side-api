const jwt = require("jsonwebtoken");
const { storeUserRefreshJWT } = require("../models/user/User.model");

const { setJWT, getJWT } = require("./redis.helper");

const createAccessJWT = async (email, _id) => {
  try {
    const accessToken = await jwt.sign(
      { email },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      }
    );

    await setJWT(accessToken, _id);

    return Promise.resolve(accessToken);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createRefreshJWT = async (email, _id) => {
  try {
    const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    await storeUserRefreshJWT(_id, refreshToken);
    return Promise.resolve(refreshToken);
  } catch (error) {
    return Promise.reject(error);
  }
};

const verifyAccessJWT = (accessJWT) => {
  try {
    return Promise.resolve(
      jwt.verify(accessJWT, process.env.JWT_ACCESS_SECRET)
    );
  } catch (error) {
    return Promise.resolve(error);
  }
};

const verifyRefreshJWT = (refreshJWT) => {
  try {
    return Promise.resolve(
      jwt.verify(refreshJWT, process.env.JWT_REFRESH_SECRET)
    );
  } catch (error) {
    return Promise.resolve(error);
  }
};

module.exports = {
  createAccessJWT,
  createRefreshJWT,
  verifyAccessJWT,
  verifyRefreshJWT,
};
