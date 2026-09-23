import { Queue } from "bullmq/dist/esm/classes/queue";
import type { JobsOptions } from "bullmq/dist/esm/types/job-options";
import IORedis from "ioredis";

export const MESSAGE_QUEUE_NAME = "clinica-full-messages";

const globalForQueue = globalThis as unknown as {
  messageQueue?: Queue;
  messageQueueConnection?: IORedis;
};

export function getRedisUrl(env: Partial<NodeJS.ProcessEnv> = process.env) {
  return env.REDIS_URL?.trim() || null;
}

export function createRedisConnection() {
  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;
  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

export function getMessageQueue() {
  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;
  if (!globalForQueue.messageQueueConnection) {
    globalForQueue.messageQueueConnection = createRedisConnection() ?? undefined;
  }
  if (!globalForQueue.messageQueue && globalForQueue.messageQueueConnection) {
    globalForQueue.messageQueue = new Queue(MESSAGE_QUEUE_NAME, {
      connection: globalForQueue.messageQueueConnection,
      defaultJobOptions: messageJobOptions(),
    });
  }
  return globalForQueue.messageQueue ?? null;
}

function messageJobOptions(): JobsOptions {
  return {
    attempts: 5,
    backoff: { type: "exponential", delay: 30_000 },
    removeOnComplete: { age: 7 * 24 * 60 * 60, count: 10_000 },
    removeOnFail: { age: 30 * 24 * 60 * 60, count: 20_000 },
  };
}

export async function enqueueScheduledMessage(
  scheduledMessageId: string,
  scheduledFor: Date,
) {
  const queue = getMessageQueue();
  if (!queue) return false;
  const delay = Math.max(0, scheduledFor.getTime() - Date.now());
  await queue.add(
    "deliver",
    { scheduledMessageId },
    {
      ...messageJobOptions(),
      jobId: `scheduled-message-${scheduledMessageId}`,
      delay,
    },
  );
  return true;
}

export async function closeMessageQueue() {
  await globalForQueue.messageQueue?.close();
  await globalForQueue.messageQueueConnection?.quit();
  globalForQueue.messageQueue = undefined;
  globalForQueue.messageQueueConnection = undefined;
}
