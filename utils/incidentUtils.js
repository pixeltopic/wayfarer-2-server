const { getDistance } = require("geolib");
const { getBoundingBox, insideBoundingBox }  = require("geolocation-utils");
const axios = require("axios");
const keys = require("../config/keys");

const genLatLngQueue = (route) => {
  // given single route object, return an array of {lat, lng} from every step.
  const stepArray = route["legs"]["0"]["steps"];
  let latLngQueue = [];

  stepArray.forEach((step) => {
    latLngQueue.push(step.start_location);
    latLngQueue.push(step.end_location);
  });
      
  return latLngQueue;
}

const genUniqueLatLngQueue = (route) => {
    // given single route object, return an array of {lat, lng} from every step but with uniqueness.
  const stepArray = route["legs"]["0"]["steps"];
  let latLngQueue = [];

  stepArray.forEach((step) => {
    if (latLngQueue.find((latLngPair) => latLngPair.lat === step.start_location.lat && latLngPair.lng === step.start_location.lng) === undefined) {
      latLngQueue.push(step.start_location);
    }
    if (latLngQueue.find((latLngPair) => latLngPair.lat === step.end_location.lat && latLngPair.lng === step.end_location.lng) === undefined) {
      latLngQueue.push(step.end_location);
    }
  });
      
  return latLngQueue;
}

const assertSquareMiles = (arr) => {
  // given array of corner pairs, assert they are all under 50,000 square miles and not equal to zero.

  const newArr = arr.filter((box) => {
    const { corner1, corner2 } = box;
    const length = getDistance(corner1, { lat: corner1.lat, lng: corner2.lng }) / 1000;
    const width = getDistance(corner2, { lat: corner1.lat, lng: corner2.lng }) / 1000;
    return length * width !== 0;
  });

  return newArr;
}

const genSegmentObj = (latLngArr) => {
  // returns an object with int keys and a corner1 and corner2 attribute which then contains 
  // latlngs for a bounding box. The bounding box is the fewest number of < 50k square mile segments.

  let result = [];
  const kmSq = 129499;
  let tempArr = latLngArr;
  let corner1, corner2, length, width, i, prev = 0;

  const origin = tempArr[0];
  const dest = tempArr[tempArr.length-1];
  const firstl = getDistance(origin, { lat: origin.lat, lng: dest.lng }) / 1000;
  const firstw = getDistance(dest, { lat: origin.lat, lng: dest.lng }) / 1000;
  if (firstl*firstw <= kmSq) {
    return { 0: { corner1: origin, corner2: dest } };
  }
  try {
    while (tempArr.length !== 0) {
      corner1 = tempArr.shift(); 
      for (i = 0; i < tempArr.length; i++) {
        corner2 = tempArr[i];
        length = getDistance(corner1, { lat: corner1.lat, lng: corner2.lng }) / 1000;
        width = getDistance(corner2, { lat: corner1.lat, lng: corner2.lng }) / 1000;   
        if (length*width > kmSq) {
          const dlength = getDistance(corner1, { lat: corner1.lat, lng: tempArr[prev].lng}) / 1000;
          const dwidth = getDistance(tempArr[prev], { lat: corner1.lat, lng: tempArr[prev].lng }) / 1000;
          if (dlength*dwidth > kmSq) {
            corner1 = tempArr.shift(); 
            corner2 = corner1; 
          } else {
            corner2 = tempArr[prev];
            break;
          }
        }
        prev = i;
      }
      result.push({ corner1, corner2 });
      tempArr = tempArr.slice(i-1); 
    }
    result = assertSquareMiles(result);
    return { ...result };
  } catch(err) {
    console.log(err);
    return {};
  }
}

const genSegmentObjForAllRoutes = (data) => {
  // returns an object containing the segmented areas for every route.
  // { 0: {segment object}, 1: ... }
  let result = [];
  for (let routeNum in data) {
    const fullRouteLatLngArr = genLatLngQueue(data[routeNum]);
    const routeSegmentObj = genSegmentObj(fullRouteLatLngArr);
    result.push(routeSegmentObj);
  }
  return { ...result };
}

exports.genFullSegObj = genSegmentObjForAllRoutes;

const fetchIncidents = async (routeNum, stepNum, segObj, latLngData) => {
  // given a route number, the step number for that object, and the segment pair object,
  // make the API call for that single segment.
  const MAPQUEST_ROOT_URL = "http://www.mapquestapi.com/traffic/v2/incidents";
  const MAPQUEST_URL = `${MAPQUEST_ROOT_URL}?key=${keys.mapquestKey}&boundingBox=${segObj.corner1.lat},${segObj.corner1.lng},${segObj.corner2.lat},${segObj.corner2.lng}&filters=construction,incidents,event,congestion`;
  return await axios.get(MAPQUEST_URL).then(request => ({ request, routePayload: routeNum, stepPayload: stepNum, latLngQueue: latLngData, segObj: segObj }));
}

const processFetchedIncidents = (fetchedIncidents) => {
  const { routePayload, request, latLngQueue, segObj } = fetchedIncidents;

  const segObjBoundingBox = getBoundingBox(
    [{ lat: segObj.corner1.lat, lon: segObj.corner1.lng }, 
    { lat: segObj.corner2.lat ,lon: segObj.corner2.lng }]
  );

  const filteredSteps = latLngQueue.filter((step) => {
    // filters the steps relevant for this segment
    return insideBoundingBox({lat: step.lat, lon: step.lng}, segObjBoundingBox);
  });

  const filteredIncidents = request.data.incidents.filter((incident) => {
    // if incident is within 5000 meters of any step, retain it.
    for (let i = 0; i < filteredSteps.length; i++) {
      if (getDistance({lat: filteredSteps[i].lat, lng: filteredSteps[i].lng}, incident) <= 5000) {
        return true;
      }
    }
    return false;
  });

  // console.log(filteredIncidents);

  return { [routePayload]: filteredIncidents };
}

exports.updateFullIncident = async (data) => {
  // given object returned by genSegmentObj, fire actions for every single possible segement
  // in every route

  let result = {};

  const fullSegmentObj = genSegmentObjForAllRoutes(data);
  for (let routeNum in fullSegmentObj) {
    for (let stepNum in fullSegmentObj[routeNum]) {
      
      const fetchedIncidents = await fetchIncidents(routeNum, stepNum, fullSegmentObj[routeNum][stepNum], genUniqueLatLngQueue(data[routeNum]));

      result = { ...result, ...processFetchedIncidents(fetchedIncidents) };

      
    }
  }

  return result;
}
