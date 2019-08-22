const { uuidv4 } = require("../utils");

/**
 *
 * @param {Knex} knex
 */
module.exports = knex => {
  /**
   * 
   * @param {string} userId - uuid of user that saved directions is associated with
   * @param {string} routeName  - name of the route to save (for cosmetic/searching purposes)
   * @param {object} directionParams - contains all the actual search parameters for google maps
   */
  const saveDirections = async (userId, routeName, directionParams) => {

    const uuid = uuidv4();
    await knex("saved_directions").insert({
      id: uuid,
      user_id: userId,
      route_name: routeName,
      ...directionParams
    });

    return uuid;
  };

  /**
   * @param {object} searchParams - contains properties to search with (with AND where conditions)
   * @param {string} [searchParams.routeName] - cosmetic name of a savedDirection
   * @param {string} [searchParams.userId] - find records that a specific user uuid saved
   * @param {string} [searchParams.id] - find a record with a unique uuid
   * @returns {object[]} - array of records
   */
  const findSavedDirections= async searchParams => {
    const { routeName, userId, id } = searchParams;

    const records = await knex.from("saved_directions").select().where({
      // TODO: Make routeName substring matching instead
      ...(routeName && { route_name: routeName }),
      ...(userId && { user_id: userId }),
      ...(id && { id })
    });

    return records
  }

  // deleteDirections (DELETE - via queryparams)

  // updateDirections (PATCH) make sure to change updated_at

  // find record by name, user, id, or everyone
  // (does not contain restrictions on search, that will be done on service layer. schema validation done in service layer)
  // DAL functionality shall be as "atomic" as possible

  return {
    saveDirections,
    findSavedDirections
  };
};
