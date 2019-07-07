const mapquest = require("../../api/mapquest");
const logger = require("../../utils").logger(__filename);
const GeoPoint = require("../../utils").geopoint;
const { mapquestKey } = require("../../config");

exports.mapquestRadiusFetch = async (
  distFromCenter = 3,
  units = "imperial",
  { lat, lng }
) => {
  logger.info("Fetching incidents from MapQuest using a radius around a center coordinate.");
  const center = new GeoPoint(lat, lng);

  if (units === "metric") distFromCenter = parseFloat(distFromCenter) * 0.621; // 0.621 is the conversion from miles to km

  const boundingBox = center.boundingCoordinates(distFromCenter); // look for all incidents within x miles or km

  const mapquestParams = {
    params: {
      key: mapquestKey,
      boundingBox: `${boundingBox[0].latitude()},${boundingBox[0].longitude()},${boundingBox[1].latitude()},${boundingBox[1].longitude()}`,
      filters: `construction,incidents,event,congestion`
    }
  };

  logger.info("Fetching incidents given params: ")
  logger.info(mapquestParams.params)
  const response = await mapquest.get("", mapquestParams);

  return response.data.incidents;
};
