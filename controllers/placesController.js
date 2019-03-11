const googleMaps = require("../api/googleMaps");
const keys = require("../config/keys");

exports.fetchPlaces = async (req, res, next) => {

  const { keyword, type, radius, minprice, maxprice, units, address } = req.body;

  if (req.body.next_page_token) {
    // Page token to fetch additional results.
    const placesParams = {
      params: {
        pagetoken: req.body.next_page_token,
        key: keys.googleKey
      }
    }
    try {
      const placesResponse = await googleMaps.get(`/place/nearbysearch/json`, placesParams);

      res.send({ places: { ...placesResponse.data }, refreshedToken: req.auth });
      return;

    } catch(e) {
      console.log(e);
      res.status(400).send({ error: "Lookup failed." });
      next();
      return;
    }
  }

  if (!address && !req.body.currentLocation) {
    res.status(400).send({ error: "Missing required attributes for search. Try to refresh." });
    next();
    return;
  }

  let currentLocation = null;
  if (req.body.currentLocation) { 
    // optional prop in post request. Used if the user wants to use their current location using browser geolocation
    // if specified, takes priority over address prop.
    console.log("Using current location for places");
    currentLocation = req.body.currentLocation;
  }

  try {
    const placesParams = {
      params: {
        location: "",
        radius: units === "imperial" ? parseFloat(radius) * 1609 : parseFloat(radius) * 1000, // calculates radius in meters
        keyword,
        ...type && { type },
        ...minprice !== -1 && { minprice },
        ...maxprice !== -1 && { maxprice },
        key: keys.googleKey
      }
    };

    if (!currentLocation) {
      const geocodedResponse = await googleMaps.get(`/geocode/json?address=${address.replace(/#/g, '')}&key=${keys.googleKey}`);

      console.log("Geocoded response:", geocodedResponse.data);

      if (geocodedResponse.data && geocodedResponse.data.results.length === 0) {
        res.send({ places: { results: [], center: null }, refreshedToken: req.auth });
        return;
      }
      
      const { lat, lng } = geocodedResponse.data.results[0].geometry.location; // most relevant search result will be used
      const { formatted_address } = geocodedResponse.data.results[0];

      placesParams.params.location = `${lat},${lng}`;

      const placesResponse = await googleMaps.get(`/place/nearbysearch/json`, placesParams);

      res.send({ 
        places: { 
          ...placesResponse.data, 
          center: geocodedResponse.data.results[0].geometry.location,
          address: formatted_address
        }, 
        refreshedToken: req.auth 
      });

      return;
    } else {
      const { lat, lng } = currentLocation;
      placesParams.params.location = `${lat},${lng}`;

      const placesResponse = await googleMaps.get(`/place/nearbysearch/json`, placesParams);
      const revGeoRes = await googleMaps.get(`/geocode/json?latlng=${lat},${lng}&key=${keys.googleKey}`);
      const { formatted_address } = revGeoRes.data.results[0];

      res.send({ 
        places: { 
          ...placesResponse.data, 
          center: currentLocation,
          address: formatted_address
        }, 
        refreshedToken: req.auth 
      });

      return;
    }
  } catch(e) {
    console.log(e);
    res.status(400).send({ error: "Lookup failed." });
    next();
    return;
  }
}

exports.fetchPlaceDetails = async (req, res, next) => {
  const { place_id } = req.body;

  try {
    const response = await googleMaps.get(`/place/details/json?placeid=${place_id}&key=${keys.googleKey}`);

    res.send({ placeDetails: { result: response.data.result, place_id }, refreshedToken: req.auth });

  } catch(e) {
    console.log(e);
    res.status(400).send({ error: "Lookup failed." });
    next();
  }

}