function makeItemsArray() {
  return [
    {
      category_id: 2,
      date_created: "2029-01-22T16:28:32.615Z",
      id: 1,
      item_name: "steak",
      user_id: 1,
    },
    {
      category_id: 1,
      date_created: "2100-05-22T16:28:32.615Z",
      id: 2,
      item_name: "rice",
      user_id: 1,
    },
  ];
}

function camelItemsArray() {
  return [
    {
      categoryId: 2,
      dateCreated: "2029-01-22T16:28:32.615Z",
      id: 1,
      item: "steak",
      userId: 1,
    },
    {
      categoryId: 1,
      dateCreated: "2100-05-22T16:28:32.615Z",
      id: 2,
      itemName: "rice",
      userId: 1,
    },
  ];
}

module.exports = {
  makeItemsArray,
  camelItemsArray,
};
