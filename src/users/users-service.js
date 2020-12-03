const UsersService = {
  getAllUsers(knex) {
    return knex.select("*").from("gliss_users");
  },
  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into("gliss_users")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from("gliss_users").select("*").where("id", id).first();
  },
  deleteUser(knex, id) {
    return knex("gliss_users").where({ id }).delete();
  },
  updateUser(knex, id, newUserFields) {
    return knex("gliss_users").where({ id }).update(newUserFields);
  },
};

module.exports = UsersService;
