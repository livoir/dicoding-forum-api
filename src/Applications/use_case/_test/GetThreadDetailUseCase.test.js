const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-1234',
    };

    const expectedThreadDetail = {
      id: 'thread-1234',
      title: 'A thread',
      body: 'thread body',
      date: '2021-01-02',
      username: 'dicoding',
      comments: [],
    };

    const expectedCommentsDetail = [
      {
        id: 'comment-1234',
        username: 'iqbal',
        date: '2021-01-02',
        content: 'Comment',
        isDeleted: false,
      },
      {
        id: 'comment-2345',
        username: 'dicoding',
        date: '2021-01-02',
        content: 'comment',
        isDeleted: true,
      },
    ];
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.findThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThreadDetail));

    mockCommentRepository.findCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedCommentsDetail));
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const thread = await getThreadDetailUseCase.execute(useCasePayload);
    expect(thread).toStrictEqual({
      body: 'thread body',
      date: '2021-01-02',
      id: 'thread-1234',
      title: 'A thread',
      username: 'dicoding',
      comments: [
        {
          content: 'Comment',
          date: '2021-01-02',
          id: 'comment-1234',
          username: 'iqbal',
        },
        {
          content: '**komentar telah dihapus**',
          date: '2021-01-02',
          id: 'comment-2345',
          username: 'dicoding',
        },
      ],
    });
    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.findCommentByThreadId).toBeCalledWith(useCasePayload.threadId);
  });
});
