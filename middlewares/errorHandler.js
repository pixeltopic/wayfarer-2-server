const logger = require("../utils/logger")(__filename);

// automatically enter this central error handler by doing next(err) where err is an Error object
module.exports = (err, req, res, next) => {
  logger.warn("Stack trace");
  logger.error(err.stack)
  return res.status(err.getStatusCode()).send({ error: err.message || "Unlabeled error." });
}