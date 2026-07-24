import { Router, type IRouter } from "express";
import { db, numberLocksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { broadcastSseEvent } from "./events";

const router: IRouter = Router();

let memoryNumberLockState = {
  phoneNumber: "+18634738499",
  isLocked: true,
  lockTier: "Believe VIP Number Protection",
  cost: "$0.00 / Included",
  adFree: true,
  verified2FA: true,
  e911Status: "Registered",
  e911Address: "100 Believe Plaza, Princeton, NJ 08540",
  lastActive: new Date().toISOString(),
};

// GET /number-lock
router.get("/number-lock", async (_req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(numberLocksTable)
      .where(eq(numberLocksTable.phoneNumber, "+18634738499"))
      .limit(1);

    if (rows.length > 0) {
      const row = rows[0];
      res.json({
        phoneNumber: row.phoneNumber,
        isLocked: row.isLocked,
        lockTier: row.lockTier,
        cost: "$0.00 / Included",
        adFree: true,
        verified2FA: true,
        e911Status: "Registered",
        e911Address: row.e911Address,
        lastActive: row.updatedAt.toISOString(),
      });
      return;
    }
  } catch {
    // Fallback to memory
  }

  res.json(memoryNumberLockState);
});

// POST /number-lock/toggle
router.post("/number-lock/toggle", async (req, res): Promise<void> => {
  const { isLocked, e911Address } = req.body as { isLocked?: boolean; e911Address?: string };

  if (typeof isLocked === "boolean") {
    memoryNumberLockState.isLocked = isLocked;
  } else {
    memoryNumberLockState.isLocked = !memoryNumberLockState.isLocked;
  }

  if (e911Address) {
    memoryNumberLockState.e911Address = e911Address;
  }

  try {
    await db
      .insert(numberLocksTable)
      .values({
        phoneNumber: "+18634738499",
        isLocked: memoryNumberLockState.isLocked,
        e911Address: memoryNumberLockState.e911Address,
      })
      .onConflictDoUpdate({
        target: numberLocksTable.phoneNumber,
        set: {
          isLocked: memoryNumberLockState.isLocked,
          e911Address: memoryNumberLockState.e911Address,
          updatedAt: new Date(),
        },
      });
  } catch {
    // Ignore DB error
  }

  broadcastSseEvent("number-lock", memoryNumberLockState);

  res.json(memoryNumberLockState);
});

export default router;
