const { IncidentsProcessor, IncidentsCache } = require("../services/IncidentsProcessor");
const { google: { getDirections }, mapquest: { getIncidentsInRadius } } = require("../services");

const HttpStatus = require("http-status-codes");
const { ErrorWrapper, unitConversion: { convertUnitToMeters } } = require("../utils");
const logger = require("../utils").logger(__filename);


exports.incidents = async (req, res, next) => {
  try {
    const {
      directionSearchParams,
      extraParams: { 
        radius 
      }
    } = res.locals.body;

    const { units } = directionSearchParams;

    logger.info("Fetching directions with search params before finding incidents:");
    logger.info(res.locals.body);

    const payload = await getDirections(directionSearchParams);

    if (!payload.getRoute()) {
      throw ErrorWrapper("Directions not found.", "incidentsController", HttpStatus.BAD_REQUEST);
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

    // start and end coordinates are the same, so fetch incidents around this point.
    if (startLat === endLat && startLng === endLng) {
      const incidents = await getIncidentsInRadius(radius, units, payload.getRoute().legs[0].start_location)

      return res.status(HttpStatus.OK).send({ 0: incidents });
    }

    if (radius) {
      logger.info(`Finding Incidents with extra params: ${radius}\n`);
      
      const radiusInMeters = convertUnitToMeters(units, radius) // given unit type and radius, convert to meters

      logger.info("IncidentsProcessor starting with custom radius.");
      const incidents = await new IncidentsProcessor(
        payload.getRoutes(), 
        IncidentsCache, 
        logger
      ).retrieveIncidents(radiusInMeters);
      logger.info("IncidentsProcessor done.");

      return res.status(HttpStatus.OK).send(incidents);
    } else {
      logger.info("IncidentsProcessor starting.");
      const incidents = await new IncidentsProcessor(
        payload.getRoutes(), 
        IncidentsCache,
        logger
      ).retrieveIncidents();
      logger.info("IncidentsProcessor done.");

      return res.status(HttpStatus.OK).send(incidents);
    }
  } catch(err) {
    next(err);
  }

}