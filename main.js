/////new         --------------------


//#region express configures
require("dotenv").config();
//#region express configures
const express = require("express");
var path = require("path");
const logger = require("morgan");
const session = require("client-sessions");
const bodyParser = require("body-parser")

//#endregion
const user = require("./routes/user");
const profile = require("./routes/profile");
const recipes = require("./routes/recipes");


//DB import
const DButils = require("./modules/DButils");

var app = express();
app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
const port = process.env.PORT || "4000";

//pasre aplication by json
app.use(bodyParser.urlencoded({extended: true})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json());
// print request logs
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files

// autotecation
app.use(
  session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET, // the encryption key
    duration: 20 * 60 * 1000, // expired after 20 min
    activeDuration: 0 // if expiresIn < activeDuration,
  })
);


// #region cookie middleware
app.use(function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM dbo.users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
        }
        next();
      })
      // the user will go to register / login page
      .catch((error) => next(error));
  } else {
    next();
  }
});

// app.get("/alive", (req, res) => res.send("welcome"));

app.use("/user", user);
app.use("/profile", profile);
app.use("/recipes", recipes);


const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "POST, PUT, GET, DELETE");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authToken");
//   next();
// });

// error message
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).send({ message: err.message, success: false });
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});
