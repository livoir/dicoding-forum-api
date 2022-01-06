class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.findThreadById(threadId);
    thread.comments = await this._commentRepository.findCommentByThreadId(threadId);
    thread.comments.map((comment) => {
      comment.content = comment.isDeleted ? '**komentar telah dihapus**' : comment.content;
      delete comment.isDeleted;
    });
    return thread;
  }
}

module.exports = GetThreadDetailUseCase;
