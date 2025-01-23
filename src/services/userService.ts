import { Worker } from "worker_threads";
import path from "path";

export const userWorkerService = async function (userId: number) {
  try {
    const worker = new Worker(
      path.resolve(__dirname, "../workers/userWorker.js"),
      {
        workerData: {
          path: path.resolve(__dirname, "../workers/userWorker.ts"),
        },
      }
    );
    worker.postMessage({ userId });
    worker.on("message", (message: { teamId: number }) => {
      if (message.teamId) {
        console.log(`Starter pack assigned. Team ID: ${message.teamId}`);
      } else {
        console.error(`Failed to assign starter pack`);
      }
    });

    worker.on("error", (error) => {
      console.error("Worker error:", error);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
