const placesController = require("../controllers/placesController");
const refreshToken = require("../middlewares/refreshToken");
const validateKey = require("../middlewares/validateKey");

module.exports = app => {
  app.post("/api/fetchplaces", validateKey, refreshToken, placesController.fetchPlaces);
  app.post("/api/fetchplacedetails", validateKey, refreshToken, placesController.fetchPlaceDetails);
}