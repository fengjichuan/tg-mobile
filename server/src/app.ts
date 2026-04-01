import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';

import { registerApiRoutes } from './routes/index.js';
import { postV1UsersLoginBodySchema } from './routes/post-v1-users-login.openapi.js';

export async function buildApp() {

  const app = Fastify({
    logger: true,
    trustProxy: true,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.addSchema(postV1UsersLoginBodySchema);

  const defaultPublicOrigin =
    process.env.PUBLIC_API_ORIGIN || `http://127.0.0.1:${process.env.PORT || 8080}`;

  await app.register(swagger, {
    mode: 'dynamic',
    stripBasePath: false,
    hiddenTag: 'internal',
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'tg-mobile API',
        description: 'Lightweight JSON-backed API for mobile-h5',
        version: '0.0.1',
      },
      servers: [{ url: defaultPublicOrigin, description: 'API host (set PUBLIC_API_ORIGIN for docs / Try it out)' }],
      tags: [
        { name: 'users', description: 'User auth' },
        { name: 'dashboards', description: 'Dashboard home' },
        { name: 'resources', description: 'Resource metadata' },
      ],
      components: {
        securitySchemes: {
          tokenAuth: {
            type: 'http',
            scheme: 'bearer',
            description: 'Raw login token (same value as returned in `data.token`; axios may send without Bearer prefix).',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });

  await app.register(registerApiRoutes);

  app.get(
    '/health',
    { schema: { tags: ['internal'], hide: true, response: { 200: { type: 'object', properties: { ok: { type: 'boolean' } } } } } },
    async () => ({ ok: true }),
  );

  return app;
}
