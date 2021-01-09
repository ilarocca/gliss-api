const express = require("express");
const UsersService = require("../users/users-service");
const AuthService = require("./auth-service");
const { camelUser } = require("../helpers/serialize");
const { requireAuth } = require("../middleware/jwt-auth");

const authRouter = express.Router();
const jsonParser = express.json();

//get user by username and password
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
    console.log(user);
    const subject = user.username;
    const payload = { user_id: user.id };
    const authToken = AuthService.generateAuthToken(subject, payload);

    res.status(201).json({ user: camelUser(user), authToken });
  });
});

//get current user with authToken
authRouter.route("/current-user").get(requireAuth, async (req, res, next) => {
  const user = camelUser(req.user);
  try {
    res.json(user);
  } catch (err) {
    next({ status: 500, message: err.message });
  }
});

module.exports = authRouter;
