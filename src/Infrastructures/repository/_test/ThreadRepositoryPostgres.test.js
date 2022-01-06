const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-234', username: 'dicoding' });
  });
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('createThread function', () => {
    it('should return created thread correctly', async () => {
      const createThread = new CreateThread({
        title: 'A thread',
        body: 'Thread body',
      });

      const fakeIdGenerator = () => '1234';
      const fakeOwner = 'user-234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      const createdThread = await threadRepositoryPostgres.createThread(createThread, fakeOwner);

      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-1234',
        title: 'A thread',
        owner: 'user-234',
      }));
    });
    it('should persist create thread and return created thread correctly', async () => {
      const createThread = new CreateThread({
        title: 'A Thread',
        body: 'Thread body',
      });

      const fakeIdGenerator = () => '1234';
      const fakeOwner = 'user-234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      await threadRepositoryPostgres.createThread(createThread, fakeOwner);

      const thread = await ThreadsTableTestHelper.findThreadById('thread-1234');
      expect(thread).toHaveLength(1);
    });
  });

  describe('findThreadById function', () => {
    it('should throw NotFoundError if thread not available', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      const threadId = 'thread-1234';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-234' });

      await expect(threadRepository.findThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread if available', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      const payload = {
        id: 'thread-1234',
        owner: 'user-234',
        body: 'body',
        title: 'thread',
        date: '2022-01-02',
      };

      const expectedResult = {
        id: payload.id,
        username: 'dicoding',
        body: payload.body,
        title: payload.title,
        date: payload.date,
      };
      await ThreadsTableTestHelper.addThread(payload);

      const thread = await threadRepository.findThreadById(payload.id);

      expect(thread).toStrictEqual(expectedResult);
    });
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError if thread is not available', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      const threadId = 'thread-1234';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-234' });

      await expect(threadRepository.findThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError if thread is available', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      const threadId = 'thread-1234';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-234' });

      await expect(threadRepository.findThreadById(threadId))
        .resolves.not.toThrowError(NotFoundError);
    });
  });
});
