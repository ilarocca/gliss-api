function makeItemsArray() {
  return [
    {
      id: 1,
      item_name: "steak",
      category_id: 2,
      user_id: 1,
      date_created: "2029-01-22T16:28:32.615Z",
    },
    {
      id: 2,
      item_name: "rice",
      category_id: 1,
      user_id: 1,
      date_created: "2100-05-22T16:28:32.615Z",
    },
  ];
}

module.exports = {
  makeItemsArray,
};
