var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");
const search_util=require("./utils/search_recipes");


// check if user got cookie
// Authenticate all incoming request
// TODO: WORK!
router.use( async (req, res, next) => {
  try {
    if (req.session && req.session.user_id) {
    const user_id = req.session.user_id;
    const username = req.session.username;
    // checkIdInDb returns: user_id or undefinded
    const userInDb = await checkIdInDb(user_id);
    if(userInDb)
    {
      req.user_id = user_id;
      req.username = username;
      next();
    }
  }
  else
  {
    throw { status: 401, message: "No cookie, Please Login.", success: false };
  }

  } catch (error) {
    next(error);
  }
});

// TODO: WORK!
// comes here if he not founds user id in DB
router.use(async (req, res, next) => {
  if (!req.user_id) {
    next({ status: 401, message: "Cookie was Expired, Please Login." , success: false });
  } else {
    next();
  }
});

// WORK!
// add new recpice to DB
router.post("/new_rec", async (req, res) => {
  try {
    if(!req.body.rec_name || !req.body.rec_time || !req.body.rec_vegan || !req.body.rec_vegetarian || !req.body.rec_gluten || !req.body.rec_ingredients ||
       !req.body.instrunctions || !req.body.rec_num_of_dishes || !req.body.rec_popularity || !req.body.rec_image_url)
    {
      throw { status: 401, message: "Not all fields for recipe is full.", success: false };
    }
    insterRecInDb(req.user_id, req.body.rec_name, req.body.rec_image_url, req.body.rec_time, req.body.rec_popularity,
       req.body.rec_vegan, req.body.rec_vegetarian, req.body.rec_gluten, req.body.rec_ingredients, req.body.instrunctions, req.body.rec_num_of_dishes);

       res.status(201).send({ message: "Recipe added successfully to user", success: true });
  } catch (error) {
    next(error);
  }
});

//  WORK!
router.get("/my_recepies", async (req, res) => {
  // need to get all recipe where author = req.user_id
  try
  {
    let all_rec_of_user = await getAllRecipes(req.user_id);
    let info_arr = execRecInfo(all_rec_of_user);
    res.send(info_arr);
  } catch (error)
  {
    next(error);
  }
});

//  WORK!
router.post("/set_favorite", async (req, res) => {
  try {
    if(!req.body.rec_id)
    {
      throw { status: 401, message: "No Recipe ID.", success: false };
    }
    await insterFevRecInDb(req.username, req.body.rec_id);
    res.status(201).send({ message: "Recipe added successfully to favorites", success: true });
  } catch (error) {
    next(error);
  }
});

//  WORK!
router.get("/get_favorite", async (req, res, next) => {
  try {
    let rec_ids = await get_favorite_ids(req.username);
    let only_rec_ids = [];
    rec_ids.map((rec) => {
      only_rec_ids.push(rec.rec_id);
    })
    search_util
    .getRecipeForInformation(only_rec_ids) 
    .then((info_array) => res.send(info_array))
    .catch((error) => {
        res.sendStatus(500);
    });
    // res.send(rec_ids);
  } catch (error) {
    next(error);
  }
});

//  WORK!
router.post('/addRecipeToWatched', async (req, res) => {
  try {
    if(!req.body.rec_id)
    {
      throw { status: 401, message: "No Recipe ID.", success: false };
    }
    let all_last_seen = await get_last_sec_rec(req.username);
    if(!all_last_seen)
    {
      // new user with no last seen
      insterFirstLastSeenRecInDb(req.username, req.body.rec_id)
      res.status(201).send({ message: "First recipe added successfully to last seen", success: true });
    }
    else
    {
      // there is history about this user!
      if(all_last_seen.secound_last_seen == 0)
      {
        await insterLastSeenRecInDb(req.username, all_last_seen.first_last_seen, req.body.rec_id, '0');
        res.status(201).send({ message: "Secound recipe added successfully to last seen", success: true });
      }
      else if(all_last_seen.third_last_seen == 0)
      {
        await insterLastSeenRecInDb(req.username, all_last_seen.first_last_seen, all_last_seen.secound_last_seen, req.body.rec_id);
        res.status(201).send({ message: "Third recipe added successfully to last seen", success: true });
      }
      else if(all_last_seen.secound_last_seen == req.body.rec_id)
      {
        // secound seen is come again
        await insterLastSeenRecInDb(req.username, all_last_seen.first_last_seen, all_last_seen.third_last_seen, req.body.rec_id);
        res.status(201).send({ message: "Recipe added successfully to last seen", success: true });
      }
      else if(all_last_seen.third_last_seen == req.body.rec_id)
      {
        // last seen is come again
        await insterLastSeenRecInDb(req.username, all_last_seen.first_last_seen, all_last_seen.secound_last_seen, req.body.rec_id);
        res.status(201).send({ message: "Recipe added successfully to last seen", success: true });
      }
      else
      {
        // new seen
        await insterLastSeenRecInDb(req.username, all_last_seen.secound_last_seen, all_last_seen.third_last_seen, req.body.rec_id);
        res.status(201).send({ message: "Recipe added successfully to last seen", success: true });
      }
    }
    //await insterLastSeenRecInDb(req.username, req.body.rec_id);
    //res.status(201).send({ message: "Recipe added successfully to favorites", success: true });
  } catch (error) {
    next(error);
  }
});

