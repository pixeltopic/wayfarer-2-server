const logger = require("../utils/logger")(__filename);
const schemas = require("../models/schemas");
const Joi = require("@hapi/joi");
const ErrorWrapper = require("../utils/ErrorWrapper");

/** 
 * schemaValidator helper for middleware. Not combined with the body of the middleware so it can be unit testable.
 * @param {Object} requestBody - An object literal posted to the server by client.
 * @param {Joi} schema - Joi schema modeled to represent the structure of the posted object
 * @param {String} [errorMessage] - optional error to send to user
 * @param {Function} [logger] - callback to log error if exists; must be a fn signature
 * @returns {ErrorWrapper|null} - returns null on success or an ErrorWrapper if the requestBody did not match the schema
*/
const schemaValidator = (requestBody, schema, errorMessage, logger) => {
  let error = null;
  ({ error } = Joi.validate(requestBody, schema));

  if (error) {
    logger && logger(error.message);
    return new ErrorWrapper(errorMessage || error.message.replace(/"/g, "'"), "ValidationError", 400);
  };
    
  return null;
}


module.exports = (req, res, next) => {
  logger.info(`Validating JSON request for endpoint ${req.originalUrl}`);
  let error = null;
  let errorMessage = null;
  switch(req.originalUrl) {
    case "/api/fetchdirections":
      errorMessage = "Missing required attributes for search. Try to refresh.";
      error = schemaValidator(req.body, schemas.directionsSchema, errorMessage, logger.warn);
      break;
    case "/api/fetchincidents":
      errorMessage = "Missing required attributes for incident detection.";
      error = schemaValidator(req.body, schemas.incidentsSchema, errorMessage, logger.warn);
      break;
    default:
      logger.warn("Route not found. Not validating JSON.")
  }
  if (error) {
    next(error);
  } else {
    next();
  }
}