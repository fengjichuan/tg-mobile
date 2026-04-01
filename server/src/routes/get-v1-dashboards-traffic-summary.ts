import type { FastifyPluginAsync } from 'fastify';

import { okEnvelope } from '../lib/okEnvelope.js';
import { loadGetV1DashboardsTrafficSummaryData } from '../store/get-v1-dashboards-traffic-summary.js';

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

const getV1DashboardsTrafficSummary: FastifyPluginAsync = async (app) => {
  app.get(
    '/v1/dashboards/traffic-summary',
    {
      schema: {
        tags: ['dashboards'],
        summary: 'Traffic summary',
        description: 'Static payload from `data/store/get_v1_dashboards_traffic_summary.json` (289-point list generated for charts).',
        querystring: {
          type: 'object',
          additionalProperties: true,
          properties: {
            start_time: { type: 'string' },
            end_time: { type: 'string' },
          },
        },
        response: { 200: success },
      },
    },
    async (_req, reply) => reply.send(okEnvelope(loadGetV1DashboardsTrafficSummaryData())),
  );
};

export default getV1DashboardsTrafficSummary;
