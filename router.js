require("./services/passport");

const validateKey = require("./middlewares/validateKey");
const refreshToken = require("./middlewares/refreshToken");
const verifyToken = require("./middlewares/verifyToken");

module.exports = app => {
  require("./routes/authRoutes")(app);
  require("./routes/directionsRoutes")(app);
  require("./routes/incidentsRoutes")(app);
  require("./routes/placesRoutes")(app);
  require("./routes/queryRoutes")(app);

  app.get("/", (req, res, next) => {
    res.send("Wayfarer 2 api");
  });

  app.get("/api/checkauth", verifyToken, (req, res) => {
    // development route to check if user's token is still valid.
    res.send({ message: "success" });
  });

  app.post(
    "/api/refreshandverify",
    validateKey,
    refreshToken,
    verifyToken,
    (req, res, next) => {
      // development route for attempting to refresh and verifying a token. Simulates a protected route.
      res.send({ message: "success", refreshedToken: res.locals.auth });
    }
  );

  app.post("/api/refreshtoken", validateKey, refreshToken, (req, res) => {
    // route only refreshes token.
    // refreshedToken undefined: still valid
    // "": invalid forever
    // "non empty string": new refreshed token
    
    if (res.locals.noAuth) {
      return res.status(403).send({ message: "User is not authenticated." });
    } else if (res.locals.auth === "") {
      return res.send({
        message: "Provided token cannot be refreshed",
        refreshedToken: res.locals.auth
      });
    } else if (res.locals.auth === undefined) {
      return res.send({ message: "Provided token has not expired" });
    } else {
      return res.send({
        message: "Token refreshed",
        refreshedToken: res.locals.auth
      });
    }
  });
};
