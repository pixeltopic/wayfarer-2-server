const Joi = require("@hapi/joi");

const signup = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  signup,
}