const User = require("../models/user");
const tokenForUser = require("../utils/tokenForUser");
const Joi = require("@hapi/joi");
const logger = require("../utils").logger(__filename);

exports.signin = (req, res, next) => {
  // run when passport finishes authenticating email/password.
  // give user a token
  // accesses user.id allowed because passport supplies a `done` callback; we returned a found user with done(null, user); access via req.user
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    logger.warn("User did not provide an email and/or password.");
    return res.status(422).send({ message: "Email and password must be provided." });
  }

  const { error } = Joi.validate(email, Joi.string().email());
  if (error) {
    logger.warn("User provided an email with invalid format.");
    return res.status(422).send({ message: "Invalid email provided." });
  }

  // see if user with given email exists. `User` refers to all users, not just one.
  User.findOne({ email: email }, (err, existingUser) => {
    // existingUser will be null if not found.
    if (err) { return next(err); }

    // if user exists, return error
    if (existingUser) {
      logger.warn("User provided duplicate email.");
      return res.status(422).send({ message: "Email is in use." });
    }

    // user does not exist, create and save new user record
    const userToSave = new User({
      email: email,
      password: password
    });

    userToSave.save(err => {
      if (err) { return next(err); }

      logger.info("User successfully signed up.");
      res.json({ token: tokenForUser(userToSave) }); // response to request indicating creation of user.
    }); // save record to database.


  });
}