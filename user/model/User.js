const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema(
    {
      id: {type: Number},
      userid: {type: String},
      name: {type: String},
      vorname: {type: String},
      street: {type: String},
      no: {type: String},
      city: {type: String},
      email: {type: String},
      password: {type: String},
    }
);
module.exports = mongoose.model("User", userSchema);