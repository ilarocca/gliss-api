const ItemsService = {
  getAllItems(knex) {
    return knex.select("*").from("items");
  },
  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into("items")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from("items").select("*").where("id", id).first();
  },
  getAllUserItems(knex, id) {
    return knex.from("items").select("*").where("user_id", id);
  },
  getUserItem(knex, user_id, item_id) {
    return knex
      .from("items")
      .select("*")
      .where("user_id", user_id)
      .where("id", item_id)
      .first();
  },

  deleteItem(knex, id) {
    return knex("items").where({ id }).delete();
  },
  updateItem(knex, id, newItemFields) {
    return knex("items")
      .where({ id })
      .update(newItemFields)
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = ItemsService;
