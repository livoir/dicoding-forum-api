const GreetingsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'greeting',
  register: async (server, { container }) => {
    const greetingsHandler = new GreetingsHandler(container);
    server.route(routes(greetingsHandler));
  },
};
