const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//!schema for our data model
const Transaction = new Schema({
  User: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  transcation_id: String,
  amount: Number,
  reference_id: {
    type: String,
  },
  transcation_note: String,
  status: String,
});

module.exports = mongoose.model("Transaction", Transaction);
