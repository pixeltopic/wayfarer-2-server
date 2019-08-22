const Joi = require("@hapi/joi");

const directions = Joi.object().keys({
  origin: Joi.string().allow(""),
  destination: Joi.string().required(),
  mode: Joi.string().lowercase().valid(["driving", "bicycling", "transit", "walking"]).required(),
  units: Joi.string().lowercase().valid(["imperial", "metric"]).required().default("imperial"),
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

const savedDirections = Joi.object().keys({
  routeName: Joi.string().required(),
  directionSearchParams: directions.required(),
});

const findSavedDirections = Joi.object().keys({
  id: Joi.string().allow(""),
  userId: Joi.string().allow(""),
  routeName: Joi.string().allow(""),
})

module.exports = {
  directions,
  savedDirections,
  findSavedDirections,
}