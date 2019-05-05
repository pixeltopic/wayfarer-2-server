const MapWrap = require("mapwrap");
const keys = require("../config/keys");

module.exports = MapWrap({
  DEFAULT_API_KEY: keys.googleKey,
  useRestrictedKeys: {
    GEOCODING_API_KEY: keys.googleKey, // optional keys with priority over default for specific API services
    DIRECTIONS_API_KEY: keys.googleKey,
    PLACES_API_KEY: keys.googleKey
  }, 
  logCache: true,
  reverseGeoCacheSize: 20, // set the size of your LRU cache (all cache sizes are 10 by default)
  geoCacheSize: 20, 
  directionsCacheSize: 15, 
  nearbySearchCacheSize: 10, 
  placeDetailsCacheSize: 10,
});