const mapquest = require("../api/mapquest");
const keys = require("../config/keys");
const GeoPoint = require("../utils/geopoint");
const { updateFullIncident } = require("../utils/incidentsUtils");

exports.fetchIncidents = async (req, res, next) => {
  
  if (!req.body.routes) {
    res.status(400).send({ error: "Directions data from Google Api required." });
    return;
  }
  const { routes: fetchedDirectionData, extraParams } = req.body;

  const { start_location: { lat: startLat, lng: startLng }, end_location: { lat: endLat, lng: endLng } } = fetchedDirectionData[0].legs[0];

  if (startLat === endLat && startLng === endLng) {
    // Fetch places in a radius
    console.log("Fetching incidents in radius");
    fetchPlaceIncidents(req, res, next);
    return;
  }

  if (extraParams.radius && extraParams.units) {
    console.log("\nFinding Incidents with extra params:", extraParams, "\n");
    const { radius, units } = extraParams;
    const radiusInMeters = units === "imperial" ? parseFloat(radius) * 1609 : parseFloat(radius) * 1000; // calculates radius in meters

    const incidents = await updateFullIncident(fetchedDirectionData, radiusInMeters);

    res.send(incidents);
    return;
  } else {
    const incidents = await updateFullIncident(fetchedDirectionData);

    res.send(incidents);
    return;
  }

}

const fetchPlaceIncidents = async (req, res, next) => {
  // returns incidents around a single location.
  const { routes: fetchedDirectionData, extraParams } = req.body;

  try {
    const { start_location: { lat, lng } } = fetchedDirectionData[0].legs[0];

    const center = new GeoPoint(lat, lng);

    let distFromCenter = 3; // in miles.
    if (extraParams.radius && extraParams.units) {
      const { radius, units } = extraParams;
      if (units === "imperial")
        distFromCenter = parseFloat(radius);
      else
        distFromCenter = parseFloat(radius) * 0.621;
    }

    const boundingBox = center.boundingCoordinates(distFromCenter); // look for all incidents within x miles

    const mapquestParams = { 
      params: {
        key: keys.mapquestKey,
        boundingBox: `${boundingBox[0].latitude()},${boundingBox[0].longitude()},${boundingBox[1].latitude()},${boundingBox[1].longitude()}`,
        filters: `construction,incidents,event,congestion`
      } 
    }

    const response = await mapquest.get("", mapquestParams);

    res.send({ 0: response.data.incidents });
    return;

  } catch(e) {
    console.log(e)
    next();
    return;
  }

}