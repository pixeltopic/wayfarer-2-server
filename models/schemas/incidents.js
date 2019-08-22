const Joi = require("@hapi/joi");
const { directions } = require("./directions");

// essentially the same as directionsSchema with an additional extraParams now, so we don't need to post a ton of data from the frontend. Saves a lot of processing/response time!
const incidents = Joi.object().keys({
  directionSearchParams: directions.required(),
  extraParams: Joi.object().keys({
    radius: Joi.number().min(0).required() // no need for units with the inclusion of units from directionsSchema
  }).default({})
});

module.exports = {
  incidents,
}