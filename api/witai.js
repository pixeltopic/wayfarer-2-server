const axios = require("axios");
const keys = require("../config");

module.exports = axios.create({
  baseURL: "https://api.wit.ai/message",
  headers: {
    Authorization: keys.witaiKey
  }
});