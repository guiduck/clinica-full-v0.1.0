import { Worker } from "bullmq/dist/esm/classes/worker";
import {
  closeMessageQueue,
  createRedisConnection,
  MESSAGE_QUEUE_NAME,
} from "@/services/messages/message-queue";
import {
  processScheduledMessage,
  recoverQueuedMessages,
} from "@/services/messages/scheduled-messages";

const connection = createRedisConnection();

if (!connection) {
  throw new Error("REDIS_URL é obrigatória para iniciar o worker de mensagens.");
}

const worker = new Worker(
  MESSAGE_QUEUE_NAME,
  async (job) => {
    const scheduledMessageId = String(job.data.scheduledMessageId ?? "");
    if (!scheduledMessageId) throw new Error("Job sem scheduledMessageId.");
    return processScheduledMessage(scheduledMessageId);
  },
  {
    connection,
    concurrency: Number(process.env.MESSAGE_WORKER_CONCURRENCY || 5),
  },
);

worker.on("completed", (job) => {
  console.info("[message-worker] job concluído", job.id);
});
worker.on("failed", (job, error) => {
  console.error("[message-worker] job falhou", job?.id, error.message);
});

async function recover() {
  try {
    const count = await recoverQueuedMessages();
    if (count > 0) {
      console.info("[message-worker] mensagens recuperadas", count);
    }
  } catch (error) {
    console.error("[message-worker] falha na recuperação", error);
  }
}

void recover();
const recoveryTimer = setInterval(() => void recover(), 15_000);

async function shutdown(signal: string) {
  console.info(`[message-worker] encerrando por ${signal}`);
  clearInterval(recoveryTimer);
  await worker.close();
  await connection!.quit();
  await closeMessageQueue();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