//  WORK!
router.get('/get_last_seen_rec', async (req, res) => {
  try {
    let rec_ids = await get_last_sec_rec(req.username);
    if(!rec_ids)
    {
      res.status(401).send({ message: "No last seen recipes", success: true });
    }
    else
    {
      let only_rec_ids = [];
      // res.send(rec_ids);
      if(rec_ids.first_last_seen != 0)
      {
        only_rec_ids.push(rec_ids.first_last_seen);
        if(rec_ids.secound_last_seen != 0)
        {
          only_rec_ids.push(rec_ids.secound_last_seen);
          if(rec_ids.third_last_seen != 0)
          {
            only_rec_ids.push(rec_ids.third_last_seen);
          }
        }
      }
      search_util
      .getRecipeForInformation(only_rec_ids) 
      .then((info_array) => res.send(info_array))
      .catch((error) => {
          res.sendStatus(500);
      });
    }
  } catch (error) {
    next(error);
  }
});

// WORK!
router.get('/get_last_search', async (req, res) => {
  try {
    if(!req.session.last_search)
    {
      res.status(401).send({ message: "No last search for recipes", success: false });
    }
    else
    {
      res.send(req.session.last_search);
    }
  } catch (error) {
    next(error);
  }
});

// WORK!
router.post('/update_last_search', async (req, res) => {
  try {
    if(!req.body.last_search)
    {
      res.status(401).send({ message: "No last search for recipes", success: false });
    }
    else
    {
      req.session.last_search = req.body.last_search;
      res.status(201).send({ message: "Last search was updated", success: true });
    }
  } catch (error) {
    next(error);
  }
});



/**
 * Help Functions
 * @param {*} user_id  - from cookie
 */
// WORK !
async function getAllRecipes(user_id)
{
  let all_user_recupies = await DButils.execQuery(`SELECT * FROM [dbo].[recipes] WHERE [recipes].[author] = '${user_id}'`);
  return all_user_recupies;
}

// WORK !
function execRecInfo(recipe_info)
{
  return recipe_info.map((recipe) => {
    const {
      recipe_id,
      author,
      rec_name,
      rec_image_url,
      rec_time,
      rec_popularity,
      rec_vegan,
      rec_vegetarian,
      rec_gluten,
      rec_ingredients,
      instructions,
      rec_number_of_dishes
    } = recipe;
    return {
      id: recipe_id,
      author_id: author,
      title: rec_name,
      image: rec_image_url,
      time: rec_time,
      popularity: rec_popularity,
      vegan: rec_vegan,
      vegetarian: rec_vegetarian,
      gluten: rec_gluten,
      ingredients: rec_ingredients,
      instructions: instructions,
      num_of_dishes: rec_number_of_dishes
    };
  });
}

// WORK!
async function checkIdInDb(user_id_to_check)
{
  let = all_user_ids = await DButils.execQuery("SELECT user_id FROM [dbo].[users]")
  if (all_user_ids.find((x) => x.user_id === user_id_to_check))
  {
    return true;
  }
  return false;
}

// WORK!
async function insterRecInDb(user_id, rec_name, rec_image_url, rec_time, rec_popularity, rec_vegan, rec_vegetarian, rec_gluten, rec_ingredients, instrunctions, rec_num_of_dishes)
{
  try {
    await DButils.execQuery(
      `INSERT INTO [dbo].[recipes] VALUES ('${user_id}',
                                     '${rec_name}',
                                     '${rec_image_url}',
                                     '${rec_time}',
                                     '${rec_popularity}',
                                     '${rec_vegan}',
                                     '${rec_vegetarian}',
                                     '${rec_gluten}',
                                     '${rec_ingredients}',
                                     '${instrunctions}',
                                     '${rec_num_of_dishes}'
                                     )`);
  } catch(error)
  {
    next(error);
  }
}

// WORK!
async function insterFevRecInDb(username, rec_id)
{
  try {
    await DButils.execQuery(
      `INSERT INTO [dbo].[user_favorites] VALUES ('${username}',
                                     '${rec_id}' )`);
  } catch(error)
  {
    next(error);
  }
}

// WORK!
async function insterLastSeenRecInDb(username, rec_id1, rec_id2, rec_id3)
{
  try {
    await DButils.execQuery(
      `UPDATE [dbo].[user_last_seen]
      SET [user_last_seen].[first_last_seen] = '${rec_id1}', [user_last_seen].[secound_last_seen] = '${rec_id2}', [user_last_seen].[third_last_seen] = '${rec_id3}'
      WHERE [user_last_seen].[username] = '${username}'`);
  } catch(error)
  {
    next(error);
  }
}

// WORK!
async function insterFirstLastSeenRecInDb(username, rec_id)
{
  try {
    await DButils.execQuery(
      `INSERT INTO [dbo].[user_last_seen] VALUES ('${username}',
                                     '${rec_id}','0','0' )`);
  } catch(error)
  {
    next(error);
  }
}

// WORK!
async function get_last_sec_rec(username)
{
  try {
    let recipe_ids = await DButils.execQuery(`SELECT * FROM [dbo].[user_last_seen] WHERE [user_last_seen].[username] = '${username}'`);
    let all_info = recipe_ids[0];
    return all_info;
  } catch(error)
  {
    next(error);
  }
}
// WORK !
async function get_favorite_ids(username)
{
  try {
    let recipe_ids = await DButils.execQuery(`SELECT rec_id FROM [dbo].[user_favorites] WHERE [user_favorites].[username] = '${username}'`);
    return recipe_ids;
  } catch(error)
  {
    next(error);
  }
}

module.exports = router;
