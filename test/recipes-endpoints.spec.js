const app = require("../src/app");
const knex = require("knex");
const supertest = require("supertest");
const { makeUsersArray } = require("./users.fixtures");
const { makeRecipesArray, camelRecipesArray } = require("./recipes.fixtures");
const { expect } = require("chai");
const helpers = require("./test-helpers");

describe("Recipes Endpoint", () => {
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
    db.raw("TRUNCATE users, recipes RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () =>
    db.raw("TRUNCATE users, recipes RESTART IDENTITY CASCADE")
  );

  describe("GET /api/recipes", () => {
    context("Given no recipes", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get("/api/recipes").expect(200, []);
      });
    });
    context("Given there are recipes in the db", () => {
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

      it("responds with 200 and all recipes", () => {
        return supertest(app).get("/api/recipes").expect(200, camelRecipes);
      });
    });
  });

  describe("POST /api/items", () => {
    const testUsers = makeUsersArray();
    beforeEach("insert users", () => {
      return db.into("users").insert(testUsers);
    });
    it("responds with 201 and a new item", () => {
      const newRecipe = {
        recipeName: "grilled carrots",
        ingredients: "carrots, butter",
        img: "www.img.com/carrot-pic",
        url: "www.recipe.com/grilled-carrots",
        userId: 1,
      };
      return supertest(app)
        .post("/api/recipes")
        .set("Content-Type", "application/json")
        .set("Authorization", helpers.createAuthToken(testUsers[0]))
        .send(newRecipe)
        .expect(201)
        .expect((res) => {
          expect(res.body.recipeName).to.eql(newRecipe.recipeName);
          expect(res.body.img).to.eql(newRecipe.img);
          expect(res.body.url).to.eql(newRecipe.url);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/recipes/${res.body.id}`);
          const expected = new Intl.DateTimeFormat("en-US").format(new Date());
          const actual = new Intl.DateTimeFormat("en-US").format(
            new Date(res.body.dateCreated)
          );
          expect(actual).to.eql(expected);
        });
    });
  });

  // describe("GET /api/recipes/:user_id/:recipe_id", () => {
  //   context("Given no recipe", () => {
  //     it("responds with 404", () => {
  //       const userId = 1;
  //       const recipeId = 1234567;
  //       return supertest(app)
  //         .get(`/api/recipes/${recipeId}`)
  //         .expect(404, { error: { message: `Recipe doesn't exist` } });
  //     });
  //   });

  //   context("Given there are recipes in the database", () => {
  //     const testUsers = makeUsersArray();
  //     const testRecipes = makeRecipesArray();

  //     beforeEach("insert users", () => {
  //       return db
  //         .into("users")
  //         .insert(testUsers)
  //         .then(() => {
  //           return db.into("recipes").insert(testRecipes);
  //         });
  //     });

  //     it("responds with 200 and specified recipe", () => {
  //       const recipeId = 1;
  //       return supertest(app)
  //         .get(`/api/recipes/${recipeId}`)
  //         .expect(200, testRecipes[0]);
  //     });
  //   });
  // });

  describe(`DELETE /api/recipes/:user_id/:recipe_id`, () => {
    context("Given no recipe", () => {
      const testUsers = makeUsersArray();
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });

      it("responds with 404", () => {
        const userId = 1;
        const recipeId = 1234567;
        return supertest(app)
          .get(`/api/recipes/${userId}/${recipeId}`)
          .set("Authorization", helpers.createAuthToken(testUsers[0]))
          .expect(404, { error: { message: `Recipe doesn't exist` } });
      });
    });
    context("Given there are recipes in the database", () => {
      const testUsers = makeUsersArray();
      const testRecipes = makeRecipesArray();
      const camelTestRecipes = camelRecipesArray();

      beforeEach("insert users", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("recipes").insert(testRecipes);
          });
      });

      it("responds with 204 and removes the recipe", () => {
        const idToRemove = 1;
        const userId = 1;
        const expectedRecipes = camelTestRecipes.filter(
          (recipe) => recipe.id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/recipes/${userId}/${idToRemove}`)
          .set("Content-Type", "application/json")
          .set("Authorization", helpers.createAuthToken(testUsers[0]))
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/recipes`)
              .set("Authorization", helpers.createAuthToken(testUsers[0]))
              .expect(expectedRecipes)
          );
      });
    });
  });

  // describe(`PATCH /api/recipes/:recipe_id`, () => {
  //   context("Given there are recipes in the database", () => {
  //     const testUsers = makeUsersArray();
  //     const testRecipes = makeRecipesArray();

  //     beforeEach("insert users", () => {
  //       return db
  //         .into("users")
  //         .insert(testUsers)
  //         .then(() => {
  //           return db.into("recipes").insert(testRecipes);
  //         });
  //     });

  //     it("responds with 204 and updates the recipe", () => {
  //       const idToUpdate = 1;
  //       const updateRecipe = {
  //         recipe_name: "pan-seared chicken",
  //       };
  //       const expectedRecipes = {
  //         ...testRecipes[idToUpdate - 1],
  //         ...updateRecipe,
  //       };
  //       return supertest(app)
  //         .patch(`/api/recipes/${idToUpdate}`)
  //         .send(updateRecipe)
  //         .expect(204)
  //         .then((res) =>
  //           supertest(app)
  //             .get(`/api/recipes/${idToUpdate}`)
  //             .expect(expectedRecipes)
  //         );
  //     });
  //   });
  // });
});
