import type { FastifyPluginAsync } from 'fastify';

import getV1DashboardsActivity from './get-v1-dashboards-activity.js';
import getV1DashboardsFirewallSummary from './get-v1-dashboards-firewall-summary.js';
import getV1DashboardsPolicySummary from './get-v1-dashboards-policy-summary.js';
import getV1DashboardsTrafficMap from './get-v1-dashboards-traffic-map.js';
import getV1DashboardsTrafficOverview from './get-v1-dashboards-traffic-overview.js';
import getV1DashboardsTrafficSummary from './get-v1-dashboards-traffic-summary.js';
import getV1ResourcesSchema from './get-v1-resources-schema.js';
import getV1UsersDash from './get-v1-users-dash.js';
import postV1UsersLogin from './post-v1-users-login.js';

/** Registers each HTTP route as its own plugin (one file per route). */
export const registerApiRoutes: FastifyPluginAsync = async (app) => {
  await app.register(postV1UsersLogin);
  await app.register(getV1UsersDash);
  await app.register(getV1DashboardsTrafficOverview);
  await app.register(getV1DashboardsTrafficSummary);
  await app.register(getV1DashboardsTrafficMap);
  await app.register(getV1DashboardsActivity);
  await app.register(getV1DashboardsPolicySummary);
  await app.register(getV1DashboardsFirewallSummary);
  await app.register(getV1ResourcesSchema);
};
