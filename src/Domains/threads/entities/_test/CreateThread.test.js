const CreateThread = require('../CreateThread');

describe('a CreateThread entities', () => {
  it('should throw error when payload length is not 2', () => {
    const payload = {
      title: 'A Thread',
    };

    expect(() => new CreateThread(payload)).toThrowError('CREATE_THREAD.PAYLOAD_LENGTH_SHOULD_BE_2');
  });
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'A thread',
      owner: 'user-1234',
    };
    expect(() => new CreateThread(payload)).toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 'A thread',
      body: true,
    };

    expect(() => new CreateThread(payload)).toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create thread object correctly', () => {
    const payload = {
      title: 'A thread',
      body: 'thread body',
    };

    const { title, body } = new CreateThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
