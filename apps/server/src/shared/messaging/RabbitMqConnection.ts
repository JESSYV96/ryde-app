import amqp, { type ChannelModel, type ConfirmChannel } from 'amqplib';

// Generic RabbitMQ connection helper (shared kernel). Owns a single connection
// and confirm channel; it knows nothing about any feature's topology — each
// slice asserts its own exchanges/queues on the channel it gets back.
export class RabbitMqConnection {
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;

  constructor(private readonly url: string) {}

  // Connect with a simple bounded retry so a process can boot slightly before
  // the broker is ready (e.g. docker compose still starting).
  async connect(retries = 10, delayMs = 2000): Promise<ConfirmChannel> {
    for (let attempt = 1; ; attempt++) {
      try {
        this.connection = await amqp.connect(this.url);
        this.connection.on('error', (err: Error) =>
          console.error('RabbitMQ connection error:', err.message)
        );
        this.connection.on('close', () => console.warn('RabbitMQ connection closed'));

        this.channel = await this.connection.createConfirmChannel();
        console.log('RabbitMQ connected');
        return this.channel;
      } catch (error) {
        if (attempt >= retries) {
          throw error;
        }
        console.warn(
          `RabbitMQ connect failed (attempt ${attempt}/${retries}); retrying in ${delayMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  get confirmChannel(): ConfirmChannel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized — call connect() first');
    }
    return this.channel;
  }

  async close(): Promise<void> {
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }
}
