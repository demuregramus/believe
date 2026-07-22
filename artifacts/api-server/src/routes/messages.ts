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
    req.log.error({ err }, "Error listing messages");
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

router.post("/messages", async (req, res): Promise<void> => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { from, to, body } = parsed.data;

  try {
    const sent = await sendSms({ from, to, body });

    const [saved] = await db
      .insert(messagesTable)
      .values({
        sid: sent.sid,
        fromNumber: sent.from,
        toNumber: sent.to,
        body: sent.body,
        direction: "outbound-api",
        status: sent.status ?? "sent",
      })
      .returning();

    res.status(201).json({
      id: String(saved.id),
      from: saved.fromNumber,
      to: saved.toNumber,
      body: saved.body,
      direction: "outbound-api" as const,
      status: saved.status,
      createdAt: saved.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error sending message");
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
