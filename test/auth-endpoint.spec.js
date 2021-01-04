const knex = require("knex");
const app = require("../src/app");
const { hashPassword } = require("../src/users/users-service");
const supertest = require("supertest");
const { expect } = require("chai");

describe("Auth Endpoints", function () {
  let db;
  const user = {
    id: 1,
    first_name: "Jon",
    last_name: "Doe",
    username: "jdoe",
    password: "123456",
  };

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
  beforeEach("seed users", () => {
    const hashed = hashPassword(user.password);
    user.password = hashed;
    return db.into("users").insert(user);
  });

  describe("POST /api/auth/login", () => {
    it("return 200, authToken and user when successful", () => {
      const requestBody = {
        username: "jdoe",
        password: "123456",
      };

      return supertest(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send(requestBody)
        .expect(200)
        .then((res) => {
          expect(res.body).to.have.property("authToken");
          expect(res.body.user.id).to.equal(user.id);
          expect(res.body.user.firstName).to.equal(user.first_name);
          expect(res.body.user.lastName).to.equal(user.last_name);
          expect(res.body.user.username).to.equal(user.username);
          expect(res.body.user.password).to.be.undefined;
        });
    });
  });
});
