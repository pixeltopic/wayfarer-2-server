require("./services/passport");

const validateKey = require("./middlewares/validateKey");
const refreshToken = require("./middlewares/refreshToken");
const verifyToken = require("./middlewares/verifyToken");

module.exports = app => {

  require("./routes/authRoutes")(app);

  app.get("/", (req, res, next) => {
    res.send("Wayfarer 2 api");
  });

  app.get("/api/checkauth", verifyToken, (req, res) => {
    // development route to check if user's token is still valid.
    res.send({ authorization: "success" });
  })

  app.post("/api/checkheaders", validateKey, refreshToken, verifyToken, (req,res,next) => {
    // development route for testing middlewares.
    res.send({ requiredHeaders: "success", auth: req.auth });
  })
}