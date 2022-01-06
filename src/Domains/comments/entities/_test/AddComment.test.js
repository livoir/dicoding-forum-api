const AddComment = require('../AddComment');

describe('a CreateComment entities', () => {
  it('should throw error when payload length is less than 1', () => {
    const payload = {};

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.PAYLOAD_LENGTH_SHOULD_BE_1');
  });

  it('should throw error when payload length is more than 1', () => {
    const payload = {
      content: 'comment',
      owner: 'user-1234',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.PAYLOAD_LENGTH_SHOULD_BE_1');
  });

  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      owner: 'user-1234',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: true,
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should add comment object correctly', () => {
    const payload = {
      content: 'comment',
    };

    const { content } = new AddComment(payload);

    expect(content).toEqual(payload.content);
  });
});
