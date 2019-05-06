const Joi = require("@hapi/joi");

exports.directionsSchema = Joi.object().keys({
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