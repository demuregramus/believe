import { Router, type IRouter } from "express";

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
router.get("/number-lock", (_req, res): void => {
  res.json(memoryNumberLockState);
});

// POST /number-lock/toggle
router.post("/number-lock/toggle", (req, res): void => {
  const { isLocked } = req.body as { isLocked?: boolean };
  if (typeof isLocked === "boolean") {
    memoryNumberLockState.isLocked = isLocked;
  } else {
    memoryNumberLockState.isLocked = !memoryNumberLockState.isLocked;
  }
  res.json(memoryNumberLockState);
});

export default router;
