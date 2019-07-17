const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const logger = require("./utils/logger")(__filename);
const app = express();
const passport = require("passport");
const { jwtLogin, localLogin } = require("./services").passport;
const router = require("./router");
const mongoose = require("mongoose");
const cors = require("cors");
// custom middlewares
const validateKey = require("./middlewares/validateKey");
const schemaValidator = require("./middlewares/schemaValidator");
const errorHandler = require("./middlewares/errorHandler");

const { mongoURI, origin} = require("./config");

// Db setup
mongoose.connect(mongoURI, { 
  useNewUrlParser: true,
  // sets how many times to try reconnecting (will be used if connection is interrupted)
  reconnectTries: 10,
  // sets the delay between every retry (milliseconds)
  reconnectInterval: 1000 
});

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
passport.use(jwtLogin);
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