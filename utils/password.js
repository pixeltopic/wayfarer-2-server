const bcrypt = require("bcrypt-nodejs");

/**
 * Hashes a password using a salt and returns the new hash
 * @param {string} password 
 */
const hashPassword = password => {
  // generate a salt then run callback
  const salt = bcrypt.genSaltSync(10);
  // hash (encrypt) our password using the salt
  const hash = bcrypt.hashSync(password, salt, null);
  return hash;
};

const comparePassword = (candidatePw, pw) => {
  const isMatch = bcrypt.compareSync(candidatePw, pw);
  return isMatch;
}

module.exports = {
  hashPassword,
  comparePassword,
}