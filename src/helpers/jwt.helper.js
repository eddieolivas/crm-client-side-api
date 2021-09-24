const jwt = require("jsonwebtoken");

const createAccessJWT = (payload) => {
  const accessToken = jwt.sign({ payload }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  return Promise.resolve(accessToken);
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
