import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { IGetUserAuthInfoRequest } from "../types/express";

type DataType = {
  price?: number;
  isMarketListed?: boolean;
};

const router = Router();

router.get(
  "/players",
  authenticate,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      if (req?.user?.userId) {
        const players = await prisma.player.findMany({
          where: {
            OR: [
              { team: { userId: { not: req?.user?.userId } } },
              { team: { userId: { equals: null } } },
            ],
            isMarketListed: true,
          },
          include: { team: true },
        });
        console.log(players);
        res.json({ players });
        return;
      }
      res.json({ message: "Login to see the transfer market players." });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ message: error.messsage });
    }
  }
);

router.post(
  "/players/buy",
  authenticate,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const { playerId } = req.body;
      let user = await prisma.user.findUniqueOrThrow({
        where: { id: req?.user?.userId },
        include: {
          team: { include: { _count: { select: { players: true } } } },
        },
      });

      const player = await prisma.player.findUniqueOrThrow({
        where: { id: playerId },
        include: {
          team: {
            include: {
              user: true,
            },
          },
        },
      });

      if (user.team?._count && user.team?._count.players == 25) {
        throw new Error("You reached the maximum number of players per team");
      }

      if (user.balance < player.price * 0.95) {
        throw new Error("Insufficient balance.");
      }

      let updatedUser;
      if (user.teamId) {
        user.balance -= player.price * 0.95;

        await prisma.player.update({
          where: { id: playerId },
          data: { teamId: user.teamId },
        });

        updatedUser = await prisma.user.update({
          where: { id: req?.user?.userId },
          data: { balance: user.balance },
        });

        if (player.team.userId) {
          await prisma.user.update({
            where: { id: player.team.userId },
            data: {
              balance: {
                increment: player.price * 0.95,
              },
            },
          });
        }
      }

      res.json({ updatedUser });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
);

router.put(
  "/player",
  authenticate,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const { playerId, price, isMarketListed } = req.body;

      const user = await prisma.user.findUniqueOrThrow({
        where: { id: req?.user?.userId },
        include: {
          team: { include: { _count: { select: { players: true } } } },
        },
      });

      if (!playerId) {
        throw new Error("Player's id must be provided");
      }

      if (!price && !isMarketListed) {
        throw new Error("No valid data was provided!");
      }

      if (isMarketListed && user?.team && user?.team?._count?.players == 15) {
        throw new Error("A team can't have less that 15 players");
      }

      let data: DataType = new Object();
      if (price) {
        data.price = price;
      }

      if (isMarketListed !== undefined) {
        data.isMarketListed = isMarketListed;
      }

      const player = await prisma.player.update({
        where: { id: playerId, team: { userId: req?.user?.userId } },
        data,
      });
      res.json({ player });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;
