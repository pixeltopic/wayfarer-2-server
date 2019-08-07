const { tokenForUser, password: { hashPassword } } = require("../../utils");
const { userdb: { findUserByEmail, createUser } } = require("../../db");

const doesUserEmailExist = async email => {
  // finds a user satisfying specified email in table of all users

  const userRecord = await findUserByEmail(email);

  return !!userRecord;
};

const registerUser = async (email, password) => {

  const hashedPass = hashPassword(password);

  const uuid = await createUser(email, hashedPass);

  return tokenForUser({ id: uuid });
}

module.exports = {
  registerUser,
  doesUserEmailExist
};
