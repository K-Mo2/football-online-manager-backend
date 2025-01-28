import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt.config";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(email: string, password: string, name?: string) {
    const emailRegexp =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegexp.test(email)) {
      throw new Error("Invalid email!");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "USER",
        balance: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    console.log(user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.refreshTokenSecret) as any;

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error("Invalid refresh token");
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  private generateAccessToken(user: User) {
    return jwt.sign(
      { userId: user.id, role: user.role },
      JWT_CONFIG.accessTokenSecret,
      { expiresIn: JWT_CONFIG.accessTokenExpiry }
    );
  }

  private generateRefreshToken(user: User) {
    return jwt.sign({ userId: user.id }, JWT_CONFIG.refreshTokenSecret, {
      expiresIn: JWT_CONFIG.refreshTokenExpiry,
    });
  }
}
