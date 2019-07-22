const HttpStatus = require("http-status-codes");
const {
  google: { placesFetch }
} = require("../services");

exports.placesWithToken = async (req, res, next) => {
  const { nextPageToken } = res.locals.body;

  try {
    const placesResponse = await placesFetch.googlePlacesToken(nextPageToken);
    return res.status(HttpStatus.OK).send({
      places: placesResponse
    });
  } catch (err) {
    return next(err);
  }
};

exports.places = async (req, res, next) => {
  try {
    const payload = await placesFetch.googleNearbyPlacesFetch(res.locals.body);

    return res.status(HttpStatus.OK).send({
      places: payload
    });
  } catch (err) {
    return next(err);
  }
};

exports.placeDetails = async (req, res, next) => {
  const { place_id } = res.locals.body;

  try {
    const placeDetailsResult = await placesFetch.googlePlaceDetails(place_id);

    return res.status(HttpStatus.OK).send({
      placeDetails: {
        result: placeDetailsResult,
        place_id
      }
    });
  } catch (err) {
    return next(err);
  }
};
