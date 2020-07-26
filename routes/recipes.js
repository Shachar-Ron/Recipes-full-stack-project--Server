
//-------/Information,--------------------------------------------------------------------
//------- /:id,--------------------------------------------------------------------------
//------- /get_3_random_recipes,---------------------------------------------------------
//------- /search/query/:searchQuery/amount/:num-------------------------------------

var express = require("express");
var router = express.Router();
const axios = require("axios");

const search_util=require("./utils/search_recipes");

const api_domain = "https://api.spoonacular.com/recipes";

router.get("/",(req,res) => res.send("im here"));


//------- /get_3_random_recipes,---------------------------------------------------------
//---11---
router.get("/get_3_random_recipes", (req, res) => {
try {
  search_params = {};
  search_params.number = 3;
  search_util
  .searchForRandomRecipes(search_params)
  .then((info_array) => res.send(info_array))
  .catch((error) => {
      res.send(error);
  });
} catch (error) {
  next(error);
}
});

/**
 * 1.7 -return all inforamtion of recipe
 */

router.get("/Information/Id/:recipeID", async (req, res, next) => {
  try {
    const{ recipeID } = req.params;
    search_params = {};
    search_params.id = recipeID;
    recipes_id_list = [];
    recipes_id_list.push(search_params.id);
    search_util
    .getRecipeForInformation(recipes_id_list) 
    .then((info_array) => res.send(info_array))
    .catch((error) => {
        res.sendStatus(500);
    });
} catch (error) {
  next(error);
}
});


//------- /:id,--------------------------------------------------------------------------
//GET recipe by id.
  // router.get("/:id",async(req,res,next)=>{
  //   try {
  //     const recipe = await getRecipeInfo(req.params.id);
  //     res.send({ data: recipe.data });
  //   } catch (error) {
  //     next(error);
  //   }
  // });

 /**
  * return search recipe by query and amount
  */

 //------- /search/query/:searchQuery/amount/:num------------------------------------- 
  router.get("/search/query/:searchQuery/amount/:num", (req, res) => {
    try {  
         const {searchQuery, num} = req.params;
         search_params = {};
         search_params.query = searchQuery;
         search_params.number = num;
         search_params.instructionsRequired = true;
     
         console.log(req.query);
         search_util.extractQueriesParams(req.query, search_params);
     
         search_util
             .searchForRecipes(search_params)
             .then((info_array) => res.send(info_array))
             .catch((error) => {
                 console.log(error);
                 res.sendStatus(500);
      });

    } catch (error) {
      next(error);
    }
    
  }); 

module.exports = router;

