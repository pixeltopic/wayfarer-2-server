const queryController = require("../controllers/queryController");

module.exports = app => {
  app.post("/api/query", queryController.processQuery);
}