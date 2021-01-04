const app = require("../src/app");
const knex = require("knex");
const supertest = require("supertest");
const { makeUsersArray } = require("./users.fixtures");
const { makeItemsArray, camelItemsArray } = require("./items.fixtures");
const { expect } = require("chai");
const helpers = require("./test-helpers");

describe("Items Endpoint", () => {
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
    db.raw("TRUNCATE users, items RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () =>
    db.raw("TRUNCATE users, items RESTART IDENTITY CASCADE")
  );

  describe("GET /api/items", () => {
    context("Given no items", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get("/api/items").expect(200, []);
      });
    });
    context("Given there are items in the db", () => {
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

      it("responds with 200 and all items", () => {
        return supertest(app).get("/api/items").expect(200, camelItems);
      });
    });
  });

  describe("POST /api/items", () => {
    const testUsers = makeUsersArray();
    beforeEach("insert users", () => {
      return db.into("users").insert(testUsers);
    });
    it("responds with 201 and a new item", () => {
      const newItem = {
        item: "carrots",
        categoryId: 4,
        userId: 1,
      };
      return supertest(app)
        .post("/api/items")
        .set("Content-Type", "application/json")
        .set("Authorization", helpers.createAuthToken(testUsers[0]))
        .send(newItem)
        .expect(201)
        .expect((res) => {
          expect(res.body.item).to.eql(newItem.item);
          expect(res.body.categoryId).to.eql(newItem.categoryId);
          expect(res.body.userId).to.eql(newItem.userId);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/items/${res.body.id}`);
          const expected = new Intl.DateTimeFormat("en-US").format(new Date());
          const actual = new Intl.DateTimeFormat("en-US").format(
            new Date(res.body.dateCreated)
          );
          expect(actual).to.eql(expected);
        });
    });
  });

  // describe("GET /api/items/:user_id/:item_id", () => {
  //   context("Given no items", () => {
  //     it("responds with 404", () => {
  //       const itemId = 1234567;
  //       return supertest(app)
  //         .get(`/api/items/${itemId}`)
  //         .expect(404, { error: { message: `Item doesn't exist` } });
  //     });
  //   });

  //   context("Given there are items in the database", () => {
  //     const testUsers = makeUsersArray();
  //     const testItems = makeItemsArray();

  //     beforeEach("insert users", () => {
  //       return db
  //         .into("users")
  //         .insert(testUsers)
  //         .then(() => {
  //           return db.into("items").insert(testItems);
  //         });
  //     });

  //     it("responds with 200 and specified item", () => {
  //       const itemId = 1;
  //       return supertest(app)
  //         .get(`/api/items/${itemId}`)
  //         .expect(200, testItems[0]);
  //     });
  //   });
  // });

  describe(`DELETE /api/items/:user_id/:item_id`, () => {
    context(`Given no items`, () => {
      const testUsers = makeUsersArray();
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });

      it(`responds with 404`, () => {
        const userId = 1;
        const itemId = 123456;
        const testUsers = makeUsersArray();
        return supertest(app)
          .delete(`/api/items/${userId}/${itemId}`)
          .set("Content-Type", "application/json")
          .set("Authorization", helpers.createAuthToken(testUsers[0]))
          .expect(404);
      });
    });
    context("Given there are items in the database", () => {
      const testUsers = makeUsersArray();
      const testItems = makeItemsArray();
      const camelTestItems = camelItemsArray();

      beforeEach("insert users", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("items").insert(testItems);
          });
      });

      it("responds with 204 and removes the item", () => {
        const idToRemove = 1;
        const userId = 1;
        const expectedItems = camelTestItems.filter(
          (item) => item.id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/items/${userId}/${idToRemove}`)
          .set("Content-Type", "application/json")
          .set("Authorization", helpers.createAuthToken(testUsers[0]))
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/items`)
              .set("Authorization", helpers.createAuthToken(testUsers[0]))
              .expect(expectedItems)
          );
      });
    });
  });

  // describe(`PATCH /api/items/:item_id`, () => {
  //   context("Given there are items in the database", () => {
  //     const testUsers = makeUsersArray();
  //     const testItems = makeItemsArray();

  //     beforeEach("insert users", () => {
  //       return db
  //         .into("users")
  //         .insert(testUsers)
  //         .then(() => {
  //           return db.into("items").insert(testItems);
  //         });
  //     });

  //     it("responds with 204 and updates the item", () => {
  //       const idToUpdate = 1;
  //       const updateItem = {
  //         item_name: "chicken",
  //       };
  //       const expectedItems = {
  //         ...testItems[idToUpdate - 1],
  //         ...updateItem,
  //       };
  //       return supertest(app)
  //         .patch(`/api/items/${idToUpdate}`)
  //         .send(updateItem)
  //         .expect(204)
  //         .then((res) =>
  //           supertest(app).get(`/api/items/${idToUpdate}`).expect(expectedItems)
  //         );
  //     });
  //   });
  // });
});
