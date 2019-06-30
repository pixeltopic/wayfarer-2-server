const { getDistance } = require("geolib");
const axios = require("axios");
const LRU = require("lru-cache");
const keys = require("../config");

class LRUCache {
  /**
   * @constructor
   * @param {Number} [max] - Maxmimum amount of items that can be held in the cache at once. 10 by default.
   * @param {Number} [maxAge] - Milliseconds for the maximum allowed age of an item. 300000 ms by default.
   */
  constructor(max=10, maxAge=300000) {
    const options = { 
      max, 
      length: function (n, key) { return 1 },
      dispose: function (key, n) {}, 
      maxAge
    }
    this.cache = new LRU(options);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  get(key) {
    return this.cache.get(key);
  }

  flush() {
    this.cache.reset();
  }
}



/**
 * @class
 * Processes incidents for a single Google Directions API call.
 * 
 * Terminology: 
 * 
 * segment - a bounding box under 50,000 square miles. Segments are an object containing { corner1: latlngpair, corner2: latlngpair }.
 * Necessary because MapQuest can only search for incidents in a 50,000 square mile box.
 * 
 * latlngpair - { lat: Number, lng: Number }
 */
class IncidentsProcessor {
  /**
   * @constructor
   * @param {Object[]} googleDirections - The google API response contains a 'routes' property on the top level of the JSON structure, 
   * containing an array of route objects (array size is 1 if alternate routes was disabled). Accepts this array.
   * @param {LRUCache} [cache] - LRUCache to hold recently fetched incidents within the last x minutes.
   * @param {any} [logger] - Winston logger
   */
  constructor(googleDirections, cache = null, logger = null) {
    this.googleDirections = googleDirections;
    this.uniqueLatLngArrs = []; // order matters, index 0 corresponds to route 1, and so on.

    this._cache = cache;
    this._logger = logger || console;

    this._mapQuest = axios.create({
      baseURL: "http://www.mapquestapi.com/traffic/v2/incidents"
    });
  }

  /**
   * Given single route object, return an array of { lat: Number, lng: Number } from every step with no duplicate lats or lngs.
   * 
   * @param {Object} route - The google API response contains a 'routes' property on the top level of the JSON structure, 
   * containing an array of route objects (array size is 1 if alternate routes was disabled). Accepts a single route.
   * @returns {Object[]} - An array of { lat: Number, lng: Number }
   */
  _genUniqueLatLngArr(route) {
    const stepArray = route["legs"]["0"]["steps"];
    let latLngQueue = [];

    stepArray.forEach((step) => {
      if (!latLngQueue.find((latLngPair) => latLngPair.lat === step.start_location.lat && latLngPair.lng === step.start_location.lng)) {
        latLngQueue.push(step.start_location);
      }
      if (!latLngQueue.find((latLngPair) => latLngPair.lat === step.end_location.lat && latLngPair.lng === step.end_location.lng)) {
        latLngQueue.push(step.end_location);
      }
    });
      
    return latLngQueue;
  }

  /**
   * Remove all invalid corner pair objects that result in an area coverage of zero. Helper method for _genSegmentArr.
   * 
   * @param {Object[]} arr - array of corners of each bounding box "segment" in the format of [{ corner1: { lat, lng}, corner2: { lat, lng } }]
   * @returns {Object[]} newArr - filtered Array of only valid pairs in format of [{ corner1: { lat, lng}, corner2: { lat, lng } }]
   */
  _assertSquareMiles(arr) {
    return arr.filter((box) => {
      const { corner1, corner2 } = box;
      const length = getDistance(corner1, { lat: corner1.lat, lng: corner2.lng }) / 1000;
      const width = getDistance(corner2, { lat: corner1.lat, lng: corner2.lng }) / 1000;
      return length * width !== 0;
    });
  }

