var express = require("express");
var router = express.Router();
//#region this is belong to recipes module
const axios = require("axios");


//spoonacular settings
const recipes_api_url="https://api.spoonacular.com/recipes";
const api_key=`apiKey=${process.env.spooncular_apiKey}`;




////-------------function for search------------------------------------


//----------extract Queries Params-------------------------
function extractQueriesParams(query_params,search_params) {
    //search_params passed by ref

    //Iterate on params list to identify only wanted params
    const param_list = ["diet", "cuisine", "intolerance"];
    param_list.forEach((param) => {
        if (query_params[param]) {
            search_params[param] = query_params[param];
        }
    });
}
//-----------search For Recipes-----------------
async  function searchForRecipes(search_params) {
    let search_response=await axios.get(
        `${recipes_api_url}/search?${api_key}`,
        {
            params: search_params,
        }
    );
    var flag=1;
    const recipes_id_list=extractSearchResultsIds(search_response,flag);
    //Get recipes info by id
    let info_array= await getRecipesInfo(recipes_id_list);
    return info_array;
};


//-----getRecipesInfo-------------------
async function getRecipesInfo(recipes_id_list) {
    let promises=[];
    //for each id - get promise of GET response
    recipes_id_list.map((id)=>
    promises.push(axios.get(`${recipes_api_url}/${id}/information?${api_key}`))
    );
    let info_response1=await Promise.all(promises);

    relevatRecipesData= extractRelevantRecipeData(info_response1);
    return relevatRecipesData;
}



//extractRelevantRecipeData
function  extractRelevantRecipeData(recipes_Info) {
    let mapByID = {};
    recipes_Info.map((recipes_Info)=>{
        const {
            id,
            title,
            readyInMinutes,
            aggregateLikes,
            vegetarian,
            vegan,
            glutenFree,
            image,
        }=recipes_Info.data;
        var inside = {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            aggregateLikes: aggregateLikes,
            vegetarian: vegetarian,
            vegan: vegan,
            glutenFree: glutenFree,
            image: image,
        };
        mapByID [recipes_Info.data.id] = inside;
        
    });
    return mapByID;
    
}


function extractSearchResultsIds(search_response,flag) {
    if(flag==1){
        var recipes = search_response.data.results;
    }else if(flag==0){
        var recipes = search_response.data.recipes;
    }
    
    let recipes_id_list = [];
    recipes.map((recipe) => {
        console.log(recipe.title);
        recipes_id_list.push(recipe.id);
    });
    return recipes_id_list;
}

//----------------------------End----------------------------------------------------------------------------

///------------for /information----------------------------------------
async function getRecipeForInformation(recipes_id_list) {     
    let promises=[];
    //for each id - get promise of GET response
    recipes_id_list.map((id)=>
    promises.push(axios.get(`${recipes_api_url}/${id}/information?${api_key}`))
    );
    let info_response1=await Promise.all(promises);
    return extractSearchResultsDataFull(info_response1);
  }


////-------------function for information------------------------------------

function extractSearchResultsDataFull(recipes_Info){
     return recipes_Info.map((recipes_Info) => {
         // for each cell in map (recipe) extract relevant information with keys
        const {
            id,
            title,
            readyInMinutes,
            aggregateLikes,
            vegetarian,
            vegan,
            glutenFree,
            image,
            extendedIngredients,
            instructions,
            analyzedInstructions,
            servings,
        } = recipes_Info.data;


        // return for each the rekecant information
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            aggregateLikes: aggregateLikes,
            vegetarian: vegetarian,
            vegan: vegan,
            glutenFree: glutenFree,
            image: image,
            extendedIngredients:extendedIngredients,
           ingredients: extendedIngredients.map((ingredient) => {
            const {
                name,
                amount,
                unit,
            } = ingredient;
            return {
                name: name,
                amount: amount,
                unit: unit,
            }
            
        }),
            instructions: instructions,
            // _instructions: analyzedInstructions.steps.map(i => { number: i.number, step ; i.step}),
            analyzedInstructions: analyzedInstructions,
            servings: servings,
        }

        
    });



}


// function get(){
//     analyzedInstructions.forEach((instruction) => {
//         for(ins of instruction.steps)
//            instructionsAsArray.push({number:ins.number,step:ins.step})
//     }
// }
        





//----------------------------End----------------------------------------------------------------------------

async function searchForRandomRecipes(search_params){
    //let info_array = false;
    //while(info_array==false){
        let search_response = await axios.get(
            `${recipes_api_url}/random?${api_key}`,
            {
                params: search_params,
            }
        );
        var flag=0;
        const recipes_id_list = extractSearchResultsIds(search_response,flag);
        let info_array = await getRecipesInfo(recipes_id_list);
    //}
    return info_array;
}



///---------------exports------------------------------

exports.getRecipeForInformation=getRecipeForInformation;
exports.searchForRandomRecipes=searchForRandomRecipes;
exports.searchForRecipes=searchForRecipes;
exports.extractQueriesParams=extractQueriesParams;
exports.extractRelevantRecipeData=extractRelevantRecipeData;



