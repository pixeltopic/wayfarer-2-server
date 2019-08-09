const { uuidv4 } = require("../utils");

/**
 * 
 * @param {Knex} knex 
 */
module.exports = knex => {
  const createUser = async (email, password) => {
    const uuid = uuidv4()
    await knex("users").insert({ id: uuid , email, password });

    return uuid;
  }

  const findUserByEmail = async email => {
    const result = await knex.from("users").select().where({ email });

    return result.length != 0 ? result[0] : null;
  }

  const findUserById = async id => {
    const result = await knex.from("users").select().where({ id });

    return result.length != 0 ? result[0] : null;
  }

  return {
    createUser,
    findUserByEmail,
    findUserById
  }
}