const express = require("express");
const routes = express.Router();
const user = require("./user");
const mongoose = require("mongoose");
const url =
  "mongodb+srv://SathishRam2000:je3KI4g16sLOwnZY@sathishr.azcpo.mongodb.net/";

//!connect mongodb
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

routes.use("/user", user);

module.exports = routes;
