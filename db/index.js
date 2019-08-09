const Knex = require("knex");
// const uuidv4 = require("uuid/v4");
const { database } = require("../config");
const logger = require("../utils").logger(__filename, __dirname);

const knex = Knex({
  client: database.driver,
  connection: {
    host: database.host,
    user: database.user,
    password: database.pass,
    database: database.name
  },
  pool: { 
    min: database.minConnections, 
    max: database.maxConnections 
  }
});

/**
 * 
 * @param {Knex} knex 
 */
const tableInit = async (knex) => {
  try {
    const tableExists = await knex.schema.hasTable("users");

    if (!tableExists) {
      await knex.schema.createTable("users", table => {
        table.uuid('id').primary().notNullable()
        table.string("email", 128).notNullable();
        table.string("password", 128).notNullable();
        table.unique("email")
      });
    } else {
      logger.warn("`users` table already exists.");
    }

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
  userdb: require("./user.db")(knex),
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
