const authController = require("../controllers/authController");
// const passportService = require("../services/passport");
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false }); // deny session based cookies (is set by default)
const requireSignin = passport.authenticate("local", { session: false });

module.exports = app => {

  app.get("/api/checkauth", requireAuth, (req, res) => {
    res.send({ authorization: "success" });
  })

  app.post("/api/signin", requireSignin, authController.signin);
  app.post("/api/signup", authController.signup);
}