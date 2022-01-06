const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const mapDBToCommentModel = require('../../Commons/utils/MapDBToCommentModel');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment, owner, threadId) {
    const { content } = comment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id=$1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id=$1 AND owner=$2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id=$1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment id tidak ditemukan');
    }
  }

  async findCommentByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, content, date, is_deleted, users.username FROM comments
             JOIN users ON users.id = comments.owner
             WHERE comments.thread_id=$1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToCommentModel);
  }
}

module.exports = CommentRepositoryPostgres;
