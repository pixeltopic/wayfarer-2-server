const User = require("../models/user");
const tokenForUser = require("../utils/tokenForUser");
const logger = require("../utils").logger(__filename);
const HttpStatus = require("http-status-codes");

exports.signin = (req, res, next) => {
  // run when passport finishes authenticating email/password.
  // give user a token
  // accesses user.id allowed because passport supplies a `done` callback; we returned a found user with done(null, user); access via req.user
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = async (req, res, next) => {
  const {email, password} = res.locals.body;

  try {
    // finds a user satisfying specified email in table of all users
    const userRecord = await User.findOne({ email }); // userRecord will be null if not found

    if (userRecord) {
      logger.warn("User provided duplicate email.");
      return res
        .status(HttpStatus.UNPROCESSABLE_ENTITY)
        .send({ message: "Email is in use." });
    }

    // user does not exist, create and save new user record
    const userToSave = new User({
      email,
      password
    });
    await userToSave.save();

    logger.info("User successfully signed up.");

    res.status(HttpStatus.OK).json({ token: tokenForUser(userToSave) });
  } catch (err) {
    next(err);
  }
};
