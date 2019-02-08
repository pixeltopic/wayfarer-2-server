const queryController = require("../controllers/queryController");
const refreshToken = require("../middlewares/refreshToken");
const validateKey = require("../middlewares/validateKey");


module.exports = app => {
  app.post("/api/query", validateKey, queryController.processQuery);
}