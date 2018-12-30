const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// defined model
const userSchema = new Schema({
  email: { type: String, unique: true, lowercase: true }, // unique is case sensitive, so lowercase to remove sensitivity
  password: String
});

const ModelClass = mongoose.model("user", userSchema);

module.exports = ModelClass;