import { Router } from "express";
import authRoutes from "./auth.routes";
import playersRoutes from "./players.routes";

const router = Router();

router.use("/api", authRoutes);
router.use("/api", playersRoutes);

router.get("/", (req, res) => {
  res.json({ message: "Welcome to Express TypeScript API" });
});

export default router;
