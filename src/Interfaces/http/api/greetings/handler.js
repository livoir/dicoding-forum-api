class GreetingHandler {
  constructor(container) {
    this._container = container;

    this.getGreetingMessage = this.getGreetingMessage.bind(this);
  }

  getGreetingMessage(request, h) {
    return h.response({
      status: 'success',
      message: 'Hello, Welcome to FORUM-API',
    });
  }
}

module.exports = GreetingHandler;
