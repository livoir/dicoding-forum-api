const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'thread-owner' });
    await UsersTableTestHelper.addUser({ id: 'user-234' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-1234', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist added comment', async () => {
      const addComment = new AddComment({
        content: 'comment',
      });

      const fakeIdGenerator = () => '1234';
      const owner = 'user-234';
      const threadId = 'thread-1234';

      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepository.addComment(addComment, owner, threadId);

      const comments = await CommentsTableTestHelper.findCommentById('comment-1234');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const addComment = new AddComment({
        content: 'comment',
      });

      const fakeIdGenerator = () => '1234';
      const owner = 'user-234';
      const threadId = 'thread-1234';

      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepository.addComment(addComment, owner, threadId);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-1234',
        content: addComment.content,
        owner: 'user-234',
      }));
    });
  });

  describe('findCommentById function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, {});
      const commentId = 'comment-1234';
      await CommentsTableTestHelper.addComment({ id: commentId });

      await expect(commentRepository.findCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return comment if available', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, {});
      const addComment = {
        id: 'comment-1234',
        content: 'comment',
        owner: 'user-234',
        threadId: 'thread-1234',
        date: '2021-02-04',
      };
      await CommentsTableTestHelper.addComment(addComment);

      const comments = await commentRepository.findCommentById(addComment.id);

      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual(addComment.id);
      expect(comments[0].content).toEqual(addComment.content);
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].date).toEqual(addComment.date);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if comment belongs to other user', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, {});
      const commentId = 'comment-1234';
      await CommentsTableTestHelper.addComment({ id: commentId, owner: 'user-123' });

      await expect(commentRepository.verifyCommentOwner(commentId, 'user-234')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError if comment belongs to the user', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, {});
      const commentId = 'comment-1234';
      const owner = 'user-123';
      await CommentsTableTestHelper.addComment({ id: commentId, owner });

      await expect(commentRepository.verifyCommentOwner(commentId, owner))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should delete comment from database', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, {});
      const commentId = 'comment-1234';
      await CommentsTableTestHelper.addComment({ id: commentId });

      await commentRepository.deleteComment(commentId);

      const comment = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comment).toHaveLength(1);
      expect(comment[0].isDeleted).toEqual(true);
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError if comment is not available', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, {});
      const commentId = 'comment-1234';
      await CommentsTableTestHelper.addComment({ id: commentId });

      await expect(commentRepository.verifyCommentAvailability('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError if comment is available', async () => {
      const addComment = {
        id: 'comment-1234',
        content: 'comment',
        owner: 'user-234',
        threadId: 'thread-1234',
        date: '2021-02-04',
      };
      await CommentsTableTestHelper.addComment(addComment);

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepository.verifyCommentAvailability(addComment.id))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('findCommentByThreadId function', () => {
    it('should return all comment belongs to thread id', async () => {
      const addComment = {
        id: 'comment-2345',
        threadId: 'thread-2345',
        content: 'comment threadId-2345',
        owner: 'user-234',
        date: '2022-01-02',
        is_deleted: false,
      };

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({ id: 'comment-1234', threadId: 'thread-1234' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-2345', owner: 'user-123' });
      await CommentsTableTestHelper.addComment(addComment);

      const comments = await commentRepository.findCommentByThreadId(addComment.threadId);

      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual(addComment.id);
      expect(comments[0].content).toEqual(addComment.content);
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].date).toEqual(addComment.date);
      expect(comments[0].isDeleted).toEqual(false);
    });
  });
});
