function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: "Jon",
      last_name: "Doe",
      username: "jdoe",
      date_created: "2029-01-22T16:28:32.615Z",
    },
    {
      id: 2,
      first_name: "Foo",
      last_name: "Bar",
      username: "fbar",
      date_created: "2100-05-22T16:28:32.615Z",
    },
  ];
}

module.exports = {
  makeUsersArray,
};
