export const JWT_CONFIG = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || "access-secret",
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
  accessTokenExpiry: "60m",
  refreshTokenExpiry: "7d",
};
