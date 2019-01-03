const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

module.exports = (req, res, next) => {
  // verifies if jwt is valid. Should always be called after refreshToken.
  console.log("authorization header:", req.headers.authorization);
  console.log("refreshedtoken:", req.refreshedToken);

  if (!req.headers.authorization && !req.refreshedToken) {
    return res.status(403).send({ error: "Authorization expired"});
  }
  if (req.refreshedToken) {
    jwt.verify(req.refreshedToken, keys.userSecret, (err, decoded) => {
      if (err) { 
        return res.status(403).send({ error: "Authorization expired (1)"}); 
      }
    });
  } else {
    jwt.verify(req.headers.authorization, keys.userSecret, (err, decoded) => {
      if (err) { 
        return res.status(403).send({ error: "Authorization expired (2)"}); 
      }
    });
  }

  
  next();
}