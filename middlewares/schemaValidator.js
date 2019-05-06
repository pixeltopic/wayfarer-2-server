const logger = require("../utils/logger")(__filename);
const schemas = require("../models/schemas");
const Joi = require("@hapi/joi");
const ErrorWrapper = require("../utils/ErrorWrapper");

module.exports = (req, res, next) => {
  logger.info(`Validating JSON request for endpoint ${req.originalUrl}`);
  let error = null;
  let message = null;
  switch(req.originalUrl) {
    case "/api/fetchdirections":
      ({ error } = Joi.validate(req.body, schemas.directionsSchema));
      message = "Missing required attributes for search. Try to refresh.";
      break;
    default:
      logger.warn("Route not found. Not validating JSON.")
  }
  if (error) {
    error = new ErrorWrapper(message || error.message.replace(/"/g, "'"), "ValidationError", 400);
    next(error);
  } else {
    next();
  }
}