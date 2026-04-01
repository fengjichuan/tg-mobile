import { randomUUID } from 'node:crypto';

import type { FastifyPluginAsync } from 'fastify';

import type { LoginUserData } from '../types/api.js';
import {
  appendSession,
  ensurePostV1UsersLoginStore,
  findUserByCredentials,
} from '../store/post-v1-users-login.js';

const successResponse = {
  type: 'object',
  required: ['code', 'message', 'data', 'success'],
  properties: {
    code: { type: 'integer', enum: [200] },
    message: { type: 'string', example: 'Success' },
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      required: [
        'change_password',
        'pwd_strength',
        'user_id',
        'id_token_hint',
        'setting_two_factor',
        'logout_uri',
        'two_factor_authen',
        'token',
        'username',
      ],
      properties: {
        change_password: { type: 'boolean' },
        pwd_strength: { type: 'string', nullable: true },
        user_id: { type: 'integer' },
        id_token_hint: { type: 'string', nullable: true },
        setting_two_factor: { type: 'boolean' },
        logout_uri: { type: 'string', nullable: true },
        two_factor_authen: { type: 'boolean' },
        token: { type: 'string' },
        username: { type: 'string', nullable: true },
      },
    },
  },
} as const;

const errorResponse = {
  type: 'object',
  required: ['code', 'message', 'data', 'success'],
  properties: {
    code: { type: 'integer', example: 4000001 },
    message: { type: 'string' },
    success: { type: 'boolean', enum: [false] },
    data: { type: 'null' },
  },
} as const;

function buildToken(userId: number): string {
  return `${randomUUID()}&${userId}&`;
}

const postV1UsersLogin: FastifyPluginAsync = async (app) => {
  ensurePostV1UsersLoginStore();

  app.post(
    '/v1/users/login',
    {
      schema: {
        tags: ['users'],
        summary: 'User login',
        description: 'Authenticate with username and password; persists session in `data/store/post_v1_users_login.json`.',
        body: { $ref: 'PostV1UsersLoginBody#' },
        response: {
          200: successResponse,
          401: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const body = request.body as { username: string; password: string };
      const user = findUserByCredentials(body.username, body.password);
      if (!user) {
        return reply.status(401).send({
          code: 4000001,
          message: 'Invalid username or password',
          data: null,
          success: false as const,
        });
      }

      const token = buildToken(user.user_id);
      await appendSession(token, user.user_id);

      const data: LoginUserData = {
        change_password: false,
        pwd_strength: null,
        user_id: user.user_id,
        id_token_hint: null,
        setting_two_factor: false,
        logout_uri: null,
        two_factor_authen: false,
        token,
        username: null,
      };

      return reply.send({
        code: 200 as const,
        message: 'Success' as const,
        data,
        success: true as const,
      });
    },
  );
};

export default postV1UsersLogin;
