const { IncidentsProcessor, IncidentsCache } = require("../services/IncidentsProcessor");
const { googleDirectionsFetch } = require("../services/google/directionsFetch");
const { mapquestRadiusFetch } = require("../services/mapquest/incidentsRadiusFetch");
const HttpStatus = require("http-status-codes");
const ErrorWrapper = require("../utils/ErrorWrapper");
const logger = require("../utils").logger(__filename);
const { convertUnitToMeters } = require("../utils").unitConversion;

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

    const payload = await googleDirectionsFetch(directionSearchParams);

    if (!payload.getRoute()) {
      throw new ErrorWrapper("Directions not found.", "incidentsController", HttpStatus.BAD_REQUEST);
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
      const incidents = await mapquestRadiusFetch(radius, units, payload.getRoute().legs[0].start_location)

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