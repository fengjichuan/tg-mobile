import type { FastifyPluginAsync } from 'fastify';

import { okEnvelope } from '../lib/okEnvelope.js';
import { loadGetV1DashboardsTrafficMapData } from '../store/get-v1-dashboards-traffic-map.js';

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

const getV1DashboardsTrafficMap: FastifyPluginAsync = async (app) => {
  app.get(
    '/v1/dashboards/traffic-map',
    {
      schema: {
        tags: ['dashboards'],
        summary: 'Traffic map',
        description: 'Static payload from `data/store/get_v1_dashboards_traffic_map.json`.',
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
    async (_req, reply) => reply.send(okEnvelope(loadGetV1DashboardsTrafficMapData())),
  );
};

export default getV1DashboardsTrafficMap;
