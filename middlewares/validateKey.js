const HttpStatus = require("http-status-codes");
const logger = require("../utils").logger(__filename);
const { key } = require("../config");

module.exports = (req, res, next) => {
  // middleware to ensure that the api `key` in the header of the request matches
  if (req.headers.key !== key) {
    logger.error("Wayfarer API key not provided in header.");
    return res.status(HttpStatus.FORBIDDEN).send();
  }
  next();
}