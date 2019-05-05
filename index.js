const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const logger = require("./utils/logger")(__filename);
const app = express();
const router = require("./router");
const mongoose = require("mongoose");
const cors = require("cors");

const keys = require("./config/keys");

// cd C:\Users\xmobl\Documents\GitRepos\wayfarer-2\server
// Db setup
mongoose.connect(keys.mongoURI, { 
  useNewUrlParser: true,
  // sets how many times to try reconnecting (will be used if connection is interrupted)
  reconnectTries: 10,
  // sets the delay between every retry (milliseconds)
  reconnectInterval: 1000 
});


// App Setup (middlewares and route instantiation)
app.use(morgan("combined", { 
  stream: { 
    write: message => logger.morgan(message.trim()) 
  }
}));
app.use(bodyParser.json({ type: "*/*", limit: '10mb' }));
app.use(cors({ origin: keys.origin }));
router(app);
app.use(require("./middlewares/errorHandler")); // important that this is defined after the router.

// Server Setup

const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
logger.info("Server listening on: " + port);