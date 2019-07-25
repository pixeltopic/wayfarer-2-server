const placesController = require("../controllers/placesController");

module.exports = app => {
  app.post("/api/places", placesController.places);
  app.post("/api/places/details", placesController.placeDetails);
  app.post("/api/places/token", placesController.placesWithToken);
}