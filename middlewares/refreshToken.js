const jwt = require("jsonwebtoken");
const User = require("../models/user");
const keys = require("../config/keys");
const mongoose = require("mongoose");
const logger = require("../utils").logger(__filename);

/**
 * middleware to ensure that the jwt is valid.
 * if jwt expired under x minutes ago, allow refresh.
 * if not, do not allow refresh.
 */
module.exports = async (req, res, next) => {

  if (!req.headers.authorization) {
    res.locals.noAuth = true; // allows controller or succeeding middlewares to handle if user is not authenticated
    return next(); // if auth key not provided, user is not logged in and using a public route.
  }

  const now = Math.ceil(new Date().getTime() / 1000);

  const decoded = jwt.decode(req.headers.authorization);
  logger.info(`decoded jwt:\n${decoded}\ncurrent time: ${now}\nnow - decoded jwt expiry time. If positive, it is expired: ${now - decoded.exp}`);

  if (!decoded) {
    // if invalid jwt cannot be decoded) will be null
    return res.status(403).send({ error: "Invalid token." });
  }

  if (mongoose.Types.ObjectId.isValid(decoded.sub)) {
    try {
      const userMatch = await User.countDocuments({ _id: decoded.sub });
      // ensure that there is exactly one user matching the decoded id.
      if (userMatch !== 1)
        return res.status(403).send({ error: "User associated with token does not exist." });
      
      if (now > decoded.exp) {
        logger.warn("token is currently expired.");
        if (now - decoded.exp < Number(keys.inactiveTokenTime)) { // if it has been less than x seconds of inactivity, refresh token
          const newToken = jwt.sign({ sub: decoded.sub }, keys.userSecret, { expiresIn: keys.tokenExpiryTime });
          res.locals.auth = newToken;
          res.locals.refreshedToken = newToken;
          return next();
        } else {
          logger.warn("res.locals.auth is an empty string\n");
          res.locals.auth = ""; // tells client to unauthorize user if not succeeded by the verifyToken middleware.
          return next();
        }
      }
    } catch (e) {
      res.set("Connection", "close").status(403).send({ error: "Mongoose error." });
      return;
    }
  } else {
    res.set("Connection", "close").status(403).send({ error: "Invalid token format. Please reauthenticate." });
    return;
  }
  next();
}