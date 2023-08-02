const link = require("express").Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("./config");
const User = require("./Schema");
const express = require("express");
const axios = require("axios");

//!middleware to get bearer token from headder
link.use(express.json());
function checkToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

//!call back funttion to generate link

link.post("/generatelink", checkToken, async (req, res) => {
  try {
    var token = req.token;
    var jwtObject = jwt.verify(token, config.secret);

    //*find object present or not
    const query = { _id: jwtObject.id };
    const foundDocument = await User.findOne(query);
    if (!foundDocument) {
      return res.status(404).json({ message: "Document not found" });
    } else {
      //!for unique refrance id
      const checkRefId = await User.findOne({
        "transaction.reference_id": req.body.reference_id,
      });
      if (!checkRefId) {
        const newObject = {
          amount: req.body.amount,
          reference_id: req.body.reference_id,
          transcation_note: req.body.transcation_note,
        };
        //!callback to generate upi link
        callbackFun(
          newObject,
          "aWSVQNyt+z3IiJHV+YX9UpROt9APFfeJkenakdl9YQvv8DECkPxJoaJKT28qbITpU3+gxlwnWi96igWiAUX8Cw=="
        )
          .then((response) => {
            //!recive call back and store to database
            const saveDetails = {
              amount: req.body.amount,
              reference_id: req.body.reference_id,
              transcation_note: req.body.transcation_note,
              status: response.data.data.status,
              transcation_id: response.data.data.transcation_id,
            };
            foundDocument.transaction.push(saveDetails);
            foundDocument.save();

            res.json(response.data);
          })
          .catch((error) => {
            console.log(error);
            res.send("Api not connected properly");
          });
      } else {
        res.json({
          status: false,
          statusCode: 400,
          message: "reference_id already exists!",
        });
      }
    }
  } catch (err) {
    res.status(500).send("Error  generating link");
    console.log(err);
  }
});

//!callback funtion for get upi link and other data
const callbackFun = async (newObject, token) => {
  //!important
  //! replace with bulkpe link generaion url
  const apiUrl = " https://api.bulkpe.in/client/checkOutRequest";
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(apiUrl, newObject, config);

    return response;
  } catch (error) {
    console.error("Error generating UPI collection link:", error.message);
    throw error;
  }
};

//! user wants to check payment status- here
link.get("/status", async (req, res) => {
  try {
    const checkRefId = await User.findOne(
      {
        "transaction.reference_id": req.body.reference_id,
      },
      { "transaction.$": 1 }
    );
    res.status(200).send(checkRefId.transaction);
  } catch (err) {
    console.log(err);
  }
});

//!filter data using status
link.get("/status/:status", async (req, res) => {
  try {
    const items = await User.find(
      {
        "transaction.status": req.params.status,
      },
      { "transaction.$": 100 }
    );
    console.log(req.params.status);
    res.json({ items });
    if (!items) {
      return res.status(404).json({ error: "Item not found" });
    }
    console.log(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to filter data" });
  }
});

module.exports = link;
