const incidentsController = require("../controllers/incidentsController");


module.exports = app => {

  app.post("/api/fetchincidents", incidentsController.fetchIncidents);
}