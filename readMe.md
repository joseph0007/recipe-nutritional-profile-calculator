# Recipe Nutritional Profile Calculator

**Based on the USDA api**
This package will only work with usda objects and any other object passed in as a nutrientProfile value will throw error!

## How to get nutrient profile of an ingredient from usda api:

basic api call:--
`https://api.nal.usda.gov/fdc/v1/foods/search?query=${ingredient_name}&api_key=${your_key}`

to get an api key:--
`https://fdc.nal.usda.gov/api-key-signup.html`

For more information please visit the usda website:
`https://fdc.nal.usda.gov/api-spec/fdc_api.html#/`

## How to require the module

const getNutriProfile = require('recipe-nutritional-profile-calculator');

## How to pass an ingredients list object:

**Pass the USDA object as value to the "nutrientProfile" key as shown below**

## Units accepted are mentioned below

"mcg", "mg", "g", "kg", "oz", "lb", "ml", "l", "tsp", "Tbs", "cup", "ug",

```js
const ingredientsList = [
  {
    name: "MILK",
    quantity: "200",
    unit: "ml",
    nutrientProfile: {
      // ... usda object
    },
  },
  {
    name: "JAGGERY",
    quantity: "10",
    unit: "g",
    nutrientProfile: {
      // ... usda object
    },
  },
  {
    name: "OATS",
    quantity: 60,
    unit: "g",
    userInputed: "true",
    nutrientProfile: {
      // ... usda object
    },
  },
];

const nutriProfile = getNutriProfile(ingredientsList);
```

## OUTPUT OBJECT:

```js
nutriProfile = {
        //ENERGY IN KCAL
        totEnergy: {
            nutrientId: 1008,
            nutrientName: "Energy",
            nutrientNumber: "208",
            unitName: "KCAL",
            derivationCode: "LCCS",
            derivationDescription: "Calculated from value per serving size measure",
            value: 482.5
        },

        //TOTAL MACRO NUTRIENTS
        totMacros: [
            {
                nutrientId: 1003,
                nutrientName: "Protein",
                nutrientNumber: "203",
                unitName: "G",
                derivationCode: "LCCS",
                derivationDescription: "Calculated from value per serving size measure",
                value: 14.2
            },
            {
                nutrientId: 1004,
                nutrientName: "Total lipid (fat)",
                nutrientNumber: "204",
                unitName: "G",
                derivationCode: "LCCS",
                derivationDescription: "Calculated from value per serving size measure",
                value: 7.55
            },
            // ... rest
        ],

        //TOTAL MACRO NUTRIENTS
        totMicros: [
            {
                nutrientId: 1087,
                nutrientName: "Calcium, Ca",
                nutrientNumber: "301",
                unitName: "MG",
                derivationCode: "LCCD",
                derivationDescription: "Calculated from a daily value percentage per serving size measure",
                value: 252
            },
            {
                nutrientId: 1089,
                nutrientName: "Iron, Fe",
                nutrientNumber: "303",
                unitName: "MG",
                derivationCode: "LCCD",
                derivationDescription: "Calculated from a daily value percentage per serving size measure",
                value: 5.3999999999999995
            },
            // ... rest
        ],

        //A Notes array to inform if nutrient profile of any ingredient is missing!
        note: []
    }
}

```

**PLEASE NOTE: This package has not under went extreme testing and may throw error in some edge cases!!**
