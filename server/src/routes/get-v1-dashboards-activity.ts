import type { FastifyPluginAsync } from 'fastify';

import { okEnvelope } from '../lib/okEnvelope.js';
import { loadGetV1DashboardsActivityData } from '../store/get-v1-dashboards-activity.js';

const success = {
  type: 'object',
  required: ['code', 'message', 'data', 'success'],
  properties: {
    code: { type: 'integer', enum: [200] },
    message: { type: 'string' },
    success: { type: 'boolean', enum: [true] },
    data: { type: 'object', additionalProperties: true },
  },
} as const;

const getV1DashboardsActivity: FastifyPluginAsync = async (app) => {
  app.get(
    '/v1/dashboards/activity',
    {
      schema: {
        tags: ['dashboards'],
        summary: 'Dashboard activity',
        description: 'Static payload from `data/store/get_v1_dashboards_activity.json` (pagination query ignored for mock).',
        querystring: {
          type: 'object',
          additionalProperties: true,
          properties: {
            page_no: { type: 'string' },
            page_size: { type: 'string' },
            created_after: { type: 'string' },
          },
        },
        response: { 200: success },
      },
    },
    async (_req, reply) => reply.send(okEnvelope(loadGetV1DashboardsActivityData())),
  );
};

export default getV1DashboardsActivity;
