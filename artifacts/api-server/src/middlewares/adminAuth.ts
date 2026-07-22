import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.adminEmail) {
    next();
    return;
  }
  res.status(401).json({ error: "Not authenticated" });
}
