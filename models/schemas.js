const Joi = require("@hapi/joi");

exports.signupSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const directionsSchema = Joi.object().keys({
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

exports.directionsSchema = directionsSchema;

// essentially the same as directionsSchema with an additional extraParams now, so we don't need to post a ton of data from the frontend. Saves a lot of processing/response time!
exports.incidentsSchema = Joi.object().keys({
  directionSearchParams: directionsSchema.required(),
  extraParams: Joi.object().keys({
    radius: Joi.number().min(0).required() // no need for units with the inclusion of units from directionsSchema
  }).default({})
});


// const { keyword, type, radius, minprice, maxprice, units, address } = req.body;
exports.placesSchema = Joi.object().keys({
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

exports.placeDetailsSchema = Joi.object().keys({
  place_id: Joi.string().required()
});

exports.placesTokenSchema = Joi.object().keys({
  nextPageToken: Joi.string().required()
});