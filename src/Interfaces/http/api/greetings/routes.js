const routes = (handler) => ([
  {
    method: 'GET',
    path: '/',
    handler: handler.getGreetingMessage,
  },
]);

module.exports = routes;
