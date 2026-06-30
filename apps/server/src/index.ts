import 'dotenv/config';

import { buildApp } from './composition/container';

const main = async () => {
  const { app, env, rabbit } = await buildApp();

  const server = app.listen(env.port, () => {
    console.log(`Payment server listening on port ${env.port}`);
  });

  const shutdown = async () => {
    server.close();
    await rabbit.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

main().catch((error) => {
  console.error('Failed to start payment server:', error);
  process.exit(1);
});
