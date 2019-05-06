const placesController = require("../controllers/placesController");
const refreshToken = require("../middlewares/refreshToken");

module.exports = app => {
  app.post("/api/fetchplaces", refreshToken, placesController.fetchPlaces);
  app.post("/api/fetchplacedetails", refreshToken, placesController.fetchPlaceDetails);
}