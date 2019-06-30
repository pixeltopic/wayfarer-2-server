module.exports = {
  key: process.env.KEY, // required header key for api access
  origin: process.env.ORIGIN, // URL allowed to communicate with this api
  userSecret: process.env.USER_SECRET, // for jwt encoding and decoding
  tokenExpiryTime: process.env.TOKEN_EXPIRY_TIME,
  inactiveTokenTime: process.env.INACTIVE_TOKEN_TIME, // determines how long before an inactive token can no longer be refreshed.
  mongoURI: process.env.MONGO_URI,
  googleKey: process.env.GOOGLE_KEY, // google api key
  googleRecaptchaKey: process.env.GOOGLE_RECAPTCHA_KEY, // google recaptcha secret
  mapquestKey: process.env.MAPQUEST_KEY, // mapquest incidents key
  witaiKey: process.env.WITAI_KEY,
  enableRecaptcha: true // false if you want to use postman to make testing easier. Should always be true in prod env
}