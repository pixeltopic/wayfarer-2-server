const mapwrap = require("../api/mapwrap");
const ErrorWrapper = require("../utils/ErrorWrapper");
const logger = require("../utils/logger")(__filename);

exports.fetchDirections = async (req, res, next) => {
  const {
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
          "directionsController",
          400
        );
    } else {
      newOrigin = origin;
    }

    logger.info("Fetching directions from Google Directions");
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

    logger.info("Sending response");

    return res.send({
      directions: {
        routes: payload.getRoutes(),
        origin: payload.getStartAddress() || newOrigin,
        destination: payload.getEndAddress() || destination
      },
      refreshedToken: req.auth
    });
  } catch (err) {
    return next(err); // pass error to central error handler
  }
};
