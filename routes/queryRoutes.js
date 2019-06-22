const queryController = require("../controllers/queryController");
const refreshToken = require("../middlewares/refreshToken");

module.exports = app => {
  app.post("/api/query", queryController.processQuery);
}