/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment(
    {
      id = 'comment-1234',
      content = 'comment',
      owner = 'user-123',
      threadId = 'thread-1234',
      date = '2021-02-04',
    },
  ) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, owner, date, false],
    };

    await pool.query(query);
  },

  async findCommentById(commentId) {
    const query = {
      text: `SELECT comments.id, content, date, users.username, is_deleted FROM comments
            JOIN users ON users.id = comments.owner WHERE comments.id=$1`,
      values: [commentId],
    };

    const result = await pool.query(query);

    const mappedResult = result.rows.map(({

      id,
      content,
      date,
      username,
      is_deleted,
    }) => ({
      id,
      content,
      date,
      username,
      isDeleted: is_deleted,
    }));

    return mappedResult;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
