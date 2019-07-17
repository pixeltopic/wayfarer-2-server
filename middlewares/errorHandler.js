const HttpStatus = require("http-status-codes");
const logger = require("../utils/logger")(__filename);

// automatically enter this central error handler by doing next(err) where err is an Error object
module.exports = (err, req, res, next) => {
  logger.warn("Stack trace");
  logger.error(err.stack)
  if (err.getStatusCode)
    return res.set("Connection", "close").status(err.getStatusCode()).send({ message: err.message || "Server error." });
  else
    return res.set("Connection", "close").status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message || "Server error." });
}