const axios = require("axios");

module.exports = axios.create({
  baseURL: "http://www.mapquestapi.com/traffic/v2/incidents"
})