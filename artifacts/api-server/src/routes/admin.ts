import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { claimedNumbersTable, messagesTable } from "@workspace/db";
import { desc, count, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";
import { AdminLoginBody, AdminListNumbersQueryParams, AdminListMessagesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = crypto
    .pbkdf2Sync(plain, salt, 100000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(attempt, "hex"), Buffer.from(hash, "hex"));
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) {
    res.status(500).json({ error: "Admin not configured" });
    return;
  }

  const emailMatch = email.toLowerCase() === adminEmail.toLowerCase();
  const passMatch = verifyPassword(password, adminHash);

  if (!emailMatch || !passMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.adminEmail = email;
  res.json({ email, loggedIn: true });
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  if (!req.session?.adminEmail) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ email: req.session.adminEmail, loggedIn: true });
});

router.get("/admin/numbers", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminListNumbersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const limit = parsed.data.limit ?? 50;
  const offset = parsed.data.offset ?? 0;

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(claimedNumbersTable).orderBy(desc(claimedNumbersTable.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(claimedNumbersTable),
  ]);

  res.json({
    numbers: rows.map((n) => ({
      id: n.id,
      sid: n.sid,
      phoneNumber: n.phoneNumber,
      friendlyName: n.friendlyName,
      userEmail: n.userEmail ?? null,
      userName: n.userName ?? null,
      status: n.status,
      createdAt: n.createdAt.toISOString(),
    })),
    total: Number(total),
  });
});

router.get("/admin/messages", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminListMessagesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const limit = parsed.data.limit ?? 50;
  const offset = parsed.data.offset ?? 0;

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(messagesTable),
  ]);

  res.json({
    messages: rows.map((m) => ({
      id: m.id,
      sid: m.sid,
      from: m.fromNumber,
      to: m.toNumber,
      body: m.body,
      direction: m.direction,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    })),
    total: Number(total),
  });
});

export default router;
