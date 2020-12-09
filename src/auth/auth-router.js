const path = require("path");
const express = require("express");
const xss = require("xss");
const UsersService = require("../users/users-service");
const AuthService = require("./auth-service");

const authRouter = express.Router();
const jsonParser = express.json();

const serializeUser = (user) => ({
  id: user.id,
  first_name: xss(user.first_name),
  last_name: xss(user.last_name),
  username: xss(user.username),
  date_created: user.date_created,
});

authRouter.route("/login").post(jsonParser, (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  UsersService.getByUsername(req.app.get("db"), username).then((user) => {
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password." });
    }
    const isMatch = AuthService.comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password." });
    }
    const subject = user.username;
    const payload = { user_id: user.id };
    const authToken = AuthService.generateAuthToken(subject, payload);
    user.authToken = authToken;

    res.json({ user: serializeUser(user), authToken: user.authToken });
  });
});

module.exports = authRouter;
