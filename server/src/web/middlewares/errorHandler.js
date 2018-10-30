const http = require('http');
const logger = require('@skwirrel-mem/skwirrel-logger');

const config = require('../../config');

/**
 * Build Bad Request error from exception
 * @param  {Error} err Error object to format
 * @param  {Object} body Body of the response
 * @return {Boolean} true if error has been built, false otherwise
 */
function assignBadRequestError(err, body) {
  if (err.status === 400 && err.details) {
    err.details.forEach((v, k) => {
      body[k] = v;
    });
    return true;
  }
  return false;
}

/**
 * Build error from exception
 * @private
 * @param  {Error} err Error object to format
 * @param  {Object} body Body of the response
 * @return {void}
 */
function assignCommonError(err, body) {
  if (config.hideError && !err.expose) {
    // eslint-disable-next-line no-param-reassign
    body.detail = http.STATUS_CODES[err.status || 500];
  } else {
    // eslint-disable-next-line no-param-reassign
    body.detail = err.message;
  }
}

/**
 * Build Bad Request error from JOI ValidationError exception
 * @private
 * @param  {Error} err Error object to format
 * @param  {Object} body Body of the response
 * @return {Boolean} true if error has been built, false otherwise
 */
function assignJoiError(err, body) {
  if (err.name === 'ValidationError') {
    err.status = 400;
    err.details.forEach((detail) => {
      body[detail.context.key] = [detail.message];
    });
    return true;
  }
  return false;
}

/**
 * Express Error handler middleware
 * @param  {Object}   err  Express error
 * @param  {Object}   req  Express request
 * @param  {Object}   res  Express response
 * @param  {Function} next Express next handler
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
  if (!err) {
    return next();
  }

  const body = {};

  if (!assignJoiError(err, body)) {
    if (!assignBadRequestError(err, body)) {
      assignCommonError(err, body);
    }
  }

  const status = err.status || 500;
  body.status = status;

  if (!config.hideError) {
    body.stack = err.stack;
  }

  if (status >= 500) {
    logger.error({ err });
  } else {
    logger.info(err);
  }
  return res.status(status).send(body);
}

module.exports = errorHandler;
