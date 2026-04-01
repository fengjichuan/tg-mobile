import type { FastifyPluginAsync } from 'fastify';

import { ensureGetV1UsersDashStore, loadProfileForUserId } from '../store/get-v1-users-dash.js';
import { findUserIdByToken } from '../store/post-v1-users-login.js';

function parseBearerToken(header: string | undefined): string | undefined {
  if (!header || typeof header !== 'string') return undefined;
  const t = header.trim();
  if (t.toLowerCase().startsWith('bearer ')) return t.slice(7).trim();
  return t || undefined;
}

const successResponse = {
  type: 'object',
  required: ['code', 'message', 'data', 'success'],
  properties: {
    code: { type: 'integer', enum: [200] },
    message: { type: 'string', example: 'Success' },
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      additionalProperties: true,
      description: 'Payload from `data/store/get_v1_users_dash.json` for this user_id',
    },
  },
} as const;

const unauthorizedResponse = {
  type: 'object',
  required: ['code', 'message', 'data', 'success'],
  properties: {
    code: { type: 'integer', example: 4000001 },
    message: { type: 'string' },
    success: { type: 'boolean', enum: [false] },
    data: { type: 'null' },
  },
} as const;

const notFoundResponse = {
  type: 'object',
  required: ['code', 'message', 'data', 'success'],
  properties: {
    code: { type: 'integer', example: 404 },
    message: { type: 'string' },
    success: { type: 'boolean', enum: [false] },
    data: { type: 'null' },
  },
} as const;

const getV1UsersDash: FastifyPluginAsync = async (app) => {
  ensureGetV1UsersDashStore();

  app.get(
    '/v1/users/-',
    {
      schema: {
        tags: ['users'],
        summary: 'Current user',
        description:
          'Returns profile from `data/store/get_v1_users_dash.json`. Token must exist in `post_v1_users_login.json` sessions.',
        security: [{ tokenAuth: [] }],
        response: {
          200: successResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    async (request, reply) => {
      const token = parseBearerToken(request.headers.authorization);
      const userId = token ? findUserIdByToken(token) : undefined;
      if (userId === undefined) {
        return reply.status(401).send({
          code: 4000001,
          message: 'Unauthorized',
          data: null,
          success: false as const,
        });
      }

      const profile = loadProfileForUserId(userId);
      if (!profile) {
        return reply.status(404).send({
          code: 404,
          message: 'User profile not found',
          data: null,
          success: false as const,
        });
      }

      const ip = request.ip || '127.0.0.1';
      const now = new Date().toISOString();

      return reply.send({
        code: 200 as const,
        message: 'Success' as const,
        data: {
          ...profile,
          current_login_ip: ip,
          current_login_time: now,
        },
        success: true as const,
      });
    },
  );
};

export default getV1UsersDash;
