function makeRecipesArray() {
  return [
    {
      id: 1,
      recipe_name: "Country Fried Steak",
      img: "www.img.com/img-of-country-fried-steak",
      url: "www.recipe.com/country-fried-steak",
      user_id: 1,
      date_created: "2029-01-22T16:28:32.615Z",
    },
    {
      id: 2,
      recipe_name: "Fried Rice",
      img: "www.img.com/img-of-fried-rice",
      url: "www.recipe.com/fried-rice",
      user_id: 1,
      date_created: "2029-01-22T16:28:32.615Z",
    },
  ];
}

module.exports = {
  makeRecipesArray,
};
