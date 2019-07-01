const mapwrap = require("../../api/mapwrap");
const ErrorWrapper = require("../../utils/ErrorWrapper");
const logger = require("../../utils").logger(__filename);
const HttpStatus = require("http-status-codes");

exports.googleDirectionsFetch = async searchParams => {
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
    currentLocation // { lat: Number, lng: Number} object. May or may not be present. If present, always prioritized over origin.
  } = searchParams;

  let newOrigin;
  if (currentLocation) {
    const { lat, lng } = currentLocation;
    logger.info(`Using current location. Reverse geocoding {${lat}, ${lng}}`);

    const revGeoRes = await mapwrap.reverseGeocode(lat, lng);
    newOrigin = revGeoRes.getTopAddress(true);
    if (!newOrigin)
      throw new ErrorWrapper(
        "No address maps to current location",
        "directionsFetch service",
        HttpStatus.BAD_REQUEST
      );
  } else {
    newOrigin = origin;
  }

  logger.info("Fetching directions from Google Directions");
  return await mapwrap.directions({
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
};
