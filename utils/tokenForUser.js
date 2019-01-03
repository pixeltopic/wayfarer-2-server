const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

module.exports = user => {
  // generates a jwt for user based on userSecret
  // const timestamp = new Date().getTime();
  // return jwt.encode({ sub: user.id, iat: timestamp }, keys.userSecret);
  return jwt.sign({ sub: user.id }, keys.userSecret, { expiresIn: keys.tokenExpiryTime });
}