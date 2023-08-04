const bcrypt = require("bcrypt");
require("dotenv").config();

module.exports = {
  validator: async (plainPass, hashPass) => {
    const result = await bcrypt.compare(plainPass, hashPass);
    return result;
  },
  hashGenerate: async (plainPassword) => {
    const salt = await bcrypt.genSalt(process.env.SALT);
    const hashval = await bcrypt.hash(plainPassword, salt);
    return hashval;
  },
};