  /**
   * Given an array of { lat: Number, lng: Number } objects return an array of { corner1: { lat, lng}, corner2: { lat, lng } }
   * Call with the output of _genUniqueLatLngArr
   * 
   * @param {Object[]} latLngArr - An array of { lat: Number, lng: Number }.
   * @returns {Object[]} - formatted as [{ corner1: { lat, lng}, corner2: { lat, lng } }]
   */
  _genSegmentArr(latLngArr) {
    // returns an object with int keys and a corner1 and corner2 attribute which then contains 
    // latlngs for a bounding box. The bounding box is the fewest number of < 50k square mile segments.
  
    let result = [];
    const kmSq = 125000;
    let tempArr = latLngArr;
    let corner1, corner2, length, width, i, prev = 0;
  
    const origin = tempArr[0];
    const dest = tempArr[tempArr.length-1];
    // initial check: assert origin to destination is under 50,000 sq miles.
    const firstl = getDistance(origin, { lat: origin.lat, lng: dest.lng }) / 1000; // divisions by 1000 are to convert meter output to km
    const firstw = getDistance(dest, { lat: origin.lat, lng: dest.lng }) / 1000;
    if (firstl*firstw <= kmSq) {
      return [{ corner1: origin, corner2: dest }];
    }
    try {
      while (tempArr.length !== 0) {
        corner1 = tempArr.shift();  // shift shortest corner out from front index
        for (i = 0; i < tempArr.length; i++) {
          corner2 = tempArr[i];
          length = getDistance(corner1, { lat: corner1.lat, lng: corner2.lng }) / 1000;
          width = getDistance(corner2, { lat: corner1.lat, lng: corner2.lng }) / 1000;   
          if (length*width > kmSq) {
            // dlength and dwidth ensure that the prev value * current value is valid, or else
            // the algorithm will end prematurely with invalid values.
            // if dlength * dwidth > kmSq, then the algorithm will skip that bounding box entirely.
            const dlength = getDistance(corner1, { lat: corner1.lat, lng: tempArr[prev].lng}) / 1000;
            const dwidth = getDistance(tempArr[prev], { lat: corner1.lat, lng: tempArr[prev].lng }) / 1000;
            if (dlength*dwidth > kmSq) {
              corner1 = tempArr.shift(); 
              corner2 = corner1; 
              // previous corner2 overwritten, don't need.
              // The next iteration area will be 0 for dlength and dwidth
            } else {
              corner2 = tempArr[prev];
              break;
            }
          }
          prev = i;
        }
        result.push({ corner1, corner2 });
        tempArr = tempArr.slice(i-1); // retain all bigger data and remove smaller data
      }
      return this._assertSquareMiles(result); // refactor to return ordered array instead of an object with int keys so it's more intuitive
      
    } catch(err) {
      this._logger.error(err);
      return [];
    }
  }

  /**
   * Given googleDirection data, generate a 2D array where each inner array contains bounding boxes under 50,000 square miles
   * 
   * @param {Object[]} googleDirections - The google API response contains a 'routes' property on the top level of the JSON structure, 
   * containing an array of route objects (array size is 1 if alternate routes was disabled). This function takes the entire array.
   * 
   * @returns {Object[][]} - returns 2D array in which every array corresponds to a route # 
   * and contains an object in format of { corner1: { lat: Number, lng: Number }, corner2: { lat: Number, lng: Number } }
   */
  _genSegmentArrForRoutes(googleDirections) {
    this.uniqueLatLngArrs = googleDirections.map((route) => {
      return this._genUniqueLatLngArr(route); // store computed data into an attribute
    });
    
    return googleDirections.map((route, i) => {
      // this._logger.info(`\nmapping iteration #${i}\n`);
      return this._genSegmentArr(this.uniqueLatLngArrs[i]);
    });
    
  }

