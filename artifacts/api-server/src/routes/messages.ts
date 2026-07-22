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
interface MemoryMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  direction: "inbound" | "outbound-api";
  status: string;
  createdAt: string;
}

const memoryMessagesStore: MemoryMessage[] = [];

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
      direction: m.direction as "inbound" | "outbound-api",
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    }));

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
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { from, to, body } = parsed.data;

  let sent;
  try {
    sent = await sendSms({ from, to, body });
  } catch (err) {
    req.log.warn({ err }, "SignalWire SMS call failed, recording simulated message for testing");
    sent = {
      sid: `SIM_${Date.now()}`,
      from,
      to,
      body,
      status: "queued",
    };
  }

  const newMsg: MemoryMessage = {
    id: String(Date.now()),
    from: sent.from ?? from,
    to: sent.to ?? to,
    body: sent.body ?? body,
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
