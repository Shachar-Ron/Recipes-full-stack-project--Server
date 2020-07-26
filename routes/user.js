
//-------/Register,/Login,/Logout
var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");
const bcrypt = require("bcryptjs");


router.post("/register", async (req, res, next) => {
    try {
      // parameters exists
      if (!req.body.username || !req.body.firstname || !req.body.lastname || !req.body.country || !req.body.email ||
        !req.body.password || !req.body.imageUrl ) {
          throw { status: 400, message: "The request is invalid, There is empty fields." ,success: false };
      }
      // all users
      const users = await DButils.execQuery("SELECT username, email FROM [dbo].[users]");
      //if user name is take
      if (users.find((x) => x.username === req.body.username))
      {
        throw { status: 409, message: "Username already exist" ,success: false };
      }
      
      if (users.find((x) => x.email === req.body.email))
      {
        throw { status: 405, message: "E-Mail already exist" ,success: false };
      }
      // all user data from body
      let user_data = req.body;
      // add the new username
      let hash_password = bcrypt.hashSync(
        user_data.password,
        parseInt(process.env.bcrypt_saltRounds)
      );
      await DButils.execQuery(
       `INSERT INTO [dbo].[users] VALUES ('${user_data.username}',
                                      '${user_data.firstname}',
                                      '${user_data.lastname}',
                                      '${user_data.country}',
                                      '${user_data.email}',
                                      '${user_data.imageUrl}',
                                      '${hash_password}'        
                                      )`);
      // no cookie needed!
      res.status(201).send({ message: "User created", success: true });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/login", async (req, res, next) => {
  try {
    // check that username exists
    const users = await DButils.execQuery("SELECT username FROM [dbo].[users]");
    if (!users.find((x) => x.username === req.body.username))
      throw { status: 401, message: "Username or Password incorrect.", success: false  };
    // check that the password is correct
    const user = (
      await DButils.execQuery(`SELECT * FROM [dbo].[users] WHERE username = '${req.body.username}'`))[0];

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect.", success: false };
    }

    // Set cookie
    req.session.user_id = user.user_id;
    req.session.username = user.username;

    res.status(200).send({ message: "login succeeded." , success: true });

  } catch (error) {
    next(error);
  }
});

router.get("/logout", function (req, res) {
  try {
    req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
    res.status(200).send({ message: "logout succeeded." , success: true });
  }catch (error) {
    next(error);
  }
});

module.exports = router;
