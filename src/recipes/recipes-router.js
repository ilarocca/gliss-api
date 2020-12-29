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
        res.json(recipes.map(serializeRecipe));
      })
      .catch(next);
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { recipeName, img, url, userId } = req.body;
    const newRecipe = serializeRecipe({ recipeName, url, userId, img });

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

    // newRecipe.img = img;

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
    console.log(req.params.user_id);
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
  .get((req, res, next) => {
    res.json(serializeRecipe(res.recipe));
  })
  .delete((req, res, next) => {
    RecipesService.deleteRecipe(req.app.get("db"), req.params.recipe_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { recipe_name, img, url, user_id } = req.body;
    const recipeToUpdate = { recipe_name, url, user_id };

    const numberOfValues = Object.values(recipeToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'Recipe Name', 'URL', 'User Id'`,
        },
      });

    //img not mandatory
    recipeToUpdate.img = img;

    RecipesService.updateRecipe(
      req.app.get("db"),
      req.params.recipe_id,
      recipeToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = recipesRouter;
