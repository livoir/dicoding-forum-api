const CreateThread = require('../../Domains/threads/entities/CreateThread');

class CreateThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { title, body, owner } = useCasePayload;
    const createThread = new CreateThread({ title, body });
    return this._threadRepository.createThread(createThread, owner);
  }
}

module.exports = CreateThreadUseCase;
