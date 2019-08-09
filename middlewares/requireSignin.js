const passport = require("passport");
const HttpStatus = require("http-status-codes");

const requireSignin = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false /* Denies session based cookies */ },
    (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send({ message: "User credentials invalid." });
      }
      res.locals.user = user;
      return next();
    }
  )(req, res, next);
};

module.exports = requireSignin;
