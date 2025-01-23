import { Router } from "express";
import { AuthService } from "../services/authService";
import { authenticate } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { userWorkerService } from "../services/userService";
import { IGetUserAuthInfoRequest } from "@/types/express";

const router = Router();
const authService = new AuthService(prisma);

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await authService.register(email, password, name);
    userWorkerService(user.id);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    console.log(result);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

router.post(
  "/logout",
  authenticate,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      await authService.logout(req?.user?.userId as number);
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get(
  "/profile",
  authenticate,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      console.log(req.user);
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: req?.user?.userId },
        include: {
          team: {
            include: { players: true },
          },
        },
      });
      console.log(user);
      res.json({ user });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ message: error.messsage });
    }
  }
);

export default router;
