const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

module.exports = (req, res, next) => {
  // verifies if jwt is valid. Should always be called after refreshToken.
  console.log("authorization header:", req.headers.authorization);
  console.log("refreshedtoken:", req.refreshedToken);

  if (req.noAuth) {
    return res.status(403).send({ error: "Unauthorized."});
  }

  if (!req.headers.authorization && !req.refreshedToken) {
    return res.status(403).send({ error: "Authorization expired."});
  }
  if (req.refreshedToken) {
    try {
      jwt.verify(req.refreshedToken, keys.userSecret);
    } catch(e) {
      return res.status(403).send({ error: "Authorization expired. Refreshed token inactive."});
    }
    
  } else {
    try {
      jwt.verify(req.headers.authorization, keys.userSecret);
    } catch(e) {
      return res.status(403).send({ error: "Authorization expired. Token invalid for refresh."});
    }
    
  }

  
  next();
}