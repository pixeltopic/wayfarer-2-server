const HttpStatus = require("http-status-codes");
const {
  google: { getDirections },
  savedDirections: { findSavedDirections, saveDirections }
} = require("../services");
const logger = require("../utils").logger(__filename);

exports.directions = async (req, res, next) => {
  try {
    const { origin, destination } = res.locals.body;

    logger.info("Fetching directions with search params:");
    logger.info(res.locals.body);

    const payload = await getDirections(res.locals.body);

    logger.info("Sending response");

    return res.status(HttpStatus.OK).send({
      directions: {
        routes: payload.getRoutes(),
        origin: payload.getStartAddress() || origin,
        destination: payload.getEndAddress() || destination
      }
    });
  } catch (err) {
    return next(err); // pass error to central error handler
  }
};

exports.directionsSave = async (req, res, next) => {
  const { routeName, directionSearchParams } = res.locals.body
  const userId = res.locals.sub; // because this is a protected endpoint

  logger.info(`Saving directions for route name: ${routeName}`);
  logger.info(directionSearchParams);

  try {
    const uuid = await saveDirections(userId, routeName, directionSearchParams);

    return res.status(HttpStatus.OK).send({
      id: uuid
    });
  } catch(err) {
    return next(err);
  }
}

exports.directionsFind = async (req, res, next) => {
  logger.info(`Finding saved directions with search params:`);
  logger.info(res.locals.body);
  try {
    const result = await findSavedDirections({ ...res.locals.body, userId: res.locals.sub });

    return res.status(HttpStatus.OK).send({
      savedDirections: result
    });

  } catch(err) {
    return next(err);
  }
}