const logger = require('@skwirrel-mem/skwirrel-logger');

const config = require('./config');
const PROCESSES = require('./processes');

/**
 * Map of all started processes
 */
const processes = new Map();

/**
 * Dynamically register a new process (mainly for testing)
 *
 * @param {Object} id
 * @param {Object} proc
 *
 * @returns {void}
 */
function register(id, proc) {
  PROCESSES[id] = proc;
}

/**
 * Execute the function after a minimal time delay
 *
 * @export
 * @param {function} func
 * @param {any} args
 * @returns {handler}
 */
function exitTimeout(func, ...args) {
  return new Promise((resolve, reject) => {
    const callback = () => {
      try {
        resolve(func.apply(null, ...args));
      } catch (err) {
        reject(err);
      }
    };

    if (config.exitTimeout > 0) {
      return setTimeout(callback, config.exitTimeout);
    }

    return setImmediate(callback);
  });
}

/**
 * Main application stopping process
 *
 * @param {string} code
 * @param {Error} [err]
 */
const stop = (code, err) => {
  /* istanbul ignore else */
  if (err) {
    logger.error({ err, code }, 'Application error');
  }

  logger.info({ code }, 'Application stopping');
  if (processes.size === 0) {
    return exitTimeout(() => {
      logger.info(`[${code}] Application stopped`);
      process.exit(1);
    });
  }

  const promises = Array.from(processes.values()).map(p => p.stop());
  processes.clear();

  return Promise.all(promises)
  .then(() => {
    logger.info({ code }, 'Application stopped');
    return exitTimeout(() => {
      process.exit(err ? 1 : 0);
    });
  })
  .catch(err2 => {
    logger.error({ err2, code }, 'Application crashed');
    return exitTimeout(() => {
      process.exit(1);
    });
  })
  .catch(err3 => {
    /**
     * Panic crash!
     */
    console.error('Panic crash!', err3); // eslint-disable-line no-console
    process.exit(1);
  });
};

/**
 * Stop the process on sigterm
 */
function sigterm() {
  return stop('SIGTERM');
}

/**
 * Stop the process on sigint
 *
 * @export
 * @returns
 */
function sigint() {
  return stop('SIGINT');
}

/* istanbul ignore next */
/**
 * Stop the process on uncaughtException
 *
 * @export
 * @param {string} proc Process id
 * @returns
 */
function uncaughtException(err) {
  return stop('uncaughtException', err);
}

/* istanbul ignore next */
/**
 * Stop the process on unhandledRejection
 *
 * @export
 * @param {string} proc Process id
 * @returns
 */
function unhandledRejection(err) {
  return stop('unhandledRejection', err);
}

/**
 * Bind process events
 *
 * @export
 * @param {string} proc Process id to bind on process event handlers
 */
function bindProcess() {
  process.removeListener('SIGTERM', sigterm);
  process.removeListener('SIGINT', sigint);
  process.removeListener('uncaughtException', uncaughtException);
  process.removeListener('unhandledRejection', unhandledRejection);

  process.once('SIGTERM', sigterm);
  process.once('SIGINT', sigint);
  process.once('uncaughtException', uncaughtException);
  process.once('unhandledRejection', unhandledRejection);
}

/**
 * Main application entry point
 *
 * @param {string} proc   Process id to start
 * @param {string[]} args Process execution arguments
 * @returns {Promise}
 */
const start = async (proc, ...args) => {
  if (!PROCESSES[proc]) {
    throw new Error('Invalid process');
  }

  bindProcess(proc);

  const p = await PROCESSES[proc].start.apply(null, args);
  processes.set([proc, ...args], PROCESSES[proc]);

  logger.info({ proc, args }, 'Application started');

  return p;
};

/* istanbul ignore if */
if (!module.parent) {
  if (process.argv.length < 3) {
    process.exit(0);
  }

  start(process.argv[2], ...process.argv.slice(3))
  .catch(err => stop('uncaughtException', err));
}

module.exports = {
  register,
  start,
  stop
};
