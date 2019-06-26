require("./services/passport");

const refreshToken = require("./middlewares/refreshToken");
const verifyToken = require("./middlewares/verifyToken");
const logger = require("./utils").logger(__filename);

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

  app.post("/api/refreshtoken", refreshToken, (req, res) => {
    logger.info(`Token refreshed. New token is: ${res.locals.refreshedToken}`);

    return res.status(200).send({ token: res.locals.refreshedToken });
  });
};
