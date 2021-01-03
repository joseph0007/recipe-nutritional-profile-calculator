const convert = require("convert-units");

//to calculate micro/macro
const calcMicroMacro = (list) => {
  const macros = [];
  const micros = [];
  let energy;

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

    //CALCULATE MICRO/MACRO ACC TO QUANTITY
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

//get the nutriprofile
const getNutriProfile = (ingredientsList) => {
  if (!ingredientsList.length)
    throw new Error("Please provide an ingredient list :(");

  ingredientsList.forEach((el) => {
    const checkKeysArr = ["quantity", "name", "unit", "nutrientProfile"];
    let boolArr = [];
    Object.keys(el).forEach((key) => {
      if (checkKeysArr.includes(key)) boolArr.push(true);
    });

    if (boolArr.includes(false))
      throw new Error("Please provide the right ingredient Object details :(");
  });

  ingredientsList.forEach((el) => {
    if (!el.nutrientProfile.foodNutrients)
      throw Error(
        "No foodNutrients available! Please provide an accurate USDA api object!!"
      );
    el.nutrientProfile.foodNutrients = calcMicroMacro(
      el.nutrientProfile.foodNutrients
    );
  });

  //STEP 2:
  return calcRecipeNutriProfile(ingredientsList);
};

module.exports = getNutriProfile;
