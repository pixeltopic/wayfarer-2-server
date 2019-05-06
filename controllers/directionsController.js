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
  } = req.body;
  // useCurrentLocation, if true, will prioritize currentLocation over inputted origin.
  logger.info(req.body);

  try {
    logger.info("Fetching directions");
    if (
      altRoutes === undefined || !destination || !mode || (!origin && !currentLocation) || !units
    ) {
      logger.error("Missing required attributes for directions search.");
      throw new ErrorWrapper(
        "Missing required attributes for search. Try to refresh.",
        "directionsController",
        400
      );
    }

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
