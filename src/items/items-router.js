const path = require("path");
const express = require("express");
const ItemsService = require("./items-service");
const { requireAuth } = require("../middleware/jwt-auth");
const { serializeItem, camelItem } = require("../helpers/serialize");

const itemsRouter = express.Router();
const jsonParser = express.json();

// only admin can access get all users items
itemsRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    ItemsService.getAllItems(knexInstance)
      .then((items) => {
        res.json(items.map(camelItem));
      })
      .catch(next);
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { item, categoryId, userId } = req.body;
    const newItem = serializeItem({ item, categoryId, userId });

    for (const [key, value] of Object.entries(newItem)) {
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

    ItemsService.insertItem(req.app.get("db"), newItem)
      .then((item) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(camelItem(item));
      })
      .catch(next);
  });

itemsRouter
  .route("/:user_id/:item_id")
  .all(requireAuth, (req, res, next) => {
    if (parseInt(req.user.id) !== parseInt(req.params.user_id)) {
      return res.status(401).json({
        error: { message: "Unauthorized request." },
      });
    }
    ItemsService.getUserItem(
      req.app.get("db"),
      req.params.user_id,
      req.params.item_id
    )
      .then((item) => {
        if (!item) {
          return res.status(404).json({
            error: { message: `Item doesn't exist` },
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  //feature not in client use yet
  .get((req, res, next) => {
    res.json(camelItem(res.item));
  })
  .delete((req, res, next) => {
    ItemsService.deleteItem(req.app.get("db"), req.params.item_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  //feature not in client use yet
  .patch(jsonParser, (req, res, next) => {
    const { item_name, category_id, user_id } = req.body;
    const itemToUpdate = { item_name, category_id, user_id };

    const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'Item Name' or changed 'Category'`,
        },
      });

    ItemsService.updateItem(req.app.get("db"), req.params.item_id, itemToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = itemsRouter;
