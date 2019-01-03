const jwt = require("jsonwebtoken");
const User = require("../models/user");
const tokenForUser = require("../utils/tokenForUser");
const keys = require("../config/keys");

module.exports = (req, res, next) => {
  // middleware to ensure that the jwt is valid.
  // if jwt expired under x minutes ago, allow refresh.
  // if not, do not allow refresh.
  if (!req.headers.authorization) {
    return res.status(403).send({ error: "authorization key not provided." });
  }

  const now = Math.ceil(new Date().getTime() / 1000);

  const decoded = jwt.decode(req.headers.authorization);
  console.log("decoded jwt:", decoded, now);
  
  if (now < decoded.exp) {
    // token has not expired yet so does not need to change
    req.auth = { token: "", authorized: true };
  } else {
    if (now - decoded.exp < 300) { // if it has been less than 5 minutes of inactivity, refresh token
      const newToken = tokenForUser(decoded.sub);
      req.auth = { token: newToken, authorized: true }
      req.refreshedToken = newToken;
    } else {
      req.auth = { token: "", authorized: false }
    }
  }
  
  next();
}