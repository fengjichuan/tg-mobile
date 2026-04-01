import type { FastifyPluginAsync } from 'fastify';

import { okEnvelope } from '../lib/okEnvelope.js';
import { loadGetV1DashboardsFirewallSummaryData } from '../store/get-v1-dashboards-firewall-summary.js';

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

const getV1DashboardsFirewallSummary: FastifyPluginAsync = async (app) => {
  app.get(
    '/v1/dashboards/firewall-summary',
    {
      schema: {
        tags: ['dashboards'],
        summary: 'Firewall summary',
        description: 'Static payload from `data/store/get_v1_dashboards_firewall_summary.json`.',
        response: { 200: success },
      },
    },
    async (_req, reply) => reply.send(okEnvelope(loadGetV1DashboardsFirewallSummaryData())),
  );
};

export default getV1DashboardsFirewallSummary;
