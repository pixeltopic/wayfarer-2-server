const mapwrap = require("../../api/mapwrap");
const logger = require("../../utils").logger(__filename);
const {
  unitConversion: { convertUnitToMeters }
} = require("../../utils");

/**
 * Given a token, retrieve place results from Google.
 * @param {string} nextPageToken - token for paginating nearby search results from Google Places
 * @returns {Promise<{ results: Array, nextPageToken: string }>} - an object containing the place results and a page token (empty if there is none left)
 *
 */
const googlePlacesToken = async nextPageToken => {
  logger.info("Retrieving more place results with Google Places API");
  const placesResponse = await mapwrap.additionalPlaces(nextPageToken);

  return {
    results: placesResponse.getResults(),
    nextPageToken: placesResponse.getNextPageToken() || ""
  };
};

/**
 * Retrieves the details of a Google Place given ID.
 * @param {string} placeId - ID identifying a place from Google Places
 * @returns {Promise<object>} an object containing the result and place id.
 */
const googlePlaceDetails = async placeId => {
  const placeDetailsResponse = await mapwrap.placeDetails(placeId);

  return placeDetailsResponse.result;
};

/**
 * Based on search parameters, return an object containing metadata and search results from the Google Nearby Places API.
 * schemaValidator middleware should be verifying the object schema before entering this function.
 *
 * @param {object} searchParams - object containing search parameters.
 * @param {string} searchParams.keyword - "Some search query describing the location name to look for"
 * @param {string} searchParams.address - "Starting address to use as the center for nearby search. Either this or currentLocation will be present."
 * @param {number} searchParams.radius - A value that is either in kilometers or miles. Will be converted to meters.
 * @param {"imperial"|"metric"} searchParams.units - Unit type to describe the radius
 * @param {string} [searchParams.type] - Location type defined by Google Places API. See https://developers.google.com/places/web-service/supported_types for valid types.
 * @param {number} [searchParams.minprice] - Number from -1 to 4 specifying the min price range of locations found. Must be less than maxprice. If -1, disabled.
 * @param {number} [searchParams.maxprice] - Number from -1 to 4 specifying the max price range of locations found.
 * @param {object} searchParams.currentLocation - Starting center location coordinates. May or may not be present. If present, always prioritized over address.
 * @param {number} searchParams.currentLocation.lat - longitude of a location to use as the center.
 * @param {number} searchParams.currentLocation.lng - latitude of a location to use as the center.
 * @returns {Promise<{ results: Array, nextPageToken: string, center: { lat: number, lng: number }, address: string }>}
 */
const googleNearbyPlacesFetch = async searchParams => {
  const {
    keyword,
    type,
    radius,
    minprice,
    maxprice,
    units,
    address,
    currentLocation // { lat: Number, lng: Number} object. May or may not be present. If present, always prioritized over address.
  } = searchParams;

  logger.info("Fetching nearby places with these search params:");
  logger.info(searchParams);

  const placesParams = {
    location: null,
    radius: convertUnitToMeters(units, radius),
    keyword,
    ...(type && { type }),
    ...(minprice !== -1 && { minprice }),
    ...(maxprice !== -1 && { maxprice })
  };

  if (currentLocation) {
    logger.info("Using current location as the center.");
    placesParams.location = currentLocation;

    const placesResponse = await mapwrap.nearbySearchPlaces(placesParams);
    const revGeoRes = await mapwrap.reverseGeocode(
      currentLocation.lat,
      currentLocation.lng
    );

    return {
      results: placesResponse.getResults(),
      nextPageToken: placesResponse.getNextPageToken() || "",
      center: currentLocation,
      address: revGeoRes.getTopAddress(true)
    };
  } else {
    logger.info("Using user input as the center.");
    const geocodedResponse = await mapwrap.geocode(address.replace(/#/g, ""));

    // logger.info("Geocoded response:");
    // logger.info(geocodedResponse.getAllAddresses());

    if (geocodedResponse.getAllAddresses().length === 0) {
      return {
        results: [], // check how front end handles invalid geocode address
        nextPageToken: "",
        center: null,
        address
      };
    }

    logger.info("Getting top address");
    placesParams.location = geocodedResponse.getTopAddress();
    logger.info("Getting formatted top address:");
    const formattedAddress = geocodedResponse.getTopAddress(true);

    logger.info("Searching nearby places with these parameters:");
    logger.info(placesParams);
    const placesResponse = await mapwrap.nearbySearchPlaces(placesParams);

    return {
      results: placesResponse.getResults(),
      nextPageToken: placesResponse.getNextPageToken() || "",
      center: geocodedResponse.getTopAddress(),
      address: formattedAddress
    };
  }
};

module.exports = {
  googlePlacesToken,
  googlePlaceDetails,
  googleNearbyPlacesFetch
};
