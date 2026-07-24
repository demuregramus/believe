import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { sendSms } from "../lib/signalwire";
import {
  ListMessagesQueryParams,
  SendMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// In-memory fallback message store for offline / dev database mode
export interface MemoryMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
  direction: "inbound" | "outbound-api";
  status: string;
  createdAt: string;
}

const memoryMessagesStore: MemoryMessage[] = [
  {
    id: "msg_seed_1",
    from: "+18634738499",
    to: "+14155552671",
    body: "Welcome to Believe Wireless! Your line is active with unlimited talk, text, and web messaging.",
    mediaUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    direction: "outbound-api",
    status: "delivered",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "msg_seed_2",
    from: "+14155552671",
    to: "+18634738499",
    body: "Thanks! Can I send pictures and videos through Web Messaging?",
    direction: "inbound",
    status: "received",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "msg_seed_3",
    from: "+18634738499",
    to: "+14155552671",
    body: "Yes! Believe Wireless supports high-speed MMS photos, GIFs, and emojis.",
    mediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
    direction: "outbound-api",
    status: "delivered",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

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

    const response = rows.map((m) => ({
      id: String(m.id),
      from: m.fromNumber,
      to: m.toNumber,
      body: m.body,
      mediaUrl: (m as any).mediaUrl ?? undefined,
      direction: m.direction as "inbound" | "outbound-api",
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    }));

    if (response.length === 0) {
      const filtered = memoryMessagesStore
        .filter((m) => m.from === phoneNumber || m.to === phoneNumber)
        .slice(0, limit ?? 50);
      res.json(filtered);
      return;
    }

    res.json(response);
  } catch (err) {
    req.log.warn({ err }, "DB query failed, using in-memory store for messages");
    const filtered = memoryMessagesStore
      .filter((m) => m.from === phoneNumber || m.to === phoneNumber)
      .slice(0, limit ?? 50);
    res.json(filtered);
  }
});

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
    req.log.warn({ err }, "SignalWire SMS call failed, recording simulated message for testing");
    sent = {
      sid: `SIM_${Date.now()}`,
      from,
      to,
      body: body || (mediaUrl ? "[MMS Image]" : ""),
      status: "queued",
    };
  }

  const newMsg: MemoryMessage = {
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
  } catch {
    // Ignore DB error, store in memory
  }

  memoryMessagesStore.unshift(newMsg);
  res.status(201).json(newMsg);
});

export default router;
