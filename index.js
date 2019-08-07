const app = require("express")();
const http = require("http");
const passport = require("passport");

// middlewares
const bodyParser = require("body-parser");
const morgan = require("morgan");
const logger = require("./utils/logger")(__filename);
const cors = require("cors");

// custom middlewares
const { validateKey, schemaValidator, errorHandler } = require("./middlewares");
const { passport: { localLogin } } = require("./services");

const router = require("./router");
const { origin } = require("./config");



const initDb = async () => {
  await require("./db").tableInit();
}

const initApp = () => {
  // app.use() allows global middleware and other setting configuration
  // Instantiate morgan logging for http requests. Will write its logs to Winston.
  app.use(morgan("combined", { 
    stream: { 
      write: message => logger.morgan(message.trim()) 
    }
  }));
  app.use(bodyParser.json({ type: "*/*", limit: '2mb' }));

  // allow requests from specific route
  app.use(cors({ origin }));

  // use custom middlewares
  app.use(validateKey);
  app.use(schemaValidator);

  // connect passport jwt strategy to passport
  passport.use(localLogin);

  // initialize routes
  router(app);

  // central error handler that is accessed with next callback with an Error as an argument.
  // important that this is defined after the router.
  app.use(errorHandler);

  // Server Setup
  const port = process.env.PORT || 3090;
  const server = http.createServer(app);
  server.listen(port);
  logger.info("Server listening on: " + port);
}

initDb().then(() => initApp()).catch(err => {
  logger.error("Server initialization failed with err", err);
})
