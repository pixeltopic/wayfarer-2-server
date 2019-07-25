const incidentsController = require("../controllers/incidentsController");


module.exports = app => {

  app.post("/api/incidents", incidentsController.incidents);
}