const axios = require("axios");
const keys = require("../config/keys");
const { updateFullIncident, genFullSegObj } = require("../utils/incidentUtils");

// const tempIncidentData = require("../utils/tempIncidentData");

exports.fetchIncidents = async (req, res, next) => {
  
  if (!req.body.routes) {
    res.status(400).send({ error: "Directions data from Google Api required." });
    return;
  }
  const fetchedDirectionData = req.body.routes;

  console.log(genFullSegObj(fetchedDirectionData));

  const incidents = await updateFullIncident(fetchedDirectionData);

  res.send(incidents);

}