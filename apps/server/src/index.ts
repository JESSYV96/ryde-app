import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { paymentLinksRouter } from './routes/paymentLinks';
import { webhooksRouter } from './routes/webhooks';

const app = express();
app.use(cors());

app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(webhooksRouter);

app.use(express.json());
app.use(paymentLinksRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/payment-success', (_req, res) => {
  res.send('<html><body><h1>Payment received — thank you!</h1></body></html>');
});

app.get('/payment-cancelled', (_req, res) => {
  res.send('<html><body><h1>Payment cancelled.</h1></body></html>');
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`Payment server listening on port ${port}`);
});
