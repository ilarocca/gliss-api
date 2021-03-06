const path = require("path");
const express = require("express");
const UsersService = require("./users-service");
const AuthService = require("../auth/auth-service");
const { requireAuth } = require("../middleware/jwt-auth");
const {
  serializeUser,
  camelUser,
  camelItem,
  camelRecipe,
} = require("../helpers/serialize");

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter
  // only admin can access get all users
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    UsersService.getAllUsers(knexInstance)
      .then((users) => {
        res.json(users.map(camelUser));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { firstName, lastName, username, password } = req.body;
    //serialize camelCase to db syntax
    const newUser = serializeUser({ firstName, lastName, username, password });

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
          return res.json({
            status: 400,
            message: "Username is already in use",
          });
        }
      }
    );

    //Hash password
    newUser.password = UsersService.hashPassword(newUser.password);

    // Insert & Generate authToken
    UsersService.insertUser(req.app.get("db"), newUser)
      .then((user) => {
        const subject = user.username;
        const payload = { user_id: user.id };
        const authToken = AuthService.generateAuthToken(subject, payload);

        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${user.id}`))
          .json({ user: camelUser(user), authToken: authToken });
      })
      .catch(next);
  });

// for future incorporation
usersRouter
  .route("/:user_id")
  .all(requireAuth, (req, res, next) => {
    if (parseInt(req.user.id) !== parseInt(req.params.user_id)) {
      return res.status(401).json({
        error: { message: "Unauthorized request." },
      });
    }
    UsersService.getById(req.app.get("db"), req.params.user_id)
      .then((user) => {
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
    res.json(camelUser(res.user));
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(req.app.get("db"), req.params.user_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

//get all user items
usersRouter.route("/:user_id/items").get(requireAuth, (req, res, next) => {
  if (parseInt(req.user.id) !== parseInt(req.params.user_id)) {
    return res.status(401).json({
      error: { message: "Unauthorized request." },
    });
  }
  UsersService.getAllUserItems(req.app.get("db"), req.params.user_id)
    .then((items) => {
      res.json(items.map(camelItem));
    })
    .catch(next);
});

//get all user recipes
usersRouter.route("/:user_id/recipes").get(requireAuth, (req, res, next) => {
  if (parseInt(req.user.id) !== parseInt(req.params.user_id)) {
    return res.status(401).json({
      error: { message: "Unauthorized request." },
    });
  }
  UsersService.getAllUserRecipes(req.app.get("db"), req.params.user_id)
    .then((recipes) => {
      res.json(recipes.map(camelRecipe));
    })
    .catch(next);
});

module.exports = usersRouter;
