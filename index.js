const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const router = require("./router");
const mongoose = require("mongoose");

const keys = require("./config/keys");

// cd C:\Users\xmobl\Documents\GitRepos\wayfarer-2\server
// Db setup
mongoose.connect(keys.mongoURI, { useNewUrlParser: true });


// App Setup (middlewares and route instantiation)
app.use(morgan("combined"));
app.use(bodyParser.json({ type: "*/*" }));
router(app);

// Server Setup

const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log("Server listening on:", port);