require("./services/passport");

const validateKey = require("./middlewares/validateKey");
const refreshToken = require("./middlewares/refreshToken");
const verifyToken = require("./middlewares/verifyToken");

module.exports = app => {

  require("./routes/authRoutes")(app);
  require("./routes/mapsRoutes")(app);
  require("./routes/incidentsRoutes")(app);

  app.get("/", (req, res, next) => {
    res.send("Wayfarer 2 api");
  });

  app.get("/api/checkauth", verifyToken, (req, res) => {
    // development route to check if user's token is still valid.
    res.send({ authorization: "success" });
  });

  app.post("/api/refreshandverify", validateKey, refreshToken, verifyToken, (req,res,next) => {
    // development route for attempting to refresh and verifying a token. Simulates a protected route.
    res.send({ authorization: "success", refreshedToken: req.auth });
  });

  app.post("/api/refreshtoken", validateKey, refreshToken, (req, res) => {
    // route only refreshes token.
    // refreshedToken undefined: still valid
    // "": invalid forever
    // "non empty string": new refreshed token
    if (req.noAuth) {
      res.status(403).send({ error: "User is not authenticated." });
    } else if (req.auth === "") {
      res.send({ message: "Provided token cannot be refreshed", refreshedToken: req.auth });
    } else if (!req.auth) {
      res.send({ message: "Provided token has not expired" });
    } else {
      res.send({ message: "Token refreshed", refreshedToken: req.auth });
    }
  });
}