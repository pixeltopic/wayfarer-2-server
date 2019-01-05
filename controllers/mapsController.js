const axios = require("axios");
const keys = require("../config/keys");

const GOOGLE_ROOT_URL = "https://maps.googleapis.com/maps/api/directions/";
const MAPQUEST_ROOT_URL = "http://www.mapquestapi.com/traffic/v2/incidents";
const GOOGLE_PLACES_ROOT_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const GOOGLE_PLACE_DETAILS_ROOT_URL = "https://maps.googleapis.com/maps/api/place/details/json";
const GOOGLE_PLACE_PHOTOS_ROOT_URL = "https://maps.googleapis.com/maps/api/place/photo";

exports.fetchDirections = async (req, res, next) => {
  const { altRoutes, avoidFerries, avoidHighways, avoidIndoor, avoidTolls, destination, mode, origin, units } = req.body;

  let BUILDURL = `${GOOGLE_ROOT_URL}json?origin=${origin}&destination=${destination}
    &mode=${mode}&alternatives=${altRoutes}&units=${units}`;

    let avoidArr = [];
    if (avoidTolls) avoidArr.push("tolls"); 
    if (avoidHighways) avoidArr.push("highways");
    if (avoidFerries) avoidArr.push("ferries");
    if (avoidIndoor) avoidArr.push("indoor");
    const avoidStr = avoidArr.join("|");

    if (avoidStr !== "") BUILDURL += `&avoid=${avoidStr}`; 

    try {
      const response = await axios.get(BUILDURL + `&key=${keys.googleKey}`);
      res.send({ directions: response.data, refreshedToken: req.auth });
    } catch(e) {
      console.log("Error in fetchDirections:", e);
      res.status(400).send({ error: "Lookup failed." });
    }
    

    
}