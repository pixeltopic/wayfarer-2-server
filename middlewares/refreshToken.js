const jwt = require("jsonwebtoken");
const User = require("../models/user");
const keys = require("../config");
const mongoose = require("mongoose");
const logger = require("../utils").logger(__filename);

/**
 * middleware to ensure that the jwt is valid.
 * if jwt expired under x minutes ago, allow refresh.
 * if not, do not allow refresh.
 */
module.exports = async (req, res, next) => {

  const now = Math.ceil(new Date().getTime() / 1000);

  const decoded = jwt.decode(req.headers.authorization);

  if (!decoded) {
    // if invalid jwt cannot be decoded) will be null
    logger.error("Provided JWT was invalid so token will not be refreshed.");
    return res.status(400).send({ message: "Invalid token." });
  }

  logger.info(`decoded jwt:\n${decoded}\ncurrent time: ${now}\nnow - decoded jwt expiry time. If positive, it is expired: ${now - decoded.exp}`);

  if (mongoose.Types.ObjectId.isValid(decoded.sub)) {
    try {
      const userMatch = await User.countDocuments({ _id: decoded.sub });
      // ensure that there is exactly one user matching the decoded id.
      if (userMatch !== 1)
        return res.status(400).send({ message: "User associated with token does not exist. Token will not be refreshed." });
      
      if (now > decoded.exp) {
        if (now - decoded.exp < Number(keys.inactiveTokenTime)) { // if it has been less than x seconds of inactivity, refresh token
          logger.warn("token is expired and can be refreshed.");
          const newToken = jwt.sign({ sub: decoded.sub }, keys.userSecret, { expiresIn: keys.tokenExpiryTime });
          res.locals.refreshedToken = newToken;
          return next();
        } else {
          logger.warn("token is expired and cannot be refreshed.");
          res.locals.refreshedToken = ""; // tells client to unauthorize user if not succeeded by the verifyToken middleware.
          return next();
        }
      } else {
        logger.warn("token is not yet expired so will not be refreshed.");
        res.locals.refreshedToken = req.headers.authorization;
      }
    } catch (e) {
      logger.error("Mongoose DB query ran into an error.");
      res.set("Connection", "close").status(400).send({ message: "Server error." });
      return;
    }
  } else {
    logger.error("Provided JWT was invalid as it could not be decoded into a valid MongoDB ID. so token will not be refreshed.");
    res.set("Connection", "close").status(400).send({ message: "Invalid token." });
    return;
  }
  next();
}