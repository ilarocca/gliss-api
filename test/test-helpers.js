"use strict";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function createAuthToken(
  user,
  secret = process.env.JWT_SECRET,
  expiry = process.env.JWT_EXPIRY
) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    expiresIn: "24h",
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  createAuthToken,
};
