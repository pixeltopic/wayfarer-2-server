const authController = require("../controllers/authController");
// const passportService = require("../services/passport");
const validateKey = require("../middlewares/validateKey");
const passport = require("passport");

const requireSignin = passport.authenticate("local", { session: false });  // deny session based cookies (is set by default)

module.exports = app => {

  app.post("/api/signin", validateKey, requireSignin, authController.signin);
  app.post("/api/signup", validateKey, authController.signup);
}