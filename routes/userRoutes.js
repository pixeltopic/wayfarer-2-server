const { signin, signup, refreshToken } = require("../controllers/userController");
const verifyRecaptcha = require("../middlewares/verifyRecaptcha");
const requireSignin = require("../middlewares/requireSignin");

module.exports = app => {
  app.post("/api/signin", verifyRecaptcha, requireSignin, signin);
  app.post("/api/signup", verifyRecaptcha, signup);
  app.post("/api/refreshtoken", refreshToken);
}