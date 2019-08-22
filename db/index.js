const Knex = require("knex");
// const uuidv4 = require("uuid/v4");
const tableSchemaInit = require("../models/db");
const { database } = require("../config");
const logger = require("../utils").logger(__filename, __dirname);

const knex = Knex({
  client: database.driver,
  connection: {
    host: database.host,
    user: database.user,
    password: database.pass,
    database: database.name,
    typeCast: (field, next) => {
      // logger.info(`TypeCasting. Type:${field.type},Length:${field.length}`);
      if (field.type == "TINY" && field.length == 1) {
          let value = field.string();
          return value ? (value == '1') : null;
      }
      return next();
  }
  },
  pool: { 
    min: Number(database.minConnections), 
    max: Number(database.maxConnections) 
  }
});

/**
 * @param {Knex} knex 
 * @param {string} tableName
 * @param {function} callback
 */
const createTable = async (knex, tableName, callback) => {
  const tableExists = await knex.schema.hasTable(tableName);

  if (!tableExists) {
    logger.info(`\`${tableName}\` table does not exist. Initializing.`)
    await knex.schema.createTable(tableName, callback);
  } else {
    logger.warn(`\`${tableName}\` table already exists. Skipping.`);
  }
}

/**
 * 
 * @param {Knex} knex 
 */
const tableInit = async (knex) => {
  try {

    const schema = tableSchemaInit(knex);

    await createTable(knex, "users", schema.users);

    await createTable(knex, "saved_directions", schema.savedDirections)

    // do a test insert and select
    // await knex("users").insert({ id: uuidv4(), email: "test1@test.com", password: "mypasswordinrawtext" });
    
    // const rows = await knex.from("users").select()

    // rows.map(row => {
    //   console.log(`${row['id']} ${row['email']} ${row['password']}`);
    // })

    // const result = await require("./user.db")(knex).findUserByEmail("test2@test.com");
    // console.log(result);


  } catch(err) {
    logger.error(err);
  }
}

module.exports = {
  tableInit: async () => await tableInit(knex),
  userDB: require("./user.db")(knex),
  savedDirectionsDB: require("./savedDirections.db")(knex),
}


// knex.schema
//   .createTable("users", table => {
//     table.increments("userId");
//     table.string("email");
//     table.string("password");
//   })
//   .then(() => console.log("table created"))
//   .catch(err => {
//     console.log(err);
//     throw err;
//   })
//   .finally(() => {
//     knex.destroy();
//   });
