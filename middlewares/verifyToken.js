const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const logger = require("../utils").logger(__filename);

module.exports = (req, res, next) => {
  // verifies if jwt is valid. Should always be called after refreshToken.
  logger.info(`authorization header: ${req.headers.authorization}`);
  logger.info(`refreshedtoken: ${res.locals.refreshedToken || "N/A"}`);

  if (res.locals.noAuth) {
    return res.status(401).send({ error: "Unauthorized."});
  }

  if (!req.headers.authorization && !res.locals.refreshedToken) {
    return res.status(401).send({ error: "Authorization expired."});
  }
  if (res.locals.refreshedToken) {
    try {
      jwt.verify(res.locals.refreshedToken, keys.userSecret);
    } catch(e) {
      return res.status(401).send({ error: "Authorization expired. Refreshed token inactive."});
    }
    
  } else {
    try {
      jwt.verify(req.headers.authorization, keys.userSecret);
    } catch(e) {
      return res.status(401).send({ error: "Authorization expired. Token invalid for refresh."});
    }
    
  }

  
  next();
}