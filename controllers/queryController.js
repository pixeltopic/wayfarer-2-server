const witai = require("../api/witai");
const logger = require("../utils").logger(__filename);

const checkUnits = measurementStr => {
  switch(measurementStr) {
    case "miles":
    case "mile":
      return "imperial";
    case "kilometres":
    case "kilometre":
      return "metric";
    default:
      return "imperial";
  }
}

const processDirections = ({ entities }) => {
  // given the response from wit ai, returns an object containing origin and destination.
  const response = {
    origin: "",
    destination: ""
  };

  if (entities.origin) response.origin =  entities.origin[0].value;
  if (entities.destination) response.destination =  entities.destination[0].value;

  return response;
}


const processIncidents = ({ entities }) => {
  // Events near Staples Center
  // Traffic near Staples Center within x miles
  // Traffic from x to x
  // If origin === destination, only one location was specified.
  const response = {
    origin: "",
    destination: "",
    radius: null,
    units: "imperial"
  };

  if (entities.location && !entities.origin && !entities.destination) {
    // handling one specified location
    response.origin = entities.location[0].value;
    response.destination = entities.location[0].value;
  } else if (entities.local_search_query && !entities.origin && !entities.destination) {
    // handling one specified location
    response.origin = entities.local_search_query[0].value;
    response.destination = entities.local_search_query[0].value;
  } else if (!entities.location && entities.origin && entities.destination) {
    // handling an explicit start and end point
    response.origin = entities.origin[0].value;
    response.destination = entities.destination[0].value;
  }

  if (entities.distance) {
    const { value: dist, unit } = entities.distance[0];
    response.units = checkUnits(unit);
    if (response.units === "imperial" && dist > 30) {
      response.radius = 30;
    } else if (response.units === "metric" && dist > 50) {
      response.radius = 50;
    } else {
      response.radius = dist;
    }
  }

  return response;
}

const processPlaces = ({ entities, _text }) => {
  // given response from wit ai, returns a radius, keyword, and units specified by query.
  // Also includes radius validity checking with respect to units.
  // *Also allow users to specify address instead of their current location in the future
  const response = {
    radius: "0",
    keyword: "",
    units: "imperial"
  };

  if (entities.local_search_query) response.keyword = entities.local_search_query[0].value;

  if (entities.distance) {
    const { value: dist, unit } = entities.distance[0];
    response.units = checkUnits(unit);
    if (response.units === "imperial" && dist > 30) {
      response.radius = 30;
    } else if (response.units === "metric" && dist > 50) {
      response.radius = 50;
    } else {
      response.radius = dist;
    }
  } else {
    response.radius = 5;
    if (_text.toLowerCase().includes("farthest")) {
      response.radius = 30;
    }
  }

  return response;
}


exports.processQuery = async (req, res, next) => {

  const { query: clientQuery, currentLocation } = req.body;
  // current location should be a { lat, lng } object.

  
  if (!currentLocation) {
    res.send({ message: "Please enable location services." });
    return;
  }

  try {
    const response = await witai.get("", { 
      params: { 
        q: clientQuery.replace(/#/g, ''), 
        // verbose: true, 
        n: 1,
        // context: {"timezone":"America/Los_Angeles","locale": "en_US"}
      }
    });

    logger.info("response of witai:", response.data);

    const intent = response.data.entities.intent ? response.data.entities.intent[0].value : "";

    if (intent !== "places" && intent !== "incidents" && intent !== "directions") {
      res.send({ message: "Sorry, can you be more specific?" });
      return;
    }

    let processedQuery;
    if (intent === "directions") {
      processedQuery = processDirections(response.data);
      if (!processedQuery.origin || !processedQuery.destination) {
        res.send({ message: "Sorry, can you be more specific?" })
        return;
      }
      res.send({ queryParams: processedQuery, queryType: "directions" });
      return;

    } else if (intent === "incidents") {
      /* Still requires google map data before feeding it into mapquest 

      however, data can appear in local_search_query or location
      
      */
      processedQuery = processIncidents(response.data);
      if (!processedQuery.origin || !processedQuery.destination) {
        res.send({ message: "Sorry, can you be more specific?" })
        return;
      }
      res.send({ queryParams: processedQuery, queryType: "incidents" });
      return;

    } else if (intent === "places") {
      processedQuery = processPlaces(response.data);
      if (processedQuery.radius === "0" || !processedQuery.keyword) {
        res.send({ message: "Sorry, can you be more specific?" })
        return;
      }

      res.send({ queryParams: processedQuery, queryType: "places", currentLocation });
      return;
    }

  } catch(err) {
    // res.status(400).send({ error: "Query failed." });
    next(err);
    return;
  }
}