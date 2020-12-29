const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRE } = require("../config");

const AuthService = {
  comparePasswords(loginPassword, savedPassword) {
    return bcrypt.compareSync(loginPassword, savedPassword);
  },

  generateAuthToken(subject, payload) {
    return jwt.sign(payload, JWT_SECRET, {
      subject,
      algorithm: "HS256",
      expiresIn: JWT_EXPIRE,
    });
  },

  verifyAuthToken(token) {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
  },
};

module.exports = AuthService;
