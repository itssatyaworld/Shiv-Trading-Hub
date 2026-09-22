import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  req.userId = auth.userId;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth.userId ?? undefined;
  const allowedIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const claims = (auth.sessionClaims ?? {}) as Record<string, unknown>;
  const metadata = (claims.publicMetadata ?? claims.metadata ?? {}) as Record<string, unknown>;
  const isAdmin = Boolean(userId && (allowedIds.includes(userId) || metadata.role === "admin"));
  if (!isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  req.userId = userId;
  next();
}