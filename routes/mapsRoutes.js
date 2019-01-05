const mapsController = require("../controllers/mapsController");
const refreshToken = require("../middlewares/refreshToken");
const validateKey = require("../middlewares/validateKey");

module.exports = app => {

  app.post("/api/fetchdirections", validateKey, refreshToken, mapsController.fetchDirections);
}