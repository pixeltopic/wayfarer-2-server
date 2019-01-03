const authController = require("../controllers/authController");
// const passportService = require("../services/passport");
const passport = require("passport");

const requireSignin = passport.authenticate("local", { session: false });  // deny session based cookies (is set by default)

module.exports = app => {

  app.post("/api/signin", requireSignin, authController.signin);
  app.post("/api/signup", authController.signup);
}