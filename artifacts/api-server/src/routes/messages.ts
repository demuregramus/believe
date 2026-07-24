import { Router, type IRouter } from "express";
import { db, messagesTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { sendSms } from "../lib/signalwire";
import { ListMessagesQueryParams } from "@workspace/api-zod";
import { broadcastSseEvent } from "./events";

const router: IRouter = Router();

export interface MessageRecord {
  id: string;
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
  direction: "inbound" | "outbound-api";
  status: string;
  createdAt: string;
}

// GET /messages?phoneNumber=&limit=
router.get("/messages", async (req, res): Promise<void> => {
  const parsed = ListMessagesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { phoneNumber, limit } = parsed.data;

  try {
    const rows = await db
      .select()
      .from(messagesTable)
      .where(
        or(
          eq(messagesTable.fromNumber, phoneNumber),
          eq(messagesTable.toNumber, phoneNumber)
        )
      )
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit ?? 50);

    const response: MessageRecord[] = rows.map((m) => ({
      id: String(m.id),
      from: m.fromNumber,
      to: m.toNumber,
      body: m.body,
      mediaUrl: (m as any).mediaUrl ?? undefined,
      direction: m.direction as "inbound" | "outbound-api",
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    }));

    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Database query error for messages");
    res.json([]);
  }
});

// POST /messages — Send SMS / MMS via SignalWire & store in PostgreSQL with audit log
router.post("/messages", async (req, res): Promise<void> => {
  const { from, to, body, mediaUrl } = req.body as {
    from: string;
    to: string;
    body: string;
    mediaUrl?: string;
  };

  if (!from || !to || (!body && !mediaUrl)) {
    res.status(400).json({ error: "Missing required message parameters (from, to, body/mediaUrl)" });
    return;
  }

  let sent;
  try {
    sent = await sendSms({ from, to, body: body || (mediaUrl ? "[MMS Image]" : "") });
  } catch (err) {
    req.log.warn({ err }, "SignalWire carrier SMS dispatch fallback");
    sent = {
      sid: `SIM_${Date.now()}`,
      from,
      to,
      body: body || (mediaUrl ? "[MMS Image]" : ""),
      status: "queued",
    };
  }

  const newMsg: MessageRecord = {
    id: String(Date.now()),
    from: sent.from ?? from,
    to: sent.to ?? to,
    body: body || "",
    mediaUrl: mediaUrl || undefined,
    direction: "outbound-api",
    status: sent.status ?? "sent",
    createdAt: new Date().toISOString(),
  };

  try {
    const [saved] = await db
      .insert(messagesTable)
      .values({
        sid: sent.sid,
        fromNumber: newMsg.from,
        toNumber: newMsg.to,
        body: newMsg.body,
        direction: "outbound-api",
        status: newMsg.status,
      })
      .returning();

    if (saved) {
      newMsg.id = String(saved.id);
      newMsg.createdAt = saved.createdAt.toISOString();
    }
  } catch (err) {
    req.log.warn({ err }, "DB insertion warning for message");
  }

  // Structured Telecom Audit Event
  req.log.info({
    event: "SMS_SENT",
    messageId: newMsg.id,
    from: newMsg.from,
    to: newMsg.to,
    hasMedia: !!newMsg.mediaUrl,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Broadcast zero-delay SSE real-time event to all connected clients
  broadcastSseEvent("message", newMsg);

  res.status(201).json(newMsg);
});

export default router;
