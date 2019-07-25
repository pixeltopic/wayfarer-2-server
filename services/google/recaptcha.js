const axios = require("axios");
const { googleRecaptchaKey, enableRecaptcha } = require("../../config");
const logger = require("../../utils").logger(__filename);


const skipRecaptcha = () => {
  if (process.env.NODE_ENV !== "production" && enableRecaptcha) {
    logger.warn("Recaptcha validation currently enabled in dev mode.");
    return false
  } else if (process.env.NODE_ENV !== "production") {
    logger.warn("Recaptcha is disabled in dev mode by default.");
    return true
  } 

  return false
}

/**
 * Given a recaptcha token, returns true if it is valid.
 * @param {string} recaptcha - recaptcha token generated from client
 * @returns {Promise<boolean>}
 */
const verifyRecaptcha = async recaptcha => {

  if (skipRecaptcha()) {
    return true
  }

  if (!recaptcha) {
    logger.warn("Recaptcha was not provided.");
    return false
  }


  const { data } = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${
      googleRecaptchaKey
    }&response=${recaptcha}`
  );

  return !!data.success
}

module.exports = { 
  verifyRecaptcha
}