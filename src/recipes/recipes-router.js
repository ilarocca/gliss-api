const path = require("path");
const express = require("express");
const RecipesService = require("./recipes-service");
const { requireAuth } = require("../middleware/jwt-auth");
const { serializeRecipe, camelRecipe } = require("../helpers/serialize");

const recipesRouter = express.Router();
const jsonParser = express.json();

// only admin can access get all users recipes
recipesRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    RecipesService.getAllRecipes(knexInstance)
      .then((recipes) => {
        res.json(recipes.map(camelRecipe));
      })
      .catch(next);
  })
  // add new recipe
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { recipeName, img, url, ingredients, userId } = req.body;
    const newRecipe = serializeRecipe({
      recipeName,
      url,
      userId,
      img,
      ingredients,
    });

    for (const [key, value] of Object.entries(newRecipe)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    if (parseInt(req.user.id) !== parseInt(userId)) {
      return res.status(401).json({
        error: { message: "Unauthorized request." },
      });
    }
    RecipesService.insertRecipe(req.app.get("db"), newRecipe)
      .then((recipe) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${recipe.id}`))
          .json(camelRecipe(recipe));
      })
      .catch(next);
  });

recipesRouter
  .route("/:user_id/:recipe_id")
  .all(requireAuth, (req, res, next) => {
    if (parseInt(req.user.id) !== parseInt(req.params.user_id)) {
      return res.status(401).json({
        error: { message: "Unauthorized request." },
      });
    }
    RecipesService.getUserRecipe(
      req.app.get("db"),
      req.params.user_id,
      req.params.recipe_id
    )
      .then((recipe) => {
        if (!recipe) {
          return res.status(404).json({
            error: { message: `Recipe doesn't exist` },
          });
        }
        res.recipe = recipe;
        next();
      })
      .catch(next);
  })
  // delete user recipe
  .delete((req, res, next) => {
    RecipesService.deleteRecipe(req.app.get("db"), req.params.recipe_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = recipesRouter;
