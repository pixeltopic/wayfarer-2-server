const jwt = require("jsonwebtoken");
const HttpStatus = require("http-status-codes");
const mongoose = require("mongoose");

const User = require("../../models/user");
const { inactiveTokenTime, tokenExpiryTime, userSecret } = require("../../config");
const logger = require("../../utils").logger(__filename);
const { ErrorWrapper } = require("../../utils");

/**
 * Decodes a given JWT or throws an error if it cannot be decoded.
 * @param {string} token - A jwt to decode
 * @returns {object|null} - An object in the form of `{ sub: "user id", exp: "expiration date" }. If decoding fails, return null`
 */
const decodeJwt = token => {
  const decoded = jwt.decode(token);

  if (!decoded) {
    // if invalid jwt cannot be decoded) will be null
    logger.error("Provided JWT was invalid so token will not be refreshed.");
    return null;
    // throw ErrorWrapper("Invalid token", "RefreshTokenError", HttpStatus.BAD_REQUEST);
  }

  return decoded;
}

/**
 * Attempts to find user in DB using its id and if present and returns true if exactly one user is found,
 * @param {string} sub - user id extracted from a jwt, given by `decodeJwt`.
 */
const doesUserIdExist = async sub => {
  if (!mongoose.Types.ObjectId.isValid(sub)) {
    logger.error("Provided JWT was invalid as it could not be decoded into a valid MongoDB ID. so token will not be refreshed.");
    return false;
  }

  const userMatch = await User.countDocuments({ _id: sub });
  // ensure that there is exactly one user matching the decoded id.
  return userMatch === 1;
}

/**
 * refreshToken, using a jwt, determines if a token should be refreshed or revoked.
 * This func will return the same `token` if not needed
 * If the access is revoked, it will return an empty string.
 *
 * If jwt expired under x minutes ago, allow refresh.
 * if not, do not allow refresh.
 * 
 * @param {string} token - jwt token to authenticate user
 * @param {number} decoded.sub - ID of a user that the token belongs to
 * @param {number} decoded.exp - the expiry time of the token
 */
const refreshToken = async (token, { sub, exp }) => {

  const now = Math.ceil(new Date().getTime() / 1000); // convert to seconds (1000ms = 1s)

  logger.info(`now - decoded jwt expiry time. If positive, it is expired: ${now - exp}`);

  if (now > exp) {
    if (now - exp < Number(inactiveTokenTime)) { // if it has been less than x seconds of inactivity, refresh token
      logger.warn("token is expired and can be refreshed.");
      const newToken = jwt.sign({ sub }, userSecret, { expiresIn: tokenExpiryTime });
      return newToken;
    } else {
      logger.warn("token is expired and cannot be refreshed.");
      return ""; // tells client to unauthorize user if not succeeded by the verifyToken middleware.
      
    }
  } else {
    logger.warn("token is not yet expired so will not be refreshed.");
    return token;
  }
    
  
}

module.exports = { 
  refreshToken, 
  doesUserIdExist, 
  decodeJwt 
};