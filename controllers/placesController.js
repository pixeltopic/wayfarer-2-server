// const googleMaps = require("../api/googleMaps");
// const keys = require("../config/keys");
const mapwrap = require("../api/mapwrap");
const logger = require("../utils").logger(__filename);
const { convertUnitToMeters } = require("../utils").unitConversion;

const fetchPlacesWithToken = async (req, res, next) => {
  logger.info("Fetching next page of nearby places with token.");

  const { next_page_token } = res.locals.body;

  try {
    // const placesResponse = await googleMaps.get(`/place/nearbysearch/json`, placesParams);
    const placesResponse = await mapwrap.additionalPlaces(next_page_token);

    return res.send({ 
      places: { 
        results: placesResponse.getResults(), 
        next_page_token: placesResponse.getNextPageToken() 
      }, 
      refreshedToken: req.auth
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
    next_page_token
  } = res.locals.body;

  if (next_page_token) {
    return fetchPlacesWithToken(req, res, next);
  }

  // if (!address && !req.body.currentLocation) {
  //   res.status(400).send({ error: "Missing required attributes for search. Try to refresh." });
  //   next();
  //   return;
  // }

  // let currentLocation = null;
  if (currentLocation) { 
  //   // optional prop in post request. Used if the user wants to use their current location using browser geolocation
  //   // if specified, takes priority over address prop.
    logger.info("Using current location for places");
  //   currentLocation = bodyCurrentLocation;
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
      // const geocodedResponse = await googleMaps.get(`/geocode/json?address=${address.replace(/#/g, '')}&key=${keys.googleKey}`);
      const geocodedResponse = await mapwrap.geocode(address.replace(/#/g, ''));

      logger.info("Geocoded response:");
      logger.info(geocodedResponse.getAllAddresses());

      if (geocodedResponse.getAllAddresses().length === 0) {
        return res.send({ 
          places: { 
            results: [], // check how front end handles invalid geocode address
            center: null,
            address 
          }, 
          refreshedToken: req.auth
        });
      }

      // if (geocodedResponse.data && geocodedResponse.data.results.length === 0) {
      //   res.send({ places: { results: [], center: null }, refreshedToken: req.auth });
      //   return;
      // }
      
      // const { lat, lng } = geocodedResponse.data.results[0].geometry.location; // most relevant search result will be used
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
          next_page_token: placesResponse.getNextPageToken() || null,
          center: geocodedResponse.getTopAddress(),
          address: formattedAddress
        }, 
        refreshedToken: req.auth 
      });
    } else {
      // const { lat, lng } = currentLocation;
      placesParams.location = currentLocation;

      // const placesResponse = await googleMaps.get(`/place/nearbysearch/json`, placesParams);
      const placesResponse = await mapwrap.nearbySearchPlaces(placesParams);
      // const revGeoRes = await googleMaps.get(`/geocode/json?latlng=${lat},${lng}&key=${keys.googleKey}`);
      const revGeoRes = await mapwrap.reverseGeocode(lat, lng);
      // const { formatted_address } = revGeoRes.data.results[0];

      res.send({ 
        places: { 
          results: placesResponse.getResults(),
          next_page_token: placesResponse.getNextPageToken() || null,
          center: currentLocation,
          address: revGeoRes.getTopAddress(true)
        }, 
        refreshedToken: req.auth 
      });

      return;
    }
  } catch(err) {
    // res.status(400).send({ error: "Lookup failed." });
    return next(err);
  }
}

exports.fetchPlaceDetails = async (req, res, next) => {
  const { place_id } = res.locals.body;

  try {
    // const response = await googleMaps.get(`/place/details/json?placeid=${place_id}&key=${keys.googleKey}`);
    const placeDetailsResponse = await mapwrap.placeDetails(place_id);

    res.send({ 
      placeDetails: { 
        result: placeDetailsResponse.result, 
        place_id 
      }, 
      refreshedToken: req.auth 
    });

  } catch(err) {
    // console.log(e);
    // res.status(400).send({ error: "Lookup failed." });
    return next(err);
  }

}