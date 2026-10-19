// *** IMPORTANT ***
// @todo: All the queries to the database should be abstracted
// and moved to a separate file in the GPTbackend directory.
// @todo: Make the endpoints elastic to the amount of arguments
// they take.

const fs = require('fs');

const express = require('express');
const cors = require('cors');

const dataRequestGPT = require(appRoot + '/GPTbackend/sockets/dataRequest');

function api(app, router) {
  const baseURL = '/api/v1';

  // const debugHeaders = require(appRoot + '/GPTbackend/middleware/debugHeaders');

  const auth = require(appRoot + '/GPTbackend/middleware/auth');

  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Debug headers
  // app.use(debugHeaders);

  app.use(baseURL, router);

  // Add the web socket support
  // @todo: maybe we should add this after the auth middleware?
  app.ws(`/ws`, function (ws, req) {
    console.log('Web socket connected');
    ws.on('message', async function (msg) {
      const message = JSON.parse(msg);
      switch (message.type) {
        case 'GPT':
          dataRequestGPT(ws, message);
          break;
        default:
          console.log('Unknown message type');
          break;
      }
    });
  });

  // Add authentication middleware
  app.use(baseURL, auth);

  fs.readdirSync(`${appRoot}/GPTapi/endpoints`).forEach((file) => {
    if (file.endsWith('.js')) {
      const endpoint = require(`${appRoot}/GPTapi/endpoints/${file}`);
      app.use(baseURL, endpoint);
    }
  });
}

module.exports = api;