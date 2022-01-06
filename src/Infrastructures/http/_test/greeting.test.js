const container = require('../../container');
const createServer = require('../createServer');

describe('GET / endpoint', () => {
  it('should response with 200 status code and "Hello, Welcome to FORUM-API" message', async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: 'GET',
      url: '/',
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.message).toEqual('Hello, Welcome to FORUM-API');
  });
});
