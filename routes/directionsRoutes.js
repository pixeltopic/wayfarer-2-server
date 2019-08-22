const { verifyToken } = require("../middlewares");
const directionsController = require("../controllers/directionsController");

module.exports = app => {
  app.post("/api/directions", directionsController.directions);
  app.post("/api/directions/save", verifyToken, directionsController.directionsSave);
  app.post("/api/directions/edit", verifyToken, (req, res, next) => {});
  app.post("/api/directions/find", verifyToken, directionsController.directionsFind);
  app.post("/api/directions/delete", verifyToken, (req, res, next) => {
    // the item to delete MUST match user uuid
  });
};
