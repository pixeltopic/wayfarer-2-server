const METERS_IN_MILE = 1609.344;
const METERS_IN_KILOMETER = 1000;

/**
 * Given miles, returns the approximate mile to meter conversion
 * @param {Number} miles 
 * @returns {Number} meters
 */
const miToM = miles => {
  return parseFloat(miles) * METERS_IN_MILE;
};

/**
 * Given kilometers, returns the km to meter conversion
 * @param {Number} kilometers
 * @returns {Number} meters
 */
const kmToM = kilometers => {
  return parseFloat(kilometers) * METERS_IN_KILOMETER;
}

/**
 * Converts miles to meters or km to meters, depending on unitType.
 * @param {"imperial" | "metric"} unitType - Accepts "imperial" or "metric"
 * @param {Number} distance - Some distance that may be in miles or kilometers to be converted to meters.
 * @returns {Number} meters
 */
const convertUnitToMeters = (unitType = "imperial", distance = 0) => {
  switch(unitType) {
    case "metric":
      return kmToM(distance);
    default:
      return miToM(distance);
  }

}

module.exports = {
  METERS_IN_MILE,
  METERS_IN_KILOMETER,
  miToM,
  kmToM,
  convertUnitToMeters
};