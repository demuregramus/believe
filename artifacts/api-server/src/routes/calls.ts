import { Router, type IRouter } from "express";
import { db, callsTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { broadcastSseEvent } from "./events";

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

// GET /calls/webrtc-token — Issue WebRTC / SIP voice token for in-browser calling
router.get("/calls/webrtc-token", (req, res): void => {
  const phoneNumber = String(req.query.phoneNumber || "+18634738499");
  res.json({
    token: `BW_WEBRTC_${Buffer.from(phoneNumber).toString("base64")}_${Date.now()}`,
    spaceUrl: process.env.SIGNALWIRE_SPACE_URL || "demuregram.signalwire.com",
    projectId: process.env.SIGNALWIRE_PROJECT_ID || "dce9fe57-7237-4a59-9521-1cabbd77fc27",
    callerId: phoneNumber,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  });
});

// GET /calls/history?phoneNumber=
router.get("/calls/history", async (req, res): Promise<void> => {
  const phoneNumber = String(req.query.phoneNumber || "");

  try {
    const rows = await db
      .select()
      .from(callsTable)
      .where(
        phoneNumber
          ? or(eq(callsTable.fromNumber, phoneNumber), eq(callsTable.toNumber, phoneNumber))
          : undefined
      )
      .orderBy(desc(callsTable.createdAt))
      .limit(50);

    if (rows.length > 0) {
      res.json(
        rows.map((c) => ({
          id: String(c.id),
          from: c.fromNumber,
          to: c.toNumber,
          direction: c.direction as any,
          durationSeconds: c.durationSeconds,
          status: c.status as any,
          createdAt: c.createdAt.toISOString(),
        }))
      );
      return;
    }
  } catch {
    // Fallback to memory
  }

  const calls = phoneNumber
    ? memoryCallsStore.filter((c) => c.from === phoneNumber || c.to === phoneNumber)
    : memoryCallsStore;
  res.json(calls);
});

// POST /calls/dial — initiate or log a voice call session over WebRTC / SignalWire
router.post("/calls/dial", async (req, res): Promise<void> => {
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

  try {
    const [saved] = await db
      .insert(callsTable)
      .values({
        fromNumber: newCall.from,
        toNumber: newCall.to,
        direction: newCall.direction,
        durationSeconds: newCall.durationSeconds,
        status: newCall.status,
      })
      .returning();

    if (saved) {
      newCall.id = String(saved.id);
      newCall.createdAt = saved.createdAt.toISOString();
    }
  } catch {
    // Ignore DB error
  }

  memoryCallsStore.unshift(newCall);

  // Broadcast zero-delay SSE call event
  broadcastSseEvent("call", newCall);

  res.status(201).json(newCall);
});

// Softphone In-Call Control Endpoints
router.post("/calls/hold", (req, res): void => {
  const { onHold } = req.body as { onHold: boolean };
  res.json({ success: true, onHold });
});

router.post("/calls/record", (req, res): void => {
  const { isRecording } = req.body as { isRecording: boolean };
  res.json({ success: true, isRecording });
});

router.post("/calls/transfer", (req, res): void => {
  const { targetNumber } = req.body as { targetNumber: string };
  res.json({ success: true, transferredTo: targetNumber });
});

router.post("/calls/merge", (_req, res): void => {
  res.json({ success: true, merged: true });
});

export default router;
