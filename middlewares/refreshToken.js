const jwt = require("jsonwebtoken");
const User = require("../models/user");
const keys = require("../config/keys");
const mongoose = require("mongoose");

module.exports = async (req, res, next) => {
  // middleware to ensure that the jwt is valid.
  // if jwt expired under x minutes ago, allow refresh.
  // if not, do not allow refresh.
  if (!req.headers.authorization) {
    req.noAuth = true; // allows controller or succeeding middlewares to handle if user is not authenticated
    next(); // if auth key not provided, user is not logged in and using a public route.
    return;
  }

  const now = Math.ceil(new Date().getTime() / 1000);

  const decoded = jwt.decode(req.headers.authorization);
  console.log("\ndecoded jwt:", decoded, "\ncurrent time:", now, "\nnow - decoded jwt expiry time. If positive, it is expired.", now - decoded.exp);

  if (!decoded) {
    // if invalid jwt cannot be decoded) will be null
    return res.status(403).send({ error: "Invalid token." });
  }

  if (mongoose.Types.ObjectId.isValid(decoded.sub)) {
    // Yes, it's a valid ObjectId, proceed with `countDocuments` call.
    try {
      await User.countDocuments({ _id: decoded.sub }).then((count) => {
        
        // ensure that there is exactly one user matching the decoded id.
        if (count === 1) {
          // token is expired, enter this block
          // console.log("count was one");
          if (now > decoded.exp) {
            console.log("token is currently expired");
            if (now - decoded.exp < Number(keys.inactiveTokenTime)) { // if it has been less than x seconds of inactivity, refresh token
              const newToken = jwt.sign({ sub: decoded.sub }, keys.userSecret, { expiresIn: keys.tokenExpiryTime });
              req.auth = newToken;
              req.refreshedToken = newToken;
              return next();
            } else {
              // console.log("req.auth is an empty string\n");
              req.auth = ""; // tells client to unauthorize user if not succeeded by the verifyToken middleware.
              return next();
            }
          }
        } else {
          return res.status(403).send({ error: "User associated with token does not exist." });
        }
      });
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