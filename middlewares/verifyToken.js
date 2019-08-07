const jwt = require("jsonwebtoken");
const HttpStatus = require("http-status-codes");
const keys = require("../config");
const logger = require("../utils").logger(__filename);

module.exports = (req, res, next) => {
  // verifies if jwt is valid.
  logger.info(`authorization header - ${req.headers.authorization}`);

  if (!req.headers.authorization) {
    return res.status(HttpStatus.FORBIDDEN).send({ message: "Unauthorized." });
  }
  
  try {
    const payload = jwt.verify(req.headers.authorization, keys.userSecret);
    res.locals.sub = payload.sub;
    return next();
  } catch(err) {
    logger.warn(err.message);
    return res.status(HttpStatus.UNAUTHORIZED).send({ message: "Authorization token is an invalid format or expired."});
  }
}