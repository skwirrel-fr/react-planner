const http = require('http');
const logger = require('@skwirrel-mem/skwirrel-logger');

const express = require('express');

const config = require('../config');
const { configure } = require('../config/express');

let app;
let server;

/**
 * Minimal heartbeat server initialization
 *
 * @returns {Promise}
 */
async function start() {
  if (app) {
    return app;
  }

  logger.info({ port: config.port }, 'Express web server creation');

  app = configure(express());
  server = http.createServer(app);

  // After all middlewares definition:
  app.postConfig();

  await server.listen(config.port);

  return app;
}

/**
 * Close the HTTP server
 *
 * @returns
 */
async function stop() {
  if (server) {
    await server.close();
    server = null;
    app = null;
  }
}

module.exports = {
  start,
  stop,
  get server() {
    return server;
  },
  get app() {
    return app;
  }
};
