// Config
require('dotenv').config();

// Core libraries
const path = require('path');
const http = require('http');

// External libraries
const express = require('express');
const expressWs = require('express-ws');
const router = express.Router();
const app = express();

// Constants
const API_PORT = '3320';
global.appRoot = path.resolve(__dirname);

// Custom libraries
const api = require(appRoot + '/ATLapi/api');

const server = http.createServer(app);
// Add WebSocket support
global.wsSingleton = expressWs(app, server);
// Start the server
server.listen(API_PORT, async () => {
  console.log(`Listening on port ${API_PORT}`);

  const { mongoose } = require(appRoot + '/ATLdb/atldb');
  await mongoose();

  console.log('Connected to ATL database');

  // Bind our routes
  api(app, router);
});
