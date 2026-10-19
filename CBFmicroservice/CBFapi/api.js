const fs = require('fs');

const express = require('express');
const cors = require('cors');

const dataRequestCBF = require(appRoot + '/CBFbackend/sockets/dataRequest');

function api(app, router) {
  const baseURL = '/api/v1';


  const auth = require(appRoot + '/CBFbackend/middleware/auth');

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
        case 'CBF':
          dataRequestCBF(ws, message);
          break;
        default:
          console.log('Unknown message type');
          break;
      }
    });
  });

  // Add authentication middleware
  app.use(baseURL, auth);

  fs.readdirSync(`${appRoot}/CBFapi/endpoints`).forEach((file) => {
    if (file.endsWith('.js')) {
      const endpoint = require(`${appRoot}/CBFapi/endpoints/${file}`);
      app.use(baseURL, endpoint);
    }
  });
}

module.exports = api;