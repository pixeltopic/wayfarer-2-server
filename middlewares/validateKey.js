const keys = require("../config");

module.exports = (req, res, next) => {
  // middleware to ensure that the api `key` in the header of the request matches
  if (req.headers.key !== keys.key) {
    return res.status(403).send({ message: "invalid api key" });
  }
  next();
}