const mapwrap = require("../../api/mapwrap");
const ErrorWrapper = require("../../utils/ErrorWrapper");
const logger = require("../../utils").logger(__filename);
const HttpStatus = require("http-status-codes");

/**
 * Fetches directions from google maps api.
 * https://developers.google.com/maps/documentation/directions/start
 * schemaValidator middleware should be verifying the object schema before entering this function.
 * 
 * @param {object} searchParams - object containing search parameters.
 * @param {boolean} searchParams.altRoutes - if true, finds alternative routes and its directions.
 * @param {boolean} searchParams.avoidFerries - if true, will attempt to avoid ferries.
 * @param {boolean} searchParams.avoidHighways - if true, will attempt to avoid highways.
 * @param {boolean} searchParams.avoidIndoor - if true, will attempt to find a route that avoids walking indoors. May only be used if walking.
 * @param {boolean} searchParams.avoidTolls - if true, will attempt to find a route that avoids toll roads.
 * @param {string} searchParams.destination - Destination address.
 * @param {string} searchParams.origin - Origin address. May or may not be present. Lower priority than `currentLocation`, but at least one of these (or both) must be specified.
 * @param {string} searchParams.mode - May be "driving", "bicycling", "transit", or "walking"
 * @param {string} searchParams.units - May be "imperial" or "metric".
 * @param {object} searchParams.currentLocation - Origin address coordinates. May or may not be present. If present, always prioritized over origin.
 * @param {number} searchParams.currentLocation.lat - longitude of a location to use as the origin.
 * @param {number} searchParams.currentLocation.lng - latitude of a location to use as the origin.
 */
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
      throw ErrorWrapper(
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
