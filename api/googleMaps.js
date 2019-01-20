const axios = require("axios");

module.exports = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api"
})