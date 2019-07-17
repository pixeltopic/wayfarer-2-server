const User = require("../models/user");
const { userSecret } = require("../config");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const LocalStrategy = require("passport-local");

const logger = require("../utils").logger(__filename);

// Local Login
const localOptions = { 
  usernameField: "email" 
};

exports.localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  // verify username & password, call `done` with user if true if correct
  // else call `done` with false
  User.findOne({ email: email }, (err, user) => {
    if (err) { return done(err); }

    if (!user) {
      return done(null, false);
    }
    logger.info("comparing passwords now");
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (!isMatch) { return done(null, false); }

      return done(null, user);
    });
  });
});

// Jwt Login

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"), // extracts `authorization` header from post request, etc. Decode jwt in header with `secretOrKey`
  secretOrKey: userSecret
};

exports.jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // See if userID in payload exists in our database
  // if so, call `done` callback with user object else call `done` with false.
  User.findById(payload.sub, (err, user) => {
    if (err) { return done(err, false); }

    if (user)  {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});
