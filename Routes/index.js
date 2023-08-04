const express = require("express");
const controller = require("../controller/user");

const Userroutes = express.Router();

Userroutes.post("/signup", controller.signupUser);
Userroutes.post("/login", controller.loginUser);
Userroutes.get("/logout", controller.logout);
Userroutes.get("*", controller.wrongGet);
Userroutes.post("*", controller.wrongPost);

module.exports = Userroutes;
