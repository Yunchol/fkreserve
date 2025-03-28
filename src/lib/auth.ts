import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "dev-secret-key";

export function generateToken(userId: string) {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, SECRET_KEY) as { userId: string };
  } catch {
    return null;
  }
}
