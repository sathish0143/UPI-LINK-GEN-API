const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../configs/index.js");
const axios = require("axios");
const Transaction = require("../Model/Transaction.js");
const User = require("../Model/User.js");
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
      if (!jwtObject && !user) {
        return res
          .status(404)
          .json({ message: " Username and token are must be entered" });
      }

      //*find object present or not
      const findUser = await User.findOne({ _id: jwtObject.id });
      if (!findUser) {
        return res.status(404).json({ message: "You dont have access" });
      } else {
        const query = { user: jwtObject.id, isActive: 1 };
        const foundDocument = await Transaction.findOne(query);
        if (!foundDocument) {
          return res.status(404).json({ message: "Document not found" });
        } else {
          const checkRefId = await Transaction.findOne({
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
              "aWSVQNyt+z3IiJHV+YX9UvYtyUnrVdMU2D+Yxt1MGQYilHwbPb2MizT5ZH2H0RxymCRGyaAwHn8ocjXFCALmeXW4RrTz80RxMiQjZwZD4U7RyNz/CFVYuWk+ifrZVCGVRd07O/LTVyvFgF1TgkF1TQ=="
            )
              .then((response) => {
                //!recive call back and store to database
                const saveDetails = {
                  User: jwtObject.id,
                  amount: req.body.amount,
                  reference_id: req.body.reference_id,
                  transcation_note: req.body.transcation_note,
                  status: response.data.data.status,
                  transcation_id: response.data.data.transcation_id,
                  isActive: 1,
                };
                Transaction.create(saveDetails);
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
      }
    } catch (err) {
      res.status(500).send("Error  generating link");
      console.log(err);
    }
  },
  status: async (req, res) => {
    try {
      var token = req.token;
      var jwtObject = jwt.verify(token, process.env.SECRET);
      if (!jwtObject && !user) {
        return res
          .status(404)
          .json({ message: " referrence id and token are must be entered" });
      }
      const findUser = await User.findOne({ _id: jwtObject.id });

      if (!findUser) {
        return res.status(404).json({ message: "User not found" });
      } else {
        const query = {
          user: jwtObject.id,
          isActive: 1,
          reference_id: req.body.reference_id,
        };
        const checkRefId = await Transaction.findOne({ query });
        if (!checkRefId) {
          return res.status(404).json({ message: " Reference id not found" });
        } else {
          res.status(200).send(checkRefId);
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
  filter: async (req, res) => {
    try {
      var token = req.token;
      var jwtObject = jwt.verify(token, process.env.SECRET);
      if (!jwtObject && !user) {
        return res
          .status(404)
          .json({ message: " referrence id and token are must be entered" });
      }
      const findUser = await User.findOne({ _id: jwtObject.id });

      if (!findUser) {
        return res.status(404).json({ message: "User not found" });
      } else {
        const query = {
          user: jwtObject.id,
          isActive: 1,
          status: req.params.status,
        };
        const items = await Transaction.find({
          query,
        });
        console.log(req.params.status);
        res.json({ items });
        if (!items) {
          return res.status(404).json({ error: "Item not found" });
        }
        console.log(items);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to filter data" });
    }
  },
};
