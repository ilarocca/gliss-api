const path = require("path");
const express = require("express");
const xss = require("xss");
const UsersService = require("./users-service");
const AuthService = require("../auth/auth-service");
const { requireAuth } = require("../middleware/jwt-auth");
const { Console } = require("console");

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = (user) => ({
  id: user.id,
  first_name: xss(user.first_name),
  last_name: xss(user.last_name),
  username: xss(user.username),
  date_created: user.date_created,
});

// only admin can access get all users
usersRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    UsersService.getAllUsers(knexInstance)
      .then((users) => {
        res.json(users.map(serializeUser));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { first_name, last_name, username, password } = req.body;
    const newUser = { first_name, last_name, username, password };

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }
    // Validate
    const response = UsersService.validateUserField(newUser);
    if (response.error) {
      return res.status(400).json({ error: response });
    }
    // Check if username is available
    UsersService.getByUsername(req.app.get("db"), newUser.username).then(
      (user) => {
        if (user) {
          console.log(user);
          return res.json({
            status: 400,
            message: "Username is already in use",
          });
        }
      }
    );

    //Hash password
    newUser.password = UsersService.hashPassword(newUser.password);

    console.log(newUser.password);

    // Insert & Generate authToken
    UsersService.insertUser(req.app.get("db"), newUser)
      .then((user) => {
        const subject = user.username;
        const payload = { user_id: user.id };
        const authToken = AuthService.generateAuthToken(subject, payload);
        user.authToken = authToken;

        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${user.id}`))
          .json({ user: serializeUser(user), authToken: user.authToken });
      })
      .catch(next);

    // } catch (error) {
    //   next({ message: error.message });
    // }
  });

usersRouter
  .route("/:user_id")
  .all(requireAuth, async (req, res, next) => {
    UsersService.getById(req.app.get("db"), req.params.user_id)
      .then((user) => {
        if (!req.params.user_id === req.user.id) {
          return res.status(404).json({
            error: { message: `Unauthorized request.` },
          });
        }
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` },
          });
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user));
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(req.app.get("db"), req.params.user_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { first_name, last_name, username, password } = req.body;
    const userToUpdate = { first_name, last_name, username, password };

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'First Name', 'Last Name', 'Username' or 'password'`,
        },
      });

    UsersService.updateUser(req.app.get("db"), req.params.user_id, userToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = usersRouter;
