// const googleMaps = require("../api/googleMaps");
// const keys = require("../config/keys");
const mapwrap = require("../api/mapwrap");
const logger = require("../utils").logger(__filename);
const { convertUnitToMeters } = require("../utils").unitConversion;

exports.fetchPlacesWithToken = async (req, res, next) => {
  logger.info("Fetching next page of nearby places with token.");

  const { nextPageToken } = res.locals.body;

  try {
    const placesResponse = await mapwrap.additionalPlaces(nextPageToken);

    return res.send({ 
      places: { 
        results: placesResponse.getResults(), 
        nextPageToken: placesResponse.getNextPageToken() 
      }
    });
  } catch(err) {
    return next(err);
  }

}

exports.fetchPlaces = async (req, res, next) => {
  logger.info("Fetching nearby places");

  const { 
    keyword, 
    type, 
    radius, 
    minprice, 
    maxprice, 
    units, 
    address,
    currentLocation, // currentLocation and address may or may not be present. However, at least one will ALWAYS be present.
  } = res.locals.body;

  if (currentLocation) { 
  //   // optional prop in post request. Used if the user wants to use their current location using browser geolocation
  //   // if specified, takes priority over address prop.
    logger.info("Using current location for places");
  }

  try {
    const placesParams = {
      location: null,
      radius: convertUnitToMeters(units, radius),
      keyword,
      ...type && { type },
      ...minprice !== -1 && { minprice },
      ...maxprice !== -1 && { maxprice },
    };

    if (!currentLocation) {
      const geocodedResponse = await mapwrap.geocode(address.replace(/#/g, ''));

      logger.info("Geocoded response:");
      logger.info(geocodedResponse.getAllAddresses());

      if (geocodedResponse.getAllAddresses().length === 0) {
        return res.send({ 
          places: { 
            results: [], // check how front end handles invalid geocode address
            center: null,
            address 
          }
        });
      }

      logger.info("Getting top address");
      placesParams.location = geocodedResponse.getTopAddress();
      logger.info("Getting formatted top address:");
      const formattedAddress = geocodedResponse.getTopAddress(true);

      

      // const placesResponse = await googleMaps.get(`/place/nearbysearch/json`, placesParams);
      logger.info("Searching nearby places:");
      logger.info(placesParams);
      const placesResponse = await mapwrap.nearbySearchPlaces(placesParams);
      logger.info(placesResponse);

      return res.send({ 
        places: { 
          results: placesResponse.getResults(),
          nextPageToken: placesResponse.getNextPageToken() || null,
          center: geocodedResponse.getTopAddress(),
          address: formattedAddress
        }
      });
    } else {
      placesParams.location = currentLocation;

      const placesResponse = await mapwrap.nearbySearchPlaces(placesParams);
      const revGeoRes = await mapwrap.reverseGeocode(currentLocation.lat, currentLocation.lng);

      res.send({ 
        places: { 
          results: placesResponse.getResults(),
          nextPageToken: placesResponse.getNextPageToken() || null,
          center: currentLocation,
          address: revGeoRes.getTopAddress(true)
        }
      });

      return;
    }
  } catch(err) {
    return next(err);
  }
}

exports.fetchPlaceDetails = async (req, res, next) => {
  const { place_id } = res.locals.body;

  try {
    const placeDetailsResponse = await mapwrap.placeDetails(place_id);

    res.send({ 
      placeDetails: { 
        result: placeDetailsResponse.result, 
        place_id 
      }
    });

  } catch(err) {
    return next(err);
  }

}