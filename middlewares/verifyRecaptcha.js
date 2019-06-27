const axios = require("axios");
const keys = require("../config/keys");
const logger = require("../utils").logger(__filename);

const ENABLE_RECAPTCHA = true; // false if you want to use postman to make testing easier

module.exports = async (req, res, next) => {
  if (process.env.NODE_ENV === "production" || ENABLE_RECAPTCHA) {
    if (process.env.NODE_ENV !== "production") {
      logger.warn("Recaptcha validation currently enabled in dev mode.");
    }
    try {
      if (!req.headers.recaptcha) {
        logger.warn("Recaptcha was not provided.");
        return res.status(403).send({ message: "Recaptcha verification failed." });
      }
  
      const { data } = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${
          keys.googleRecaptchaKey
        }&response=${req.headers.recaptcha}`
      );
  
      if (data.success) {
        return next();
      }
  
      logger.warn("Recaptcha is not valid.");
      return res.status(403).send({ message: "Recaptcha verification failed." });
    } catch (err) {
      next(err);
    }
  } else {
    logger.warn("Recaptcha is disabled in dev mode by default.");
    return next();
  }
  
};
