const User = require("../../models/user");
const { tokenForUser } = require("../../utils");

const doesUserEmailExist = async email => {
  // finds a user satisfying specified email in table of all users
  const userRecord = await User.findOne({ email }); // userRecord will be null if not found

  return !!userRecord;
};

const registerUser = async (email, password) => {
  // user does not exist, create and save new user record
  const userToSave = new User({
    email,
    password
  });
  await userToSave.save();

  return tokenForUser(userToSave);
};

module.exports = {
  registerUser,
  doesUserEmailExist
};
