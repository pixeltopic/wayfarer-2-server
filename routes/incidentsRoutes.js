const incidentsController = require("../controllers/incidentsController");
const refreshToken = require("../middlewares/refreshToken");
const validateKey = require("../middlewares/validateKey");

module.exports = app => {

  app.post("/api/fetchincidents", validateKey, refreshToken, incidentsController.fetchIncidents);
}