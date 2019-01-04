const jwt = require("jsonwebtoken");
const User = require("../models/user");
const keys = require("../config/keys");

module.exports = async (req, res, next) => {
  // middleware to ensure that the jwt is valid.
  // if jwt expired under x minutes ago, allow refresh.
  // if not, do not allow refresh.
  if (!req.headers.authorization) {
    return res.status(403).send({ error: "Authorization key not provided." });
  }

  const now = Math.ceil(new Date().getTime() / 1000);

  const decoded = jwt.decode(req.headers.authorization);
  console.log("decoded jwt:", decoded, now);

  if (!decoded) {
    // if invalid jwt cannot be decoded) will be null
    return res.status(403).send({ error: "Invalid token." });
  }

  if (decoded.sub.match(/^[0-9a-fA-F]{24}$/)) {
    // Yes, it's a valid ObjectId, proceed with `countDocuments` call.
    await User.countDocuments({ _id: decoded.sub }, (err, count) => {
      if (err) { 
        return next(err); 
      }
      // ensure that there is exactly one user matching the decoded id.
      if (count === 1) {
        // token is expired, enter this block
        if (now > decoded.exp) {
          if (now - decoded.exp < Number(keys.inactiveTokenTime)) { // if it has been less than x seconds of inactivity, refresh token
            const newToken = jwt.sign({ sub: decoded.sub }, keys.userSecret, { expiresIn: keys.tokenExpiryTime });
            req.auth = newToken;
            req.refreshedToken = newToken;
          } else {
            req.auth = ""; // tells client to unauthorize user if not succeeded by the verifyToken middleware.
          }
        }
      } else {
        return res.status(403).send({ error: "User associated with token does not exist." });
      }
    });
  } else {
    return res.status(403).send({ error: "Invalid token format." });
  }
  next();
}