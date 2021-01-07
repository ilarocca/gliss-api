const app = require("../src/app");
const knex = require("knex");
const supertest = require("supertest");
const helpers = require("./test-helpers");
const { makeUsersArray, camelUsersArray } = require("./users.fixtures");
const { camelItemsArray, makeItemsArray } = require("./items.fixtures");
const { camelRecipesArray, makeRecipesArray } = require("./recipes.fixtures");
const { expect } = require("chai");

describe("Users Endpoint", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () =>
    db.raw("TRUNCATE users RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () => db.raw("TRUNCATE users RESTART IDENTITY CASCADE"));

  describe("GET /api/users", () => {
    context("Given no users", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get("/api/users").expect(200, []);
      });
    });
    context("Given there are users in the db", () => {
      const testUsers = makeUsersArray();
      const camelTestUsers = camelUsersArray();

      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });

      it("responds with 200 and all users", () => {
        return supertest(app).get("/api/users").expect(200, camelTestUsers);
      });
    });
  });

  describe("POST /api/users", () => {
    it("responds with 201 and a new user", () => {
      const newUser = {
        firstName: "Eman",
        lastName: "Tasl",
        username: "resu",
        password: "12345",
      };
      return supertest(app)
        .post("/api/users")
        .send(newUser)
        .expect((res) => {
          expect(res.body.user.firstName).to.eql(newUser.firstName);
          expect(res.body.user.lastName).to.eql(newUser.lastName);
          expect(res.body.user.username).to.eql(newUser.username);
          expect(res.body.user).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/users/${res.body.user.id}`);
          const expected = new Intl.DateTimeFormat("en-US").format(new Date());
          const actual = new Intl.DateTimeFormat("en-US").format(
            new Date(res.body.user.dateCreated)
          );
          expect(actual).to.eql(expected);
          expect(res.body).to.have.property("authToken");
        });
    });
  });

  describe(`GET /api/users/:user_id/items`, () => {
    context("Given there are items and users in the database", () => {
      const testUsers = makeUsersArray();
      const testItems = makeItemsArray();
      const camelItems = camelItemsArray();

      beforeEach("insert items", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("items").insert(testItems);
          });
      });

      it("responds with 200 and the user items", () => {
        const userId = 1;
        return supertest(app)
          .get(`/api/users/${userId}/items`)
          .set("Content-Type", "application/json")
          .set("Authorization", helpers.createAuthToken(testUsers[0]))
          .expect(200, camelItems);
      });
    });
  });
  describe(`GET /api/users/:user_id/recipes`, () => {
    context("Given there are recipes and users in the database", () => {
      const testUsers = makeUsersArray();
      const testRecipes = makeRecipesArray();
      const camelRecipes = camelRecipesArray();

      beforeEach("insert recipes", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("recipes").insert(testRecipes);
          });
      });

      it("responds with 200 and the user items", () => {
        const userId = 1;
        return supertest(app)
          .get(`/api/users/${userId}/recipes`)
          .set("Content-Type", "application/json")
          .set("Authorization", helpers.createAuthToken(testUsers[0]))
          .expect(200, camelRecipes);
      });
    });
  });
});
