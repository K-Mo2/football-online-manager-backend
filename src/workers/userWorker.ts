import { parentPort } from "worker_threads";
import { createNewUserPack } from "../services/playersService";
import { prisma } from "../lib/prisma";

if (parentPort) {
  parentPort.on("message", async (data) => {
    const { userId } = data;
    try {
      const teamId = await createNewUserPack();
      await prisma.user.update({
        where: { id: userId },
        data: { balance: 5000000, teamId },
      });
      await prisma.team.update({
        where: { id: teamId },
        data: { userId: userId },
      });
      parentPort?.postMessage({ teamId });
    } catch (error) {
      console.log(error);
    }
  });
}
