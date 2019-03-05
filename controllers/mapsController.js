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
    currentLocation, // lat lng pair
    useCurrentLocation // boolean deciding to use `origin` or currentLocation for search
  } = req.body;
  // useCurrentLocation, if true, will prioritize currentLocation over inputted origin.

  let avoidArr = [];
  if (avoidTolls) avoidArr.push("tolls"); 
  if (avoidHighways) avoidArr.push("highways");
  if (avoidFerries) avoidArr.push("ferries");
  if (avoidIndoor) avoidArr.push("indoor");
  const avoidStr = avoidArr.join("|");

  try {

    if (altRoutes === undefined || !destination || !mode || (!origin && !useCurrentLocation) || !units || (useCurrentLocation && !currentLocation)) {
      res.status(400).send({ error: "Missing required attributes for search. Try to refresh." });
      return;
    }

    let newOrigin;
    if (useCurrentLocation) {
      console.log("Using current location");
      const revGeoRes = await googleMaps.get(`/geocode/json?latlng=${currentLocation.lat},${currentLocation.lng}&key=${keys.googleKey}`);
      newOrigin = revGeoRes.data.results[0].formatted_address;
    } else {
      newOrigin = origin;
    }

    const mapsParams = {
      params: {
        origin: newOrigin.replace(/#(?=\S)/g, ''),
        destination: destination.replace(/#(?=\S)/g, ''),
        mode,
        alternatives: altRoutes,
        units,
        ...avoidStr && { avoid: avoidStr },
        key: keys.googleKey
      }
    }

    const response = await googleMaps.get("/directions/json", mapsParams);



    res.send({ directions: { ...response.data, origin: newOrigin, destination }, refreshedToken: req.auth });

    return;

  } catch(e) {
    console.log("Error in fetchDirections:", e);
    res.status(400).send({ error: "Lookup failed." });
    next();
    return;
  }
    

    
}