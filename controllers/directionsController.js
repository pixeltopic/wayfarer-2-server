const HttpStatus = require("http-status-codes");
const {
  google: { getDirections }
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
