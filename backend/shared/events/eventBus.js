"use strict";

const amqplib = require("amqplib");

/**
 * RabbitMQ-based Event Bus
 *
 * Provides publish/subscribe messaging between microservices.
 * Each service connects to a shared RabbitMQ instance and can:
 *   - publish(eventType, payload)   → fan-out to all subscribers
 *   - subscribe(eventType, handler) → receive events of that type
 *
 * Uses a topic exchange so services only receive events they care about.
 * Connection is lazy — established on first publish or subscribe call.
 */

const EXCHANGE_NAME = "gpa_events";
const EXCHANGE_TYPE = "topic";

let connection = null;
let channel = null;
let connecting = null;

async function connect(rabbitUrl) {
  if (channel) return channel;

  // Prevent concurrent connection attempts
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      connection = await amqplib.connect(rabbitUrl);
      channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
        durable: true,
      });

      // Handle connection errors gracefully
      connection.on("error", (err) => {
        console.error("[EventBus] Connection error:", err.message);
        channel = null;
        connection = null;
        connecting = null;
      });

      connection.on("close", () => {
        console.error("[EventBus] Connection closed, will reconnect on next use");
        channel = null;
        connection = null;
        connecting = null;
      });

      return channel;
    } catch (err) {
      connecting = null;
      throw err;
    }
  })();

  return connecting;
}

/**
 * Publish an event to the bus.
 *
 * @param {string} eventType  - Dot-delimited event type (e.g. "task.created")
 * @param {object} payload    - Event data
 * @param {object} options
 * @param {string} options.rabbitUrl - RabbitMQ connection URL
 * @param {object} [options.logger]  - Logger instance
 */
async function publish(eventType, payload, { rabbitUrl, logger } = {}) {
  const log = logger || console;
  const url = rabbitUrl || process.env.RABBIT_URL;

  if (!url) {
    log.warn?.("[EventBus] RABBIT_URL not set, skipping publish", { eventType });
    return;
  }

  try {
    const ch = await connect(url);
    const message = {
      eventType,
      payload,
      timestamp: new Date().toISOString(),
      id: require("uuid").v4(),
    };

    ch.publish(
      EXCHANGE_NAME,
      eventType,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        contentType: "application/json",
      },
    );

    if (log.debug) {
      log.debug("Event published", { eventType, eventId: message.id });
    }
  } catch (err) {
    log.error?.("[EventBus] Publish failed", { eventType, err: err.message });
    // Don't throw — event publishing should not break the request flow
  }
}

/**
 * Subscribe to events of a given type.
 *
 * @param {string}   eventType   - Dot-delimited routing key (e.g. "task.#" for all task events)
 * @param {Function} handler     - async (message) => void
 * @param {object}   options
 * @param {string}   options.rabbitUrl    - RabbitMQ connection URL
 * @param {string}   options.serviceName  - Name of subscribing service (used as queue name)
 * @param {object}   [options.logger]     - Logger instance
 */
async function subscribe(eventType, handler, { rabbitUrl, serviceName, logger } = {}) {
  const log = logger || console;
  const url = rabbitUrl || process.env.RABBIT_URL;

  if (!url) {
    log.warn?.("[EventBus] RABBIT_URL not set, skipping subscribe", { eventType });
    return;
  }

  try {
    const ch = await connect(url);

    // Each service gets its own durable queue for each event pattern
    const queueName = `${serviceName}.${eventType}`;
    await ch.assertQueue(queueName, { durable: true });
    await ch.bindQueue(queueName, EXCHANGE_NAME, eventType);

    // Prefetch 1 for fair dispatch
    ch.prefetch(1);

    ch.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const parsed = JSON.parse(msg.content.toString());
        await handler(parsed);
        ch.ack(msg);
      } catch (err) {
        log.error?.("[EventBus] Handler failed", {
          eventType,
          error: err.message,
        });
        // Reject and don't requeue to avoid infinite loops
        // In production, this would go to a dead-letter queue
        ch.nack(msg, false, false);
      }
    });

    if (log.info) {
      log.info("Subscribed to events", { eventType, queue: queueName });
    }
  } catch (err) {
    log.error?.("[EventBus] Subscribe failed", { eventType, err: err.message });
  }
}

/**
 * Close the event bus connection gracefully.
 */
async function closeEventBus() {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  } catch (err) {
    // Ignore close errors
  } finally {
    channel = null;
    connection = null;
    connecting = null;
  }
}

module.exports = { publish, subscribe, closeEventBus };
