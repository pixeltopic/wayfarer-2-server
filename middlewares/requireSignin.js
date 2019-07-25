const passport = require("passport");

const requireSignin = passport.authenticate("local", { session: false });  // deny session based cookies (is set by default)

module.exports = requireSignin;