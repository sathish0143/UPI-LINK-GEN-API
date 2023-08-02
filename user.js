const Userroutes = require("express").Router();
const mongoose = require("mongoose");
const config = require("./config");
const jwt = require("jsonwebtoken");
const { hashGenerate } = require("./hash");
const { validator } = require("./validator");
const generateRoute = require("./generateLink");
const User = require("./Schema");

//!get all data from mongo

let userStatus = false;
let token;

//!post data to mongo for signup

Userroutes.post("/signup", async (req, res) => {
  try {
    //!check user already registered
    const existUser = await User.findOne({ username: req.body.username });
    const hashPass = await hashGenerate(req.body.password);
    const password = hashPass;
    console.log(password);
    console.log(existUser);
    if (!existUser) {
      if (!req.body.username || !req.body.password || !req.body.email) {
        res.send("check username,password,email are present");
      } else {
        console.log("Hi new user");
        const newObject = new User({
          username: req.body.username,
          password: password,
          email: req.body.email,
        });
        newObject
          .save()
          .then((savedObject) => {
            res.status(200).json(savedObject);
          })
          .catch((error) => {
            console.log(error);
            res
              .status(500)
              .json({ error: "Error adding object to the database" });
          });
      }
    } else {
      res.send("User already exists,Please go to login path--> api/user/login");
      //console.log("already email was registered");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating user");
  }
});

//!login to data
Userroutes.post("/login", async (req, res) => {
  const existUser = await User.findOne({ username: req.body.username });
  //console.log(existUser.password, req.body.password);
  if (!existUser) {
    res.send(
      "User not registered ,Please go to signup path--> api/user/signup"
    );
    res.redirect("/signup");
  } else {
    const password = req.body.password;
    const checkUser = await validator(password, existUser.password);
    if (!checkUser) {
      res.send("please enter correct password");
    } else {
      token = jwt.sign({ id: existUser._id }, config.secret, {
        expiresIn: "1h",
      });

      res.status(200).send({ auth: true, token: token, valid: "1hour" });
      userStatus = true;
      console.log(userStatus, "status");
    }
  }
});

//!logout user
Userroutes.get("/logout", function (req, res) {
  res.status(200).send({ auth: false, token: null });
  userStatus = false;
  console.log(userStatus, "status");
});

Userroutes.use("/", generateRoute);

module.exports = Userroutes;
