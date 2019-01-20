const googleMaps = require("../api/googleMaps");
const keys = require("../config/keys");

exports.fetchPlaces = async (req, res, next) => {

  const { keyword, type, radius, minprice, maxprice, units, address }= req.body;

  try {
    const geocodedResponse = await googleMaps.get(`/geocode/json?address=${address}&key=${keys.googleKey}`);

    console.log("Geocoded response:", geocodedResponse.data);

    if (geocodedResponse.data && geocodedResponse.data.results.length === 0) {
      res.send({ places: { results: [], center: null }, refreshedToken: req.auth });
      return;
    }
    
    const radiusInMeters = units === "imperial" ? parseFloat(radius) * 1609 : parseFloat(radius) * 1000;
    
    const { lat, lng } = geocodedResponse.data.results[0].geometry.location; // most relevant search result will be used

    const placesParams = {
      params: {
        location: `${lat},${lng}`,
        radius: radiusInMeters,
        keyword,
        ...type && { type },
        ...minprice !== -1 && { minprice },
        ...maxprice !== -1 && { maxprice },
        key: keys.googleKey
      }
    }

    const placesResponse = await googleMaps.get(`/place/nearbysearch/json`, placesParams);

    res.send({ places: { ...placesResponse.data, center: geocodedResponse.data.results[0].geometry.location }, refreshedToken: req.auth });

  } catch(e) {
    console.log(e);
    res.status(400).send({ error: "Lookup failed." });
  }
}