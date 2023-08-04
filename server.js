const express = require("express");
require("dotenv").config();
const port = process.env.PORT || 8090;
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
app.use(cors());
app.use(bodyParser.json());
console.log(process.env.PORT);

//!router callback function
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

//!server creation
app.listen(port, () => {
  console.log(`Server Created port: http://localhost:${port}`);
});

app.use("/user", require("./Routes/index"));
app.use("/link", require("./Routes/upiLink"));
