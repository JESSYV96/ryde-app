import 'dotenv/config';

import { buildWorker } from './composition/worker';

const main = async () => {
  const { rabbit } = await buildWorker();
  console.log('Payment worker started');

  const shutdown = async () => {
    await rabbit.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

main().catch((error) => {
  console.error('Failed to start payment worker:', error);
  process.exit(1);
});
