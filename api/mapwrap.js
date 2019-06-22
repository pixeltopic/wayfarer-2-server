const MapWrap = require("mapwrap");
const keys = require("../config/keys");
const logger = require("../utils/logger")(__filename);

module.exports = MapWrap({
  DEFAULT_API_KEY: keys.googleKey,
  useRestrictedKeys: {
    GEOCODING_API_KEY: keys.googleKey, // optional keys with priority over default for specific API services
    DIRECTIONS_API_KEY: keys.googleKey,
    PLACES_API_KEY: keys.googleKey
  }, 
  cacheMaxItemAges: {
    reverseGeoCache: 24 * 60 * 60000, // 1 day
    geoCache: 24 * 60 * 60000, 
    directionsCache: 30 * 60000, // 30 mins
    nearbySearchCache: 60 * 60000, // 1 hour
    placeDetailsCache: 180 * 60000, // 3 hours
  },
  cacheMaxSizes: {
    reverseGeoCache: 20,
    geoCache: 20, 
    directionsCache: 15, 
    nearbySearchCache: 10, 
    placeDetailsCache: 10,
  },
  logCache: true,
  logger: message => logger.info(message)
  
});