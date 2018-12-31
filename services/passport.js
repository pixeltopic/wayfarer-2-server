const passport = require("passport");
const User = require("../models/user");
const keys = require("../config/keys");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"), // extracts `authorization` header from post request, etc. Decode jwt in header with `secretOrKey`
  secretOrKey: keys.userSecret
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // See if userID in payload exists in our database
  // if so, call `done` callback with user object else call `done` with false.
  User.findById(payload.subdomains, (err, user) => {
    if (err) { return done(err, false); }

    if (user)  {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// connect passport jwt strategy to passport

passport.use(jwtLogin);