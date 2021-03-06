module.exports = {
  key: process.env.KEY, // required header key for api access
  origin: process.env.ORIGIN, // URL allowed to communicate with this api
  userSecret: process.env.USER_SECRET, // for jwt encoding and decoding
  tokenExpiryTime: process.env.TOKEN_EXPIRY_TIME,
  inactiveTokenTime: process.env.INACTIVE_TOKEN_TIME, // determines how long before an inactive token can no longer be refreshed.
  mongoURI: process.env.MONGO_URI, // now obsolete with the migration of MySQL
  googleKey: process.env.GOOGLE_KEY, // google api key
  googleRecaptchaKey: process.env.GOOGLE_RECAPTCHA_KEY, // google recaptcha secret
  mapquestKey: process.env.MAPQUEST_KEY, // mapquest incidents key
  witaiKey: process.env.WITAI_KEY,
  enableRecaptcha: true, // false if you want to use postman to make testing easier. Should always be true in prod env
  database: {
    driver: process.env.DB_DRIVER, // name of the underlying data store (MySQL, PostgresQL, MariaDB, etc)
    host: process.env.DB_HOST, // database host (only the ip)
    user: process.env.DB_USER, // database login username
    pass: process.env.DB_PASS, // database login password
    name: process.env.DB_NAME, // database name (wayfarerdev, wayfarerprod)
    minConnections: process.env.DB_MIN_CONN, // minimum and max connections in the connection pool
    maxConnections: process.env.DB_MAX_CONN,
  },
}