const mapsController = require("../controllers/directionsController");
const refreshToken = require("../middlewares/refreshToken");

module.exports = app => {

  app.post("/api/fetchdirections", refreshToken, mapsController.fetchDirections);
}