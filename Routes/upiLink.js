const link = require("express").Router();
const controller = require("../controller/genLink");

function checkToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0Y2NjYjVkYzE5YTY1NjllNTRiNDgzZCIsImlhdCI6MTY5MTE0MzAxNCwiZXhwIjoxNjkxMTQ2NjE0fQ.2xdDAPVagYwBsTBWDS4qi33xDYqjE9JpnwpRDHcmk_k";
    next();
  } else {
    res.sendStatus(403);
  }
}

link.post("/generatelink", checkToken, controller.generateToken);
link.get("/status", controller.status);
link.get("/status/:status", controller.filter);

module.exports = link;
