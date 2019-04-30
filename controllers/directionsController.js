const keys = require("../config/keys");
const googleMaps = require("../api/googleMaps");

exports.fetchDirections = async (req, res, next) => {
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
    currentLocation, // lat lng pair. may or may not be present
  } = req.body;
  // useCurrentLocation, if true, will prioritize currentLocation over inputted origin.

  let avoidArr = [];
  if (avoidTolls) avoidArr.push("tolls"); 
  if (avoidHighways) avoidArr.push("highways");
  if (avoidFerries) avoidArr.push("ferries");
  if (avoidIndoor) avoidArr.push("indoor");
  const avoidStr = avoidArr.join("|");

  try {

    if (altRoutes === undefined || !destination || !mode || (!origin && !currentLocation) || !units) {
      res.status(400).send({ error: "Missing required attributes for search. Try to refresh." });
      return;
    }

    let newOrigin;
    if (currentLocation) {
      console.log("Using current location");
      const revGeoRes = await googleMaps.get(`/geocode/json?latlng=${currentLocation.lat},${currentLocation.lng}&key=${keys.googleKey}`);
      newOrigin = revGeoRes.data.results[0].formatted_address;
    } else {
      newOrigin = origin;
    }

    const mapsParams = {
      params: {
        origin: newOrigin.replace(/#/g, ''),
        destination: destination.replace(/#/g, ''),
        mode,
        alternatives: altRoutes,
        units,
        ...avoidStr && { avoid: avoidStr },
        key: keys.googleKey
      }
    }

    const response = await googleMaps.get("/directions/json", mapsParams);
    
    const getData = response.data.routes[0] ? response.data.routes[0].legs[0] : {};

    res.send({ 
      directions: { 
        ...response.data, 
        origin: getData.start_address || newOrigin, 
        destination: getData.end_address || destination 
      }, 
      refreshedToken: req.auth
    });

    return;

  } catch(e) {
    console.log("Error in fetchDirections:", e);
    res.status(400).send({ error: "Lookup failed." });
    next();
    return;
  }
    

    
}