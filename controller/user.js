const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../Model/User");
const hash = require("../service/passwordService");
require("dotenv").config();

let userStatus = false;
let token;
module.exports = {
  signupUser: async (req, res) => {
    try {
      //!check user already registered
      const existUser = await User.findOne({
        username: req.body.username,
      });
      const hashPass = await hash.hashGenerate(req.body.password);
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
        res.send(
          "User already exists,Please go to login path--> api/user/login"
        );
        //console.log("already email was registered");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Error creating user");
    }
  },

  loginUser: async (req, res) => {
    const existUser = await User.findOne({
      username: req.body.username,
    });
    //console.log(existUser.password, req.body.password);
    if (!existUser) {
      res.send(
        "User not registered ,Please go to signup path--> api/user/signup"
      );
    } else {
      const password = req.body.password;
      const checkUser = await hash.validator(password, existUser.password);
      if (!checkUser) {
        res.send("please enter correct password");
      } else {
        token = jwt.sign({ id: existUser._id }, process.env.SECRET, {
          expiresIn: "1h",
        });

        res.status(200).send({ auth: true, token: token, valid: "1hour" });
        userStatus = true;
        console.log(userStatus, "status");
      }
    }
  },
  logout: async (req, res) => {
    res.status(200).send({ auth: false, token: null });
    userStatus = false;
    await console.log(userStatus, "status");
  },
  wrongGet: (req, res) => {
    res.status(404);
    res.json({
      ERROR: "URL NOT FOUND",
      signup: {
        path: "api/user/signup",
        note: `Signup using below format`,
        body: { username: "xxx", password: "xxx", email: "xxx@gmail.com" },
      },
      login: {
        path: "api/user/login",
        note: `Login using below format `,
        body: { username: "xxx", password: "xxx" },
      },
    });
  },
  wrongPost: (req, res) => {
    res.status(404);
    res.json({
      ERROR: "URL NOT FOUND",
      signup: {
        path: "api/user/signup",
        note: `Signup using below format`,
        body: { username: "xxx", password: "xxx", email: "xxx@gmail.com" },
      },
      login: {
        path: "api/user/login",
        note: `Login using below format `,
        body: { username: "xxx", password: "xxx" },
      },
    });
  },
};
