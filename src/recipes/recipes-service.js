const RecipesService = {
  getAllRecipes(knex) {
    return knex.select("*").from("recipes");
  },
  insertRecipe(knex, newRecipe) {
    return knex
      .insert(newRecipe)
      .into("recipes")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from("recipes").select("*").where("id", id).first();
  },
  getUserRecipe(knex, user_id, recipe_id) {
    return knex
      .from("recipes")
      .select("*")
      .where("user_id", user_id)
      .where("id", recipe_id)
      .first();
  },
  deleteRecipe(knex, id) {
    return knex("recipes").where({ id }).delete();
  },
  updateRecipe(knex, id, newRecipeFields) {
    return knex("recipes")
      .where({ id })
      .update(newRecipeFields)
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = RecipesService;
