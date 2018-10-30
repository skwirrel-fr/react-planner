const path = require('path');

const root = path.resolve(__dirname, '../..');

/* istanbul ignore next */
module.exports = {
  proxy: {
    origin: process.env.ENABLE_CHANGE_ORIGIN_PROXY === 'true'
  },
  services: {
    porte: {
      url: process.env.PORTE_API_URL || 'http://localhost:3066',
      defaultTimeout: parseInt(process.env.PORTE_TIMEOUT, 10) || 10000
    }
  },
  serveHtml: process.env.NODE_ENV !== 'development',
  clientRoot: path.resolve(root, process.env.CLIENT_PATH || '../client/demo/dist'),
  port: process.env.PORT || '4000',
  exitTimeout: parseInt(process.env.EXIT_TIMEOUT || '3000', 10),
  env: process.env.NODE_ENV || 'test',
  adminToken:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZG1pbl91dWlkIjoiOTllMTg3MGYtYTg4OC00ZGYxLWEzOTctNmQ4ZmYyZjdiYWM4IiwidXVpZCI6Ijk5ZTE4NzBmLWE4ODgtNGRmMS1hMzk3LTZkOGZmMmY3YmFjOCIsImFjdGlvblN0YXR1cyI6ImVycm9yIiwiY29tcGFueU5hbWUiOiIiLCJmaXJzdG5hbWUiOiJHYXJ5IiwibGFzdG5hbWUiOiJNY0Rvd2VsbCIsImxvZ29Vc2VyIjoiIiwicm9sZSI6ImFkbWluIiwidHlwZSI6IkFkbWluaXN0cmF0b3JfZGVmYXVsdCIsImVudiI6InByZXByb2QiLCJpYXQiOjE1MTc4NDAxNjN9.shG4oPIA6pgtbBAJo7GlSOEiYf-s5Km6BPzJE7mf4fs'
};
