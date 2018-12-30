const jwt = require("jwt-simple");
const User = require("../models/user");
const keys = require("../config/keys");

const tokenForUser = user => {
  // generates a jwt based on userSecret
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, keys.userSecret);
}

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: "Email and password must be provided." });
  }

  // see if user with given email exists. `User` refers to all users, not just one.
  User.findOne({ email: email }, (err, existingUser) => {
    // existingUser will be null if not found.
    if (err) { return next(err); }

    // if user exists, return error
    if (existingUser) {
      return res.status(422).send({ error: "Email is in use" });
    }

    // user does not exist, create and save new user record
    const userToSave = new User({
      email: email,
      password: password
    });

    userToSave.save(err => {
      if (err) { return next(err); }

      res.json({ token: tokenForUser(userToSave) }); // response to request indicating creation of user.
    }); // save record to database.


  });
}