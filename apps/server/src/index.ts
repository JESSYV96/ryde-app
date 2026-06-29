import 'dotenv/config';

import { buildApp } from './composition/container';

const { app, env } = buildApp();

app.listen(env.port, () => {
  console.log(`Payment server listening on port ${env.port}`);
});
