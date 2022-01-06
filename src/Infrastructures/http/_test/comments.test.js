const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('POST and DELETE comment endpoint', () => {
  beforeAll(async () => {
    const server = await createServer(container);
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'password',
        fullname: 'Dicoding Indonesia',
      },
    });
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'iqbal',
        password: 'password',
        fullname: 'Iqbal Alfikri',
      },
    });
    const responseJson = JSON.parse(response.payload);
    await ThreadsTableTestHelper.addThread({ id: 'thread-1234', owner: responseJson.data.addedUser.id });
    await CommentsTableTestHelper.addComment({ id: 'comment-9999', owner: responseJson.data.addedUser.id });
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const requestPayload = {
        content: 'comment',
      };
      const server = await createServer(container);

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'iqbal',
          password: 'password',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-1234/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const server = await createServer(container);

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'iqbal',
          password: 'password',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-1234/comments',
        payload: { a: true },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 401 if token is invalid', async () => {
      const requestPayload = {
        content: 'comment',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-1234/comments',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if thread id is not found', async () => {
      const requestPayload = {
        content: 'comment',
      };

      const server = await createServer(container);

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'iqbal',
          password: 'password',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread id tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 404 if thread is not available', async () => {
      const server = await createServer(container);
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'iqbal',
          password: 'password',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-1234',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread id tidak ditemukan');
    });

    it('should response 404 if comment is not available', async () => {
      const server = await createServer(container);
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'iqbal',
          password: 'password',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-1234/comments/comment-123',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment id tidak ditemukan');
    });

    it('should reponse 403 if the comment belongs to other user', async () => {
      const server = await createServer(container);
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'iqbal',
          password: 'password',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-1234/comments/comment-9999',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak mengakses resource ini');
    });

    it('should response 200 and delete comment', async () => {
      const server = await createServer(container);
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'password',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-1234/comments/comment-9999',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('success');
      expect(response.statusCode).toEqual(200);
    });
  });
});
