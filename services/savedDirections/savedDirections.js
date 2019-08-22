const { savedDirectionsDB } = require("../../db");

const saveDirections = async (userId, routeName, searchParams) => {
  // validation was performed by the middleware.
  // const { value, error } = Joi.validate(searchParams, directionsSchema);

  // if (error) {
  //   return null;
  // }

  const {
    origin,
    destination,
    mode,
    units,
    altRoutes: alt_routes,
    avoidFerries: avoid_ferries,
    avoidHighways: avoid_highways,
    avoidIndoor: avoid_indoor,
    avoidTolls: avoid_tolls,
    currentLocation
  } = searchParams;

  const directionParams = {
    origin,
    destination,
    mode,
    units,
    alt_routes,
    avoid_ferries,
    avoid_highways,
    avoid_indoor,
    avoid_tolls,
    lat: currentLocation ? currentLocation.lat : null,
    lng: currentLocation ? currentLocation.lng : null
  }

  const uuid = await savedDirectionsDB.saveDirections(userId, routeName, directionParams);

  return uuid;
}

const findSavedDirections = async (searchParams) => {
  const result = await savedDirectionsDB.findSavedDirections(searchParams);

  // snake_case is used in sql because it is case insensitive.
  const transformed = result.map(({ id, origin, destination, mode, units, lat, lng, ...record }) => {
    return {
      id,
      userId: record.user_id,
      routeName: record.route_name,
      origin,
      destination,
      mode,
      units,
      altRoutes: record.alt_routes,
      avoidFerries: record.avoid_ferries,
      avoidHighways: record.avoid_highways,
      avoidIndoor: record.avoid_indoor,
      avoidTolls: record.avoid_tolls,
      ...(lat && lng ? { currentLocation: { lat, lng } } : { currentLocation: null })
    };
  })

  return transformed;
}

module.exports = {
  saveDirections,
  findSavedDirections,
}