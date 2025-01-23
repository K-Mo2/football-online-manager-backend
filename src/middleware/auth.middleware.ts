import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_CONFIG } from "../config/jwt.config";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return; // Ensure the function ends here
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.accessTokenSecret);
    (req as any).user = decoded; // Attach decoded data to the request
    next(); // Call the next middleware/route handler
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
