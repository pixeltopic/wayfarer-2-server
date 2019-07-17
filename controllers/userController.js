const { tokenForUser } = require("../utils");
const logger = require("../utils").logger(__filename);
const {
  refreshToken: { refreshToken, doesUserIdExist, decodeJwt },
  registerUser: { registerUser, doesUserEmailExist }
} = require("../services/user");
const HttpStatus = require("http-status-codes");

exports.signin = (req, res) => {
  // run when passport finishes authenticating email/password.
  // give user a token
  // accesses user.id allowed because passport supplies a `done` callback; we returned a found user with done(null, user); access via req.user
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = async (req, res, next) => {
  const { email, password } = res.locals.body;

  try {
    const userExists = await doesUserEmailExist(email);
    if (userExists) {
      logger.warn("User provided duplicate email.");
      return res
        .status(HttpStatus.UNPROCESSABLE_ENTITY)
        .send({ message: "Email is in use." });
    }

    const token = await registerUser(email, password);

    logger.info("User successfully signed up.");

    res.status(HttpStatus.OK).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const incomingToken = req.headers.authorization;
    const decoded = decodeJwt(incomingToken);

    if (!decoded)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({
          message: "Provided JWT was invalid so token will not be refreshed."
        });

    const userExists = await doesUserIdExist(decoded.sub);
    if (!userExists)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({
          message:
            "User associated with token does not exist. Token will not be refreshed."
        });

    const token = await refreshToken(incomingToken, decoded);
    logger.info(`Token refreshed. New token is: ${token}`);

    return res.status(HttpStatus.OK).send({ token });
  } catch (err) {
    next(err);
  }
};
