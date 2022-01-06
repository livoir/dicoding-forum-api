const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { content, owner, threadId } = useCasePayload;
    const addComment = new AddComment({ content });
    await this._threadRepository.verifyThreadAvailability(threadId);
    return this._commentRepository.addComment(addComment, owner, threadId);
  }
}

module.exports = AddCommentUseCase;
