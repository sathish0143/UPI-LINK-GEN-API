const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//!schema for our data model
const Userschema = new Schema({
  username: { type: String, unique: true },
  password: { type: String },
  email: {
    type: String,
    require: true,
    index: true,
    unique: true,
    sparse: true,
  },
  transaction: [
    {
      transcation_id: String,
      amount: Number,
      reference_id: {
        type: String,
      },
      transcation_note: String,
      status: String,
    },
  ],
});

const User = mongoose.model("Bulkpe-database", Userschema);
module.exports = User;
