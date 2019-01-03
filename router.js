require("./services/passport");

const validateKey = require("./middlewares/validateKey");

module.exports = app => {

  require("./routes/authRoutes")(app);

  app.get("/", (req, res, next) => {
    res.send("Wayfarer 2 api");
  });

  app.post("/api/checkheaders", validateKey, (req,res,next) => {
    res.send({ requiredHeaders: "success", middlewareStat: req.middlewareStatus });
  })
}