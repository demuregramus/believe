import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db";

const router: IRouter = Router();

// SignalWire sends inbound SMS as form-encoded POST
router.post("/signalwire/webhook", async (req, res): Promise<void> => {
  const { From, To, Body, MessageSid } = req.body as {
    From?: string;
    To?: string;
    Body?: string;
    MessageSid?: string;
  };

  if (!From || !To || !Body) {
    res.status(400).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
    return;
  }

  try {
    await db.insert(messagesTable).values({
      sid: MessageSid ?? `inbound-${Date.now()}`,
      fromNumber: From,
      toNumber: To,
      body: Body,
      direction: "inbound",
      status: "received",
    }).onConflictDoNothing();
  } catch (err) {
    req.log.error({ err }, "Error saving inbound webhook message");
  }

  // Return empty TwiML response
  res.set("Content-Type", "text/xml");
  res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
});

export default router;
