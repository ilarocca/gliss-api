const xss = require("xss");

const camelItem = (item) => ({
  id: item.id,
  item: xss(item.item_name),
  categoryId: item.category_id,
  userId: item.user_id,
  dateCreated: item.date_created,
});

const camelRecipe = (recipe) => ({
  id: recipe.id,
  recipeName: xss(recipe.recipe_name),
  img: recipe.img,
  url: recipe.url,
  userId: recipe.user_id,
  dateCreated: recipe.date_created,
});

const camelUser = (user) => ({
  id: user.id,
  firstName: xss(user.first_name),
  lastName: xss(user.last_name),
  username: xss(user.username),
  dateCreated: user.date_created,
});

const serializeItem = (item) => ({
  item_name: xss(item.item),
  category_id: item.categoryId,
  user_id: item.userId,
});

const serializeRecipe = (recipe) => ({
  recipe_name: xss(recipe.recipeName),
  img: recipe.img,
  url: recipe.url,
  user_id: recipe.userId,
});

const serializeUser = (user) => ({
  first_name: xss(user.firstName),
  last_name: xss(user.lastName),
  username: xss(user.username),
  password: xss(user.password),
});

module.exports = {
  camelItem,
  camelRecipe,
  camelUser,
  serializeItem,
  serializeRecipe,
  serializeUser,
};
