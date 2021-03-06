require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const usersRouter = require("./users/users-router");
const itemsRouter = require("./items/items-router");
const recipesRouter = require("./recipes/recipes-router");
const authRouter = require("./auth/auth-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(cors({ origin: true }));
app.use(morgan(morganOption));
app.use(helmet());

app.use("/api/users", usersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/auth", authRouter);

app.get("/api/", (req, res) => {
  res.json({ ok: true });
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
