
// TS = short for table schema.

const usersTS = (table) => {
  table.uuid("id").primary().notNullable();
  table.string("email", 128).notNullable();
  table.string("password", 128).notNullable();
  table.unique("email");
}

const savedDirectionsTS = (table, knex) => {
  table.uuid("id").primary().notNullable();
  table.uuid("user_id").notNullable();
  table.string("route_name", 128).notNullable();

  table.timestamp("created_at").defaultTo(knex.fn.now());
  table.timestamp("updated_at").defaultTo(knex.fn.now());

  table.string("origin", 256).notNullable(); // empty string is valid

  table.string("destination", 256).notNullable();
  table.string("mode", 10).notNullable();
  table.string("units", 10).notNullable();
  table.boolean("alt_routes").notNullable();
  table.boolean("avoid_ferries").notNullable();
  table.boolean("avoid_highways").notNullable();
  table.boolean("avoid_indoor").notNullable();
  table.boolean("avoid_tolls").notNullable();

  table.integer("lat"); 
  table.integer("lng");

  table.foreign('user_id').references("users.id").onDelete("CASCADE");
  
}

/**
 * Given a knex instance, instantiates callbacks to initialize tables.
 * @param {Knex} knex 
 */
const tableSchemaInit = knex => {
  return {
    users: table => usersTS(table),
    savedDirections: table => savedDirectionsTS(table, knex)
  }
}

module.exports = tableSchemaInit;