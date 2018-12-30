const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

// defined model
const userSchema = new Schema({
  email: { type: String, unique: true, lowercase: true }, // unique is case sensitive, so lowercase to remove sensitivity
  password: String
});

const hashPassword = password => {
  // generate a salt then run callback
  const salt = bcrypt.genSaltSync(10); 
  // hash (encrypt) our password using the salt
  const hash = bcrypt.hashSync(password, salt, null);
  return hash;
  };


// On Save Hook, encrypt password
userSchema.pre("save", function(next) { // "before this model is saved, run function"
  const user = this; // access current user model
  const hashedPass = hashPassword(user.password);
  user.password = hashedPass;
  next(); // save model now
})

const ModelClass = mongoose.model("user", userSchema);

module.exports = ModelClass;