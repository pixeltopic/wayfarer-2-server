const Joi = require("@hapi/joi");

const directionsSchema = Joi.object().keys({
  origin: Joi.string(),
  destination: Joi.string().required(),
  mode: Joi.string().lowercase().valid(["driving", "bicycling", "transit", "walking"]).required(),
  units: Joi.string().lowercase().valid(["imperial", "metric"]).required(),
  altRoutes: Joi.boolean().required(),
  avoidFerries: Joi.boolean(),
  avoidHighways: Joi.boolean(),
  avoidIndoor: Joi.boolean(),
  avoidTolls: Joi.boolean(),
  currentLocation: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  })
}).or("origin", "currentLocation");

exports.directionsSchema = directionsSchema;

// essentially the same as directionsSchema with an additional extraParams now, so we don't need to post a ton of data from the frontend. Saves a lot of processing/response time!
exports.incidentsSchema = Joi.object().keys({
  directionSearchParams: directionsSchema.required(),
  extraParams: Joi.object().keys({
    radius: Joi.number().min(0).required() // no need for units with the inclusion of units from directionsSchema
  }).default({})
});