const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  username: { type: String, unique: true },
  password: { type: String },
  email: {
    type: String,
    require: true,
    index: true,
    unique: true,
    sparse: true,
  },
  isActive: Boolean,
});

module.exports = mongoose.model("User", User);