  /**
   * Fetches incidents using MapQuest for a bounding box segment. A segment is an object in the format of
   * { corner1: { lat: Number, lng: Number }, corner2: { lat: Number, lng: Number } }
   * 
   * @param {Object} routeSegment - A single segment object which is in _genSegmentArr's output.
   * Looks like { corner1: { lat: Number, lng: Number }, corner2: { lat: Number, lng: Number } }
   * 
   * @returns {Promise<Object[]>} - returns an array of incident objects from MapQuest. See https://developer.mapquest.com/documentation/traffic-api/incidents/get/
   */
  async _fetchIncidents(routeSegment) {

    const { corner1, corner2 } = routeSegment;
    
    // implement LRU cache support. This'll be easy.
    
    try {
      if (this._cache) {
        const cachedIncident = this._cache.get(`${corner1.lat},${corner1.lng},${corner2.lat},${corner2.lng}`);
        if (cachedIncident) {
          this._logger.info("IncidentsProcessor cache hit.");
          return cachedIncident;
        }
      }

      const response = await this._mapQuest.get("", {
        params: {
          key: keys.mapquestKey,
          boundingBox: `${corner1.lat},${corner1.lng},${corner2.lat},${corner2.lng}`,
          filters: `construction,incidents,event,congestion`
        }
      });

      if (this._cache) {
        this._cache.set(`${corner1.lat},${corner1.lng},${corner2.lat},${corner2.lng}`, response.data.incidents);
      }

      return response.data.incidents;

    } catch (err) {
      this._logger.error(err);
      return []; // return an empty array instead of null
    }
  }

  /**
   * Filters irrelevant incidents away from the array within a given radius.
   * 
   * @param {Object[]} unfilteredIncidentArr - List of relevant and irrelevant (too far away) incidents for the entire route
   * @param {Object[]} uniqueRouteArr - Array of unique lat-lng pairs calculated by _genUniqueLatLngArr corresponding to the incident array.
   * (If unfilteredIncidentArr is for route 1, uniqueRouteArr must also be for route 1)
   * @param {Number} [radius] - custom radius to detect incidents in meters. Defaults to 5000 meters.
   * @returns {Object[]} - returns a filtered incident array with only relevant incidents. Does not mutate original array input.
   */
  _filterIncidentsInRoute(unfilteredIncidentArr, uniqueRouteArr, radius=null) {
  
    const filteredIncidents = unfilteredIncidentArr.filter(incident => {
      // if incident is within 5000 meters (or specified radius) of any step, retain it.
      return uniqueRouteArr.some(latLngPair =>
        getDistance(latLngPair, { lat: incident.lat, lng: incident.lng }) <= (!radius || radius > 24140 || radius <= 0 ? 5000 : radius)
      );
    });
    return filteredIncidents;
  }

  /**
   * Entry point of class. Retrieves incidents for all the Google Directions API response within a given radius.
   * 
   * @param {Number} [radius] - optional radius from a route to detect incidents in meters. Defaults to 5000 meters, cannot be <= 0 or > 24140.
   * @returns {Promise<Object>} - object with keys representing the route number. Each value corresponding to it is an array of filtered incidents.
   */
  async retrieveIncidents(radius=null) {
    // logger.info("Starting retrieval");
    const routeSegmentArrs = this._genSegmentArrForRoutes(this.googleDirections); // 2d array

    let resultObject = {};

    
    for (let routeNum = 0; routeNum < routeSegmentArrs.length; routeNum++) {
      // logger.info("New segment iteration");

      let unfilteredRouteIncidents = [];
      for (let segmentNum = 0; segmentNum < routeSegmentArrs[routeNum].length; segmentNum++) {
      
        const routeSegment = routeSegmentArrs[routeNum][segmentNum];
        // logger.info(routeSegment);

        const fetchedIncidentArr = await this._fetchIncidents(routeSegment);
        
        unfilteredRouteIncidents = unfilteredRouteIncidents.concat(fetchedIncidentArr);
      }
      
      resultObject[routeNum] = this._filterIncidentsInRoute(unfilteredRouteIncidents, this.uniqueLatLngArrs[routeNum], radius);

    }

    return resultObject;
  }


}

exports.IncidentsProcessor = IncidentsProcessor;

exports.IncidentsCache = new LRUCache(75, 2 * 300000); // fetched incidents are fresh for 10 minutes before it is pruned. (300,000 ms = 5 mins, * 2)