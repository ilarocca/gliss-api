const app = require("../src/app");
const knex = require("knex");
const supertest = require("supertest");
const { makeUsersArray } = require("./users.fixtures");
const { makeItemsArray, camelItemsArray } = require("./items.fixtures");
const { expect } = require("chai");

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
        item_name: "carrots",
        category_id: 4,
        user_id: 1,
      };
      return supertest(app)
        .post("/api/items")
        .send(newItem)
        .expect(201)
        .expect((res) => {
          expect(res.body.item_name).to.eql(newItem.item_name);
          expect(res.body.category_id).to.eql(newItem.category_id);
          expect(res.body.user_id).to.eql(newItem.user_id);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/items/${res.body.id}`);
          const expected = new Intl.DateTimeFormat("en-US").format(new Date());
          const actual = new Intl.DateTimeFormat("en-US").format(
            new Date(res.body.date_created)
          );
          expect(actual).to.eql(expected);
        })
        .then((res) =>
          supertest(app).get(`/api/items/${res.body.id}`).expect(res.body)
        );
    });
  });

  describe("GET /api/items/:item_id", () => {
    context("Given no items", () => {
      it("responds with 404", () => {
        const itemId = 1234567;
        return supertest(app)
          .get(`/api/items/${itemId}`)
          .expect(404, { error: { message: `Item doesn't exist` } });
      });
    });

    context("Given there are items in the database", () => {
      const testUsers = makeUsersArray();
      const testItems = makeItemsArray();

      beforeEach("insert users", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("items").insert(testItems);
          });
      });

      it("responds with 200 and specified item", () => {
        const itemId = 1;
        return supertest(app)
          .get(`/api/items/${itemId}`)
          .expect(200, testItems[0]);
      });
    });
  });

  describe(`DELETE /api/items/:item_id`, () => {
    context(`Given no items`, () => {
      it(`responds with 404`, () => {
        const itemId = 123456;
        return supertest(app)
          .delete(`/api/items/${itemId}`)
          .expect(404, { error: { message: `Item doesn't exist` } });
      });
    });
    context("Given there are items in the database", () => {
      const testUsers = makeUsersArray();
      const testItems = makeItemsArray();

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
        const expectedItems = testItems.filter(
          (item) => item.id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/items/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app).get(`/api/items`).expect(expectedItems)
          );
      });
    });
  });

  describe(`PATCH /api/items/:item_id`, () => {
    context("Given there are items in the database", () => {
      const testUsers = makeUsersArray();
      const testItems = makeItemsArray();

      beforeEach("insert users", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("items").insert(testItems);
          });
      });

      it("responds with 204 and updates the item", () => {
        const idToUpdate = 1;
        const updateItem = {
          item_name: "chicken",
        };
        const expectedItems = {
          ...testItems[idToUpdate - 1],
          ...updateItem,
        };
        return supertest(app)
          .patch(`/api/items/${idToUpdate}`)
          .send(updateItem)
          .expect(204)
          .then((res) =>
            supertest(app).get(`/api/items/${idToUpdate}`).expect(expectedItems)
          );
      });
    });
  });
});
