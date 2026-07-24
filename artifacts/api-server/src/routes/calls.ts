import { Router, type IRouter } from "express";

const router: IRouter = Router();

export interface CallRecord {
  id: string;
  from: string;
  to: string;
  direction: "incoming" | "outgoing" | "missed";
  durationSeconds: number;
  status: "completed" | "missed" | "busy" | "no-answer";
  createdAt: string;
}

const memoryCallsStore: CallRecord[] = [
  {
    id: "call_1",
    from: "+14155552671",
    to: "+18634738499",
    direction: "incoming",
    durationSeconds: 142,
    status: "completed",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "call_2",
    from: "+18634738499",
    to: "+13125550198",
    direction: "outgoing",
    durationSeconds: 85,
    status: "completed",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "call_3",
    from: "+12125558839",
    to: "+18634738499",
    direction: "missed",
    durationSeconds: 0,
    status: "missed",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

// GET /calls/history?phoneNumber=
router.get("/calls/history", (req, res): void => {
  const phoneNumber = String(req.query.phoneNumber || "");
  const calls = phoneNumber
    ? memoryCallsStore.filter((c) => c.from === phoneNumber || c.to === phoneNumber)
    : memoryCallsStore;
  res.json(calls);
});

// POST /calls/dial — initiate or log a voice call session
router.post("/calls/dial", (req, res): void => {
  const { from, to, durationSeconds, direction } = req.body as {
    from: string;
    to: string;
    durationSeconds?: number;
    direction?: "outgoing" | "incoming";
  };

  if (!from || !to) {
    res.status(400).json({ error: "Missing 'from' or 'to' phone number" });
    return;
  }

  const newCall: CallRecord = {
    id: `call_${Date.now()}`,
    from,
    to,
    direction: direction || "outgoing",
    durationSeconds: durationSeconds || Math.floor(Math.random() * 120) + 15,
    status: "completed",
    createdAt: new Date().toISOString(),
  };

  memoryCallsStore.unshift(newCall);
  res.status(201).json(newCall);
});

export default router;
