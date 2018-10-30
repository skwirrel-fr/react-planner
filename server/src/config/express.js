const _ = require('lodash');
const express = require('express');
const expressMiddleware = require('@skwirrel-mem/express-middleware');
const logger = require('@skwirrel-mem/skwirrel-logger');
const request = require('superagent');

const config = require('../config');
const errorHandler = require('../web/middlewares/errorHandler');

/**
 * Express post swagger registration configuration
 *
 * @param {Express} app Express application instance
 * @return {void}
 */
function post(app) {
  /**
   * Note: the following `next` is important because if its not present, the function
   * will not be called at all.
   */
  /* istanbul ignore next */
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (typeof err !== 'object') {
      // If the object is not an Error, create a representation that appears to be
      err = { // eslint-disable-line no-param-reassign
        status: 500,
        message: String(err) // Coerce to string
      };
    } else {
      // Ensure that err.message is enumerable (It is not by default)
      Object.defineProperty(err, 'message', { enumerable: true });
      Object.defineProperty(err, 'status', {
        enumerable: true,
        value: err.status || 500
      });
    }

    /* istanbul ignore next */
    return res.status(err.status).json({
      code: err.status,
      message: err.message
    });
  });

  return app;
}

/**
 * Configure the Express app with default configuration
 *
 * @export
 * @param {Object} app application
 * @returns {Object} Configured Express application
 */
function configure(app) {
  /**
   * Heartbeat activation
   */
  app.get('/api/ping', (req, res) => res.status(200).json({
    status: 'true'
  }));

  /* istanbul ignore if */
  if (config.serveHtml) {
    logger.info({ path: config.clientRoot }, '[config#express#configure] Serving static HTML');
    app.use(express.static(config.clientRoot));
  }

  app.use(expressMiddleware.jwtToken());

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Request-Token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    if (req.method === 'OPTIONS') {
      return res.send();
    }

    return next();
  });

  app.set('port', config.port);

  app.postConfig = () => post(app);

  app.use(errorHandler);

  return app;
}

module.exports = {
  configure
};
