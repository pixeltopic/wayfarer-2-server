const placesController = require("../controllers/placesController");

module.exports = app => {
  app.post("/api/fetchplaces", placesController.fetchPlaces);
  app.post("/api/fetchplacedetails", placesController.fetchPlaceDetails);
  app.post("/api/fetchplaces/token", placesController.fetchPlacesWithToken);
}