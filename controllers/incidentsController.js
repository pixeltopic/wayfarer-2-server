const mapquest = require("../api/mapquest");
// const googleMaps = require("../api/googleMaps");
const keys = require("../config/keys");
const GeoPoint = require("../utils/geopoint");
const { updateFullIncident, genFullSegObj } = require("../utils/incidentsUtils");

// const tempIncidentData = require("../utils/tempIncidentData");

exports.fetchIncidents = async (req, res, next) => {
  
  if (!req.body.routes) {
    res.status(400).send({ error: "Directions data from Google Api required." });
    return;
  }
  const fetchedDirectionData = req.body.routes;

  const { start_location: { lat: startLat, lng: startLng }, end_location: { lat: endLat, lng: endLng } } = fetchedDirectionData[0].legs[0];

  if (startLat === endLat && startLng === endLng) {
    // Fetch places in a radius
    console.log("Fetching incidents in radius");
    fetchPlaceIncidents(req, res, next);
    return;
  }

  // console.log(genFullSegObj(fetchedDirectionData));

  const incidents = await updateFullIncident(fetchedDirectionData);

  res.send(incidents);

}

const fetchPlaceIncidents = async (req, res, next) => {
  // returns incidents around a single location.
  const fetchedDirectionData = req.body.routes;

  try {
    // const geocodedResponse = await googleMaps.get(`/geocode/json?address=${address}&key=${keys.googleKey}`);

    // console.log("Geocoded response:", geocodedResponse.data);

    // if (geocodedResponse.data && geocodedResponse.data.results.length === 0) {
    //   res.send({ places: { results: [], center: null }, refreshedToken: req.auth });
    //   return;
    // }
    // const { lat: geocodedLat, lng: geocodedLng } = geocodedResponse.data.results[0].geometry.location;
    const { start_location: { lat, lng } } = fetchedDirectionData[0].legs[0];

    const center = new GeoPoint(lat, lng);
    const boundingBox = center.boundingCoordinates(3); // look for all incidents within 3 miles

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

  }

}