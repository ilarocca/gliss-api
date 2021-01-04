function makeRecipesArray() {
  return [
    {
      id: 1,
      recipe_name: "Country Fried Steak",
      ingredients: "steak, butter, breadcrumbs",
      img: "www.img.com/img-of-country-fried-steak",
      url: "www.recipe.com/country-fried-steak",
      user_id: 1,
      date_created: "2029-01-22T16:28:32.615Z",
    },
    {
      id: 2,
      recipe_name: "Fried Rice",
      ingredients: "rice, peas, chicken",
      img: "www.img.com/img-of-fried-rice",
      url: "www.recipe.com/fried-rice",
      user_id: 1,
      date_created: "2029-01-22T16:28:32.615Z",
    },
  ];
}

function camelRecipesArray() {
  return [
    {
      id: 1,
      recipeName: "Country Fried Steak",
      ingredients: "steak, butter, breadcrumbs",
      img: "www.img.com/img-of-country-fried-steak",
      url: "www.recipe.com/country-fried-steak",
      userId: 1,
      dateCreated: "2029-01-22T16:28:32.615Z",
    },
    {
      id: 2,
      recipeName: "Fried Rice",
      ingredients: "rice, peas, chicken",
      img: "www.img.com/img-of-fried-rice",
      url: "www.recipe.com/fried-rice",
      userId: 1,
      dateCreated: "2029-01-22T16:28:32.615Z",
    },
  ];
}

module.exports = {
  makeRecipesArray,
  camelRecipesArray,
};
