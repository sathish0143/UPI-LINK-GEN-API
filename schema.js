const mongoose = require("mongoose");

//!schema for our data model
const userSchema = new mongoose.Schema({
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

const User = mongoose.model("Bulkpe-api ", userSchema);

module.exports = User;
