const LocalStrategy = require("passport-local");
const User = require("../models/user");

const logger = require("../utils").logger(__filename);

// Local Login
const localOptions = {
  usernameField: "email"
};

exports.localLogin = new LocalStrategy(
  localOptions,
  (email, password, done) => {
    // verify username & password, call `done` with user if true if correct
    // else call `done` with false
    User.findOne({ email: email }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }
      logger.info("comparing passwords now");
      user.comparePassword(password, (err, isMatch) => {
        if (err) {
          return done(err);
        }
        if (!isMatch) {
          return done(null, false);
        }

        return done(null, user);
      });
    });
  }
);
