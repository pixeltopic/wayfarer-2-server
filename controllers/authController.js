const User = require("../models/user");
const tokenForUser = require("../utils/tokenForUser");


exports.signin = (req, res, next) => {
  // run when passport finishes authenticating email/password.
  // give user a token
  // accesses user.id allowed because passport supplies a `done` callback; we returned a found user with done(null, user); access via req.user
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ message: "Email and password must be provided." });
  }

  // see if user with given email exists. `User` refers to all users, not just one.
  User.findOne({ email: email }, (err, existingUser) => {
    // existingUser will be null if not found.
    if (err) { return next(err); }

    // if user exists, return error
    if (existingUser) {
      return res.status(422).send({ message: "Email is in use" });
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