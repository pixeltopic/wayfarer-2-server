module.exports = {
  key: process.env.KEY, // required header key for api access
  origin: process.env.ORIGIN, // URL allowed to communicate with this api
  userSecret: process.env.USER_SECRET, // for jwt encoding and decoding
  mongoURI: process.env.MONGO_URI,
}