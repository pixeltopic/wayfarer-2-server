const mapquest = require("../api/mapquest");
const keys = require("../config/keys");
const GeoPoint = require("../utils/geopoint");
// const { updateFullIncident } = require("../utils/incidentsUtils");
const { IncidentsProcessor, IncidentsCache } = require("../utils/IncidentsProcessor");
const mapwrap = require("../api/mapwrap");
const ErrorWrapper = require("../utils/ErrorWrapper");
const logger = require("../utils/logger")(__filename);

exports.fetchIncidents = async (req, res, next) => {
  // return res.status(200).send({ debug: "reached fetchIncidents controller successfully." });
  
  const {
    directionSearchParams: {
      altRoutes,
      avoidFerries,
      avoidHighways,
      avoidIndoor,
      avoidTolls,
      destination,
      mode,
      origin,
      units,
      currentLocation // lat lng pair. may or may not be present
    },
    extraParams: { 
      radius 
    }
  } = res.locals.body;
  // useCurrentLocation, if true, will prioritize currentLocation over inputted origin.
  logger.info(res.locals.body);

  try {
    logger.info("Fetching directions");

    let newOrigin;
    if (currentLocation) {
      const { lat, lng } = currentLocation;
      logger.info(`Using current location. Reverse geocoding {${lat}, ${lng}}`);
      
      const revGeoRes = await mapwrap.reverseGeocode(lat, lng);
      newOrigin = revGeoRes.getTopAddress(true);
      if (!newOrigin)
        throw new ErrorWrapper(
          "No address maps to current location",
          "incidentsController",
          400
        );
    } else {
      newOrigin = origin;
    }

    logger.info("Fetching directions from Google Directions in incidents endpoint");
    const payload = await mapwrap.directions({
      origin: newOrigin,
      destination,
      mode,
      altRoutes,
      units,
      avoidFerries,
      avoidTolls,
      avoidHighways,
      avoidIndoor
    });

    if (!payload.getRoute()) {
      throw new ErrorWrapper("Directions not found.", "incidentsController", 400);
    }
    const { 
      start_location: { 
        lat: startLat, 
        lng: startLng 
      }, 
      end_location: { 
        lat: endLat, 
        lng: endLng } 
      } = payload.getRoute().legs[0];

    if (startLat === endLat && startLng === endLng) {
      // Fetch places in a radius
      logger.info("Fetching incidents in radius");
      fetchPlaceIncidents(req, res, next, payload);
      return;
    }

    if (radius) {
      logger.info(`Finding Incidents with extra params: ${radius}\n`);
      
      const radiusInMeters = units === "imperial" ? parseFloat(radius) * 1609 : parseFloat(radius) * 1000; // calculates radius in meters

      logger.info("IncidentsProcessor starting with custom radius.");
      const incidents = await new IncidentsProcessor(payload.getRoutes(), IncidentsCache).retrieveIncidents(radiusInMeters);
      logger.info("IncidentsProcessor done.");

      return res.send(incidents);
    } else {
      logger.info("IncidentsProcessor starting.");
      const incidents = await new IncidentsProcessor(payload.getRoutes(), IncidentsCache).retrieveIncidents();
      logger.info("IncidentsProcessor done.");

      return res.send(incidents);
    }
  } catch(err) {
    next(err);
  }

}

const fetchPlaceIncidents = async (req, res, next, payload) => {
  // returns incidents around a single location.
  const { extraParams: { radius }, directionSearchParams: { units } } = res.locals.body;

  try {
    const { start_location: { lat, lng } } = payload.getRoute().legs[0];

    const center = new GeoPoint(lat, lng);

    let distFromCenter = 3; // in miles.
    if (radius) {
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

  } catch(err) {
    return next(err);
  }

}