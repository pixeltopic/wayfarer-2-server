require("./services/passport");

module.exports = app => {

  require("./routes/authRoutes")(app);

  app.get("/", (req, res, next) => {
    res.send(["irvine", "anaheim"]);
  });

  
}