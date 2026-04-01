import type { FastifyPluginAsync } from 'fastify';

import { okEnvelope } from '../lib/okEnvelope.js';
import { loadGetV1ResourcesSchemaData } from '../store/get-v1-resources-schema.js';

const success = {
  type: 'object',
  required: ['code', 'message', 'data', 'success'],
  properties: {
    code: { type: 'integer', enum: [200] },
    message: { type: 'string' },
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'array',
      items: { type: 'object', additionalProperties: true },
    },
  },
} as const;

const getV1ResourcesSchema: FastifyPluginAsync = async (app) => {
  app.get(
    '/v1/resources/schema',
    {
      schema: {
        tags: ['resources'],
        summary: 'Resource schema',
        description: 'Static list from `data/store/get_v1_resources_schema.json` (auditable query ignored for mock).',
        querystring: {
          type: 'object',
          additionalProperties: true,
          properties: {
            auditable: { type: 'string' },
          },
        },
        response: { 200: success },
      },
    },
    async (_req, reply) => reply.send(okEnvelope(loadGetV1ResourcesSchemaData())),
  );
};

export default getV1ResourcesSchema;
