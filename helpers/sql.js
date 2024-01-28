const { BadRequestError } = require("../expressError");

// This function assigns the $ and index number to the column names and assigns their values to the corresponding data that is sent along in the request body

// the data in req.body (i.e. { "name": "Whitefish&Duck", "ingredients": "Whitefish, duck, etc", "calorieCount": "301 kcal/cup", "category": "CatFood", "price": "25.00", "weight": "24", 	"imageUrl": "CatFood_WhitefishDuck.png" } is passed in to this function as the object 'dataToUpdate'.

// what is passed in as jsToSql should be an object with the key/value pairs of the changed column names that correspond to the data that was sent along with the request  (i.e. { calorieCount: 'calorie_count', imageUrl: 'image_url' }).

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // 'keys' is an array of the keys in dataToUpdate (i.e. [ "name", "ingredients",  "calorieCount", "category", "price", "weight", "imageUrl" ])
  const keys = Object.keys(dataToUpdate);
  // if no keys are found in the dataToUpdate object that means no data was found in req.body. Therefore, the length of keys will equal zero which will then throw an error
  if (keys.length === 0) throw new BadRequestError("No data");

  // iterate over the 'keys' array with map and for every key ("colName") and array index, change the column name to what it was before being changed with AS in the UPDATE query and set its value equal to $(idx+1). Creates an array of strings.

  //(i.e.  cols = {"name": "Whitefish&Duck", "ingredients": "Whitefish, duck, etc", "calorieCount": "301 kcal/cup", "category": "CatFood", "price": "25.00", "weight": "24", "image_url": "CatFood_WhitefishDuck.png", ... } =======>
  //  ['"name"=$1', '"ingredients"=$2', '"calorie_count"=$3', '"category"=$4', '"price"=$5', '"weight"=$6', '"image_url"=$7'])

  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  // return an object with setcols equal to 'cols' (i.e. ['"name"=$1', '"ingredients"=$2', 'calorie_count"=$3', '"category"=$4', '"price"=$5', '"weight"=$6', '"image_url"=$7']) joined together to equal a single string { setCols: '['"name"=$1, "ingredients"=$2, "calorie_count"=$3, "category"=$4, "price"=$5, "weight"=$6, "image_url"=$7']' }
  // and values equal to { values: [ 'Whitefish&Duck', 'Whitefish, duck, etc', '301 kcal/cup', 'CatFood', '25.00', '24', 'CatFood_WhitefishDuck.png'] }, the values in the data in req.body "dataToUpdate"
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
