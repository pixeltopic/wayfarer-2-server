const { signin, signup, refreshToken } = require("../controllers/authController");
const verifyRecaptcha = require("../middlewares/verifyRecaptcha");
const passportSignin = require("../middlewares/signin");

module.exports = app => {
  app.post("/api/signin", verifyRecaptcha, passportSignin, signin);
  app.post("/api/signup", verifyRecaptcha, signup);
  app.post("/api/refreshtoken", refreshToken);
}