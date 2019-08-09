const HttpStatus = require("http-status-codes");
const logger = require("../utils").logger(__filename);
const { google: { verifyRecaptcha } } = require("../services")
const { enableRecaptcha } = require("../config");

module.exports = async (req, res, next) => {
  
  try {
    if (!req.headers.recaptcha && enableRecaptcha) {
      logger.warn("Recaptcha was not provided.");
      return res.status(HttpStatus.FORBIDDEN).send({ message: "Recaptcha verification failed." });
    }

    const result = await verifyRecaptcha(req.headers.recaptcha);

    if (result) {
      return next();
    } else {
      logger.warn("Recaptcha is not valid.");
      return res.status(HttpStatus.FORBIDDEN).send({ message: "Recaptcha verification failed." });
    }
  } catch (err) {
    return next(err);
  }
  
  
};
