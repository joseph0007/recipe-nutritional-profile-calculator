const convert = require("convert-units");

//to calculate micro/macro
const calcMicroMacro = (list) => {
  const macros = [];
  const micros = [];
  let energy;

  // All the basic macro nutrient check
  const macroNutrientArr = [
    /carbohydrate/,
    /total lipid/,
    /fiber/,
    /fatty acids, total monounsaturated/,
    /fatty acids, total polyunsaturated/,
    /fatty acids, total saturated/,
    /protein/,
    /sugar/,
    /water/,
  ];

  // all the basic micronutrients check
  const microNutrientArr = [
    /Vitamin/,
    /choline/,
    /alcohol/,
    /folate/,
    /retinol/,
    /folate/,
    /niacin/,
    /carotene/,
    /cryptoxanthin/,
    /lycopene/,
    /folic acid/,
    /caffeine/,
    /theobromine/,
    /lutein/,
    /sodium/,
    /calcium/,
    /niacin/,
    /isoleucine/,
    /leucine/,
    /lysine/,
    /cystine/,
    /valine/,
    /arginine/,
    /histidine/,
    /aspartic acid/,
    /serine/,
    /iron/,
    /tryptophan/,
    /threonine/,
    /thiamin/,
    /riboflavin/,
    /methionine/,
    /phenylalanine/,
    /tyrosine/,
    /alanine/,
    /glutamic acid/,
    /glycine/,
    /proline/,
    /cholesterol/,
    /potassium/,
    /zinc/,
    /magnesium/,
    /phosphorus/,
    /copper/,
    /manganese/,
    /selenium/,
  ];

  // segregating all the nutrient information
  list.forEach((el1) => {
    const boolMacro = macroNutrientArr.map((el) =>
      el.test(el1.nutrientName.toLowerCase())
    );
    const boolMicro = microNutrientArr.map((el) =>
      el.test(el1.nutrientName.toLowerCase())
    );

    if (boolMacro.includes(true)) {
      macros.push(el1);
    }

    if (boolMicro.includes(true)) {
      micros.push(el1);
    }

    if (el1.nutrientName.toLowerCase() === "energy") {
      energy = el1;
    }
  });

  return {
    macros,
    micros,
    energy,
  };
};

// function to calculate the nutrient value according to the amount of that ingredient used!
const calcAccToQuantity = (ingredient, multiplier) => {
  //MACRO
  if (ingredient.nutrientProfile.foodNutrients.macros)
    ingredient.nutrientProfile.foodNutrients.macros.forEach((el) => {
      el.value *= multiplier;
    });

  //MICRO
  if (ingredient.nutrientProfile.foodNutrients.micros)
    ingredient.nutrientProfile.foodNutrients.micros.forEach((el) => {
      el.value *= multiplier;
    });

  //ENERGY
  if (ingredient.nutrientProfile.foodNutrients.energy)
    ingredient.nutrientProfile.foodNutrients.energy.value *= multiplier;
};

//CALCULATE NUTRITIONAL PROFILE OF RECIPE
const calcRecipeNutriProfile = (ingredientsList) => {
  //STEP:1 calculate according to quantity
  ingredientsList.forEach((ingredient) => {
    //calculate the number to multiply
    const mul = ingredient.quantity / 100;

    //CALCULATE MICRO/MACRO ACCORDING TO THE QUANTITY SPECIFIED
    calcAccToQuantity(ingredient, mul);
  });

  let totEnergy;
  let totMacros;
  let totMicros;
  const note = [];

  //STEP:2 ADDING THE QUANTITIES
  ingredientsList.forEach((el) => {
    //check if the nutrientProfile is actually provided
    if (
      !el.nutrientProfile.foodNutrients.energy ||
      !el.nutrientProfile.foodNutrients.macros ||
      !el.nutrientProfile.foodNutrients.micros
    ) {
      note.push(
        `Nutritional value of ${el.name} is not provided and hence not added into the totol recipe nutritional information`
      );
    } else if (!totEnergy && !totMacros && !totMicros) {
      totEnergy = el.nutrientProfile.foodNutrients.energy;
      totMacros = el.nutrientProfile.foodNutrients.macros;
      totMicros = el.nutrientProfile.foodNutrients.micros;
    } else {
      //ADD THE TOTAL ENERGY
      totEnergy.value += el.nutrientProfile.foodNutrients.energy.value;

      //ADD THE TOTAL MACROS
      const newMacro = [];
      el.nutrientProfile.foodNutrients.macros.forEach((el1) => {
        const nutriObj = totMacros.find(
          (nutrient) => nutrient.nutrientName === el1.nutrientName
        );

        if (nutriObj) nutriObj.value += el1.value;
        else newMacro.push(el1);
      });
      totMacros = totMacros.concat(newMacro);

      //ADD THE TOTAL MICROS
      const newMicro = [];
      el.nutrientProfile.foodNutrients.micros.forEach((el1) => {
        const nutriObj = totMicros.find(
          (nutrient) => nutrient.nutrientName === el1.nutrientName
        );

        if (nutriObj) {
          //1.check if the unitName is the same
          const checkUnit = [
            "mcg",
            "mg",
            "g",
            "kg",
            "oz",
            "lb",
            "ml",
            "l",
            "tsp",
            "Tbs",
            "cup",
            "ug",
          ];
          if (!nutriObj.unitName === el1.unitName) {
            if (
              checkUnit.find((unit) => unit === nutriObj.unitName.toLowerCase())
            ) {
              el1.value = convert(el1.value)
                .from(
                  el1.unitName === "UG" ? "mcg" : el1.unitName.toLowerCase()
                )
                .to(
                  nutriObj.unitName === "UG"
                    ? "mcg"
                    : nutriObj.unitName.toLowerCase()
                );
            }
          }

          //add the values
          nutriObj.value += el1.value;
        } else newMicro.push(el1);
      });
      totMicros = totMicros.concat(newMicro);
    }
  });

  return {
    totEnergy,
    totMacros,
    totMicros,
    note,
  };
};

// convert the units given by user to "g" or "ml"
const convertUnits = (ingredientsList) => {
  const newIngredientsList = ingredientsList;
  //get the array of ingredient objects where the each object will have name, quantity, unit
  //map over the array to convert each unit to gms or ml
  newIngredientsList.forEach((el) => {
    el.quantity = convert(parseInt(el.quantity, 10))
      .from(el.unit)
      .to(/(g|kg|oz|lb)/.test(el.unit) ? "g" : "ml");
    el.unit = /(g|kg|oz|lb)/.test(el.unit) ? "g" : "ml";
  });

  return newIngredientsList;
};

//get the nutriprofile
const getNutriProfile = (ingredientsList) => {
  try {
    if (!ingredientsList.length)
      throw new Error("Please provide an ingredient list :(");

    ingredientsList.forEach((el) => {
      const checkKeysArr = ["quantity", "name", "unit", "nutrientProfile"];
      let boolArr = [];
      Object.keys(el).forEach((key) => {
        if (checkKeysArr.includes(key)) boolArr.push(true);
      });

      if (boolArr.includes(false))
        throw new Error(
          "Please provide the right ingredient Object details :("
        );
    });

    ingredientsList.forEach((el) => {
      if (!el.nutrientProfile.foodNutrients)
        throw Error(
          "No foodNutrients available! Please provide an accurate USDA api object!!"
        );

      //STEP 1: Segregate energy, micros, macros!!
      el.nutrientProfile.foodNutrients = calcMicroMacro(
        el.nutrientProfile.foodNutrients
      );
    });

    //STEP 2: convert units to "g" or "ml"
    const newIngredientsList = convertUnits(ingredientsList);

    //STEP 3: generate nutritional profile after uniformity
    return calcRecipeNutriProfile(newIngredientsList);
  } catch (error) {
    console.log(error.message, error);
  }
};

module.exports = getNutriProfile;
