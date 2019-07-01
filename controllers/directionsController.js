const HttpStatus = require("http-status-codes");
const { googleDirectionsFetch } = require("../services/google/directionsFetch");
const logger = require("../utils").logger(__filename);

exports.directions = async (req, res, next) => { 
  try {
    const {
      destination,
    } = res.locals.body;

    logger.info("Fetching directions with search params:");
    logger.info(res.locals.body);

    const payload = await googleDirectionsFetch(res.locals.body);

    logger.info("Sending response");

    return res.status(HttpStatus.OK).send({
      directions: {
        routes: payload.getRoutes(),
        origin: payload.getStartAddress() || newOrigin,
        destination: payload.getEndAddress() || destination
      }
    });
  } catch (err) {
    return next(err); // pass error to central error handler
  }
};
