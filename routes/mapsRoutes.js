const mapsController = require("../controllers/directionsController");
const refreshToken = require("../middlewares/refreshToken");
const validateKey = require("../middlewares/validateKey");

module.exports = app => {

  app.post("/api/fetchdirections", validateKey, refreshToken, mapsController.fetchDirections);
}