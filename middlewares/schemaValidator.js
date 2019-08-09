const logger = require("../utils/logger")(__filename);
const schemas = require("../models/schemas");
const Joi = require("@hapi/joi");
const ErrorWrapper = require("../utils/ErrorWrapper");
const HttpStatus = require("http-status-codes");

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
    throw ErrorWrapper(errorMessage || error.message.replace(/"/g, "'"), "ValidationError", HttpStatus.UNPROCESSABLE_ENTITY);
  }
    
  return value;
}


module.exports = (req, res, next) => {
  logger.info(`Validating JSON request for endpoint ${req.originalUrl}`);
  let body;
  let errorMessage = null;

  try {
    switch(req.originalUrl) {
      case "/api/signup":
        errorMessage = "Valid email and password must be provided.";
        body = schemaValidator(req.body, schemas.signupSchema, errorMessage, logger.warn);
        break;
      case "/api/directions":
        errorMessage = "Missing or invalid attributes for search. Try to refresh.";
        body = schemaValidator(req.body, schemas.directionsSchema, errorMessage, logger.warn);
        break;
      case "/api/incidents":
        errorMessage = "Missing or invalid attributes for incident detection.";
        body = schemaValidator(req.body, schemas.incidentsSchema, errorMessage, logger.warn);
        break;
      case "/api/places":
        errorMessage = "Missing or invalid attributes to search for nearby places.";
        body = schemaValidator(req.body, schemas.placesSchema, errorMessage, logger.warn);
        break;
      case "/api/places/details":
        errorMessage = "Missing or invalid attribute to retrieve place details.";
        body = schemaValidator(req.body, schemas.placeDetailsSchema, errorMessage, logger.warn);
        break;
      case "/api/places/token":
        errorMessage = "Missing token or invalid attributes.";
        body = schemaValidator(req.body, schemas.placesTokenSchema, errorMessage, logger.warn);
        break;
      default:
        logger.warn("Route not defined in schemaValidator. Not validating JSON.")
    }
    
    res.locals.body = body; // do not use req.body as it does not contain the validated schema type conversions

    next();
    
  } catch (err) {
    next(err);
  }
}