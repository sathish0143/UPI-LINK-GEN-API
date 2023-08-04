const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../configs/index.js");
const axios = require("axios");
const User = require("../Model/Schema");
require("dotenv").config();

const callbackFun = async (newObject, token) => {
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

module.exports = {
  generateToken: async (req, res) => {
    try {
      var token = req.token;
      var jwtObject = jwt.verify(token, process.env.SECRET);

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
  },
  status: async (req, res) => {
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
  },
  filter: async (req, res) => {
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
  },
};
