const { verifyAccessJWT } = require("../helpers/jwt.helper");
const { getJWT } = require("../helpers/redis.helper");

const userAuthorization = async (req, res, next) => {
  const { authorization } = req.headers;

  // IN THIS MIDDLEWARE FUNCTION
  // 1. Verify JWT is valid
  const decodedToken = await verifyAccessJWT(authorization);

  if (decodedToken.email) {
    const userId = await getJWT(authorization);

    // 2. Check if JWT exists in Redis
    if (!userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.userId = userId;

    return next();
  }

  return res.status(403).json({ message: "Forbidden" });

  // IN USER ROUTER
  // 3. If so, extract user ID
  // 4. Get user profile based on user ID
};

module.exports = {
  userAuthorization,
};
