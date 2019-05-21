const logger = require("../utils/logger")(__filename);
const schemas = require("../models/schemas");
const Joi = require("@hapi/joi");
const ErrorWrapper = require("../utils/ErrorWrapper");

/** 
 * schemaValidator helper for middleware. Not combined with the body of the middleware so it can be unit testable.
 * @param {Object} body - An object literal posted to the server by client (req.body).
 * @param {Joi} schema - Joi schema modeled to represent the structure of the posted object
 * @param {String} [errorMessage] - optional error to send to user
 * @param {Function} [logger] - callback to log error if exists; must be a fn signature
 * @returns {Object} - returns the validated object schema.
 * @throws {ErrorWrapper} - If the schema fails validation
*/
const schemaValidator = (body, schema, errorMessage, logger) => {
  
  const { value, error } = Joi.validate(body, schema);

  if (error) {
    logger && logger(error.message);
    throw new ErrorWrapper(errorMessage || error.message.replace(/"/g, "'"), "ValidationError", 400);
  };
    
  return value;
}


module.exports = (req, res, next) => {
  logger.info(`Validating JSON request for endpoint ${req.originalUrl}`);
  let body;
  let errorMessage = null;

  try {
    switch(req.originalUrl) {
      case "/api/fetchdirections":
        errorMessage = "Missing required attributes for search. Try to refresh.";
        body = schemaValidator(req.body, schemas.directionsSchema, errorMessage, logger.warn);
        break;
      case "/api/fetchincidents":
        errorMessage = "Missing required attributes for incident detection.";
        body = schemaValidator(req.body, schemas.incidentsSchema, errorMessage, logger.warn);
        break;
      default:
        logger.warn("Route not found. Not validating JSON.")
    }
    
    res.locals.body = body; // do not use req.body as it does not contain the validated schema type conversions

    next();
    
  } catch (err) {
    next(err);
  }
}