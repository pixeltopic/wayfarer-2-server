const incidentsController = require("../controllers/incidentsController");
const refreshToken = require("../middlewares/refreshToken");


module.exports = app => {

  app.post("/api/fetchincidents", refreshToken, incidentsController.fetchIncidents);
}