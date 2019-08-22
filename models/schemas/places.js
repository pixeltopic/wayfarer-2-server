const Joi = require("@hapi/joi");

const places = Joi.object().keys({
  keyword: Joi.string().required(),
  type: Joi.string().allow(""),
  radius: Joi.number().min(0).required(),
  minprice: Joi.number().default(-1),
  maxprice: Joi.number().default(-1),
  units: Joi.string().lowercase().valid(["imperial", "metric"]).required().default("imperial"),
  currentLocation: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }),
  address: Joi.string().allow(""),
  
}).or("address", "currentLocation");

const placeDetails = Joi.object().keys({
  place_id: Joi.string().required()
});

const placesToken = Joi.object().keys({
  nextPageToken: Joi.string().required()
});

module.exports = {
  places,
  placeDetails,
  placesToken,
}