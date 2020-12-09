const path = require("path");
const express = require("express");
const xss = require("xss");
const ItemsService = require("./items-service");
const { requireAuth } = require("../middleware/jwt-auth");

const itemsRouter = express.Router();
const jsonParser = express.json();

const serializeItem = (item) => ({
  id: item.id,
  item_name: xss(item.item_name),
  category_id: item.category_id,
  user_id: item.user_id,
  date_created: item.date_created,
});

// only admin can access get all users items
itemsRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    ItemsService.getAllItems(knexInstance)
      .then((items) => {
        res.json(items.map(serializeItem));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { item_name, category_id, user_id } = req.body;
    const newItem = { item_name, category_id, user_id };

    for (const [key, value] of Object.entries(newItem)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    ItemsService.insertItem(req.app.get("db"), newItem)
      .then((item) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(serializeItem(item));
      })
      .catch(next);
  });

itemsRouter.route("/:user_id").get(requireAuth, (req, res, next) => {
  ItemsService.getAllUserItems(req.app.get("db"), req.params.user_id)
    .then((items) => {
      res.json(items.map(serializeItem));
    })
    .catch(next);
});

itemsRouter
  .route("/:user_id/:item_id")
  .all(requireAuth, (req, res, next) => {
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
  .get((req, res, next) => {
    res.json(serializeItem(res.item));
  })
  .delete((req, res, next) => {
    ItemsService.deleteItem(req.app.get("db"), req.params.item_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
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
