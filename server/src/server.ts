import { buildApp } from './app.js';

const port = Number(process.env.PORT) || 8080;
const host = process.env.HOST || '0.0.0.0';

const app = await buildApp();

try {
  await app.listen({ port, host });
  app.log.info(`Listening on http://${host}:${port}`);
  app.log.info(`OpenAPI UI: http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}/docs`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
