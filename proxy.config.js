/**
 * Proxy configuration for webpack-dev-server.
 * Add or edit paths in the `context` array as needed.
 */
module.exports = [
  {
    context: [
      '/api',
      '/oauth2',
      '/swagger-ui',
      '/v3/api-docs',
      '/h2-console',
    ],
    target: 'http://localhost:8080',
    secure: false,     // ignore self-signed certs, if any
    changeOrigin: true,
    logLevel: 'debug', // helpful while developing
  },
];
