const verifyToken = require("./middlewares/verifyToken");

module.exports = app => {
  require("./routes/userRoutes")(app);
  require("./routes/directionsRoutes")(app);
  require("./routes/incidentsRoutes")(app);
  require("./routes/placesRoutes")(app);
  require("./routes/queryRoutes")(app);

  app.get("/", (req, res) => {
    res.send("Wayfarer 2 api");
  });

  app.get("/api/checkauth", verifyToken, (req, res) => {
    // development route to check if user's token is still valid.
    res.send({ message: "success", id: res.locals.sub });
  });
};
