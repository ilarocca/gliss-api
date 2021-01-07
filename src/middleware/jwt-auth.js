const AuthService = require("../auth/auth-service");
const UsersService = require("../users/users-service");

const requireAuth = async (req, res, next) => {
  const authToken = req.get("Authorization") || "";
  let token;

  if (!authToken.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ message: "Missing bearer token" });
  }

  token = authToken.slice("bearer ".length, authToken.length);

  try {
    const payload = AuthService.verifyAuthToken(token);
    if (!payload || payload === undefined) {
      return res.status(401).json({ message: "Unauthorized request" });
    }
    UsersService.getByUsername(req.app.get("db"), payload.sub).then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Unauthorized request" });
      } else {
        // sends back user after checking auth
        req.user = user;
        next();
      }
    });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized request" });
  }
};

module.exports = {
  requireAuth,
};
