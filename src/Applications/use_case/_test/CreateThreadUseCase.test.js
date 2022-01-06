const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreateThreadUseCase = require('../CreateThreadUseCase');

describe('CreateThreadUseCase', () => {
  it('should orchestrating the create thread action correctly', async () => {
    const owner = 'user-1234';

    const useCasePayload = {
      title: 'A Thread',
      body: 'thread body',
      owner,
    };

    const expectedCreateThread = new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.createThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedCreateThread));

    const createThreadUseCase = new CreateThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const createdThread = await createThreadUseCase.execute(useCasePayload);
    expect(createdThread).toStrictEqual(expectedCreateThread);
    expect(mockThreadRepository.createThread)
      .toBeCalledWith(new CreateThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }), owner);
  });
});
