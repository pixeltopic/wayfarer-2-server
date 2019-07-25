const mapsController = require("../controllers/directionsController");

module.exports = app => {
  app.post("/api/directions", mapsController.directions);
};
