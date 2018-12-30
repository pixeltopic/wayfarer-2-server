const Authentication = require("./controllers/authentication");

module.exports = app => {
  app.get("/", (req, res, next) => {
    res.send(["irvine", "anaheim"]);
  });

  app.post("/api/signup", Authentication.signup);
}