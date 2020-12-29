const path = require("path");
const express = require("express");
const xss = require("xss");
const UsersService = require("../users/users-service");
const AuthService = require("./auth-service");
const { camelUser } = require("../helpers/serialize");

const authRouter = express.Router();
const jsonParser = express.json();

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

    res.json({ user: camelUser(user), authToken });
  });
});

module.exports = authRouter;
