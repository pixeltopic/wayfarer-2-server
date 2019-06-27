const authController = require("../controllers/authController");
const verifyRecaptcha = require("../middlewares/verifyRecaptcha");
// const passportService = require("../services/passport");

const passport = require("passport");

const requireSignin = passport.authenticate("local", { session: false });  // deny session based cookies (is set by default)

module.exports = app => {

  app.post("/api/signin", verifyRecaptcha, requireSignin, authController.signin);
  app.post("/api/signup", verifyRecaptcha, authController.signup);
}