const LocalStrategy = require("passport-local");
const { userdb: { findUserByEmail } } = require("../db");

const logger = require("../utils").logger(__filename);
const { password: { comparePassword } } = require("../utils"); 

// Local Login
const localOptions = {
  usernameField: "email"
};

exports.localLogin = new LocalStrategy(
  localOptions,
  async (email, password, done) => {
    // `done` callback is provided by passport and is in the format of done(err, payload)
    try {
      const user = await findUserByEmail(email);

      if (!user) {
        return done(null, false);
      }

      logger.info("comparing passwords now");
      const isMatch = comparePassword(password, user.password);

      return isMatch ? done(null, user) : done(null, false); // done(null, user) should be still fine since tokenForUser accepts a user with id property

    } catch(err) {
      logger.error(err);
      return done(err);
    }
  }
);
