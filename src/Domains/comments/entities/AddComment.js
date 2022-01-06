class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { content } = payload;
    this.content = content;
  }

  _verifyPayload(payload) {
    if (Object.keys(payload).length !== 1) {
      throw new Error('ADD_COMMENT.PAYLOAD_LENGTH_SHOULD_BE_1');
    }

    const { content } = payload;

    if (!content) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;
