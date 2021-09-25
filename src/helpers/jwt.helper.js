const jwt = require("jsonwebtoken");

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

const createRefreshJWT = (payload) => {
  const refreshToken = jwt.sign({ payload }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return Promise.resolve(refreshToken);
};

module.exports = {
  createAccessJWT,
  createRefreshJWT,
};
