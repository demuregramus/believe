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
  callerIdMode: "Believe Wireless",
  lastActive: new Date().toISOString(),
};

const memoryBlockedNumbers: string[] = ["+18005550199", "+18885550122"];

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
        callerIdMode: memoryNumberLockState.callerIdMode,
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
  const { isLocked, e911Address, callerIdMode } = req.body as {
    isLocked?: boolean;
    e911Address?: string;
    callerIdMode?: string;
  };

  if (typeof isLocked === "boolean") {
    memoryNumberLockState.isLocked = isLocked;
  } else if (isLocked === undefined) {
    // Keep current
  } else {
    memoryNumberLockState.isLocked = !memoryNumberLockState.isLocked;
  }

  if (e911Address) {
    memoryNumberLockState.e911Address = e911Address;
  }

  if (callerIdMode) {
    memoryNumberLockState.callerIdMode = callerIdMode;
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

const handleGetBlockedNumbers = (_req: any, res: any): void => {
  res.json(memoryBlockedNumbers);
};

const handlePostBlockedNumbers = (req: any, res: any): void => {
  const { phoneNumber, block } = req.body as { phoneNumber: string; block?: boolean };
  if (!phoneNumber) {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }

  const idx = memoryBlockedNumbers.indexOf(phoneNumber);
  const shouldBlock = block ?? idx === -1;

  if (shouldBlock && idx === -1) {
    memoryBlockedNumbers.push(phoneNumber);
  } else if (!shouldBlock && idx !== -1) {
    memoryBlockedNumbers.splice(idx, 1);
  }

  res.json({ success: true, blockedNumbers: memoryBlockedNumbers });
};

// GET /api/blocked-numbers and /api/number-lock/blocked-numbers
router.get("/blocked-numbers", handleGetBlockedNumbers);
router.get("/number-lock/blocked-numbers", handleGetBlockedNumbers);

// POST /api/blocked-numbers and /api/number-lock/blocked-numbers
router.post("/blocked-numbers", handlePostBlockedNumbers);
router.post("/number-lock/blocked-numbers", handlePostBlockedNumbers);

export default router;
