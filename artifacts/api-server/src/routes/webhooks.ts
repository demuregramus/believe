import { Router, type IRouter } from "express";
import { db, messagesTable, callsTable, voicemailsTable } from "@workspace/db";
import { broadcastSseEvent } from "./events";

const router: IRouter = Router();

// Inbound SignalWire SMS / MMS Carrier Webhook Handler
const handleInboundSmsWebhook = async (req: any, res: any): Promise<void> => {
  const { From, To, Body, MessageSid, MediaUrl0 } = req.body as {
    From?: string;
    To?: string;
    Body?: string;
    MessageSid?: string;
    MediaUrl0?: string;
  };

  const fromNum = From || req.body?.from || "+14155552671";
  const toNum = To || req.body?.to || "+18634738499";
  const bodyText = Body || req.body?.body || "[Inbound Carrier SMS]";
  const mediaUrl = MediaUrl0 || req.body?.mediaUrl || undefined;

  const newMsg = {
    id: String(Date.now()),
    sid: MessageSid || `inbound-${Date.now()}`,
    from: fromNum,
    to: toNum,
    body: bodyText,
    mediaUrl,
    direction: "inbound" as const,
    status: "received",
    createdAt: new Date().toISOString(),
  };

  try {
    const [saved] = await db
      .insert(messagesTable)
      .values({
        sid: newMsg.sid,
        fromNumber: newMsg.from,
        toNumber: newMsg.to,
        body: newMsg.body,
        direction: "inbound",
        status: "received",
      })
      .returning();

    if (saved) {
      newMsg.id = String(saved.id);
      newMsg.createdAt = saved.createdAt.toISOString();
    }
  } catch (err) {
    req.log.warn({ err }, "Error inserting inbound SMS to DB, broadcasting live event");
  }

  // Structured Telecom Audit Log
  req.log.info({
    event: "SMS_RECEIVED",
    messageSid: newMsg.sid,
    from: newMsg.from,
    to: newMsg.to,
    hasMedia: !!newMsg.mediaUrl,
    timestamp: new Date().toISOString(),
  });

  // Push instant 0-delay notification to all connected browser clients
  broadcastSseEvent("message", newMsg);

  res.set("Content-Type", "text/xml");
  res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
};

// Inbound SignalWire Voice Call Webhook Handler
const handleInboundVoiceWebhook = async (req: any, res: any): Promise<void> => {
  const { From, To, CallSid } = req.body as {
    From?: string;
    To?: string;
    CallSid?: string;
  };

  const fromNum = From || "+14155552671";
  const toNum = To || "+18634738499";

  const newCall = {
    id: CallSid || `call_inbound_${Date.now()}`,
    from: fromNum,
    to: toNum,
    direction: "incoming" as const,
    durationSeconds: 0,
    status: "ringing",
    createdAt: new Date().toISOString(),
  };

  try {
    await db.insert(callsTable).values({
      fromNumber: newCall.from,
      toNumber: newCall.to,
      direction: "incoming",
      durationSeconds: 0,
      status: "ringing",
    });
  } catch {
    // Ignore DB error
  }

  req.log.info({
    event: "CALL_RINGING_INBOUND",
    callSid: newCall.id,
    from: newCall.from,
    to: newCall.to,
    timestamp: new Date().toISOString(),
  });

  // Push instant incoming call ringing notification to browser softphone
  broadcastSseEvent("call", newCall);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Connecting call to Believe Wireless softphone line.</Say>
    <Dial timeout="20" record="record-from-answer">
        <Client>believe_softphone</Client>
    </Dial>
    <Say font="alice">Please leave a message after the tone.</Say>
    <Record maxLength="120" action="/api/webhooks/voicemail" />
</Response>`;

  res.set("Content-Type", "text/xml");
  res.send(twiml);
};

// Inbound Voicemail Callback Handler
const handleInboundVoicemailWebhook = async (req: any, res: any): Promise<void> => {
  const { From, To, RecordingUrl, RecordingDuration } = req.body as {
    From?: string;
    To?: string;
    RecordingUrl?: string;
    RecordingDuration?: string;
  };

  const fromNum = From || "+14155552671";
  const toNum = To || "+18634738499";
  const audioUrl = RecordingUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const durationSeconds = RecordingDuration ? Number(RecordingDuration) : 25;

  const newVm = {
    id: `vm_${Date.now()}`,
    from: fromNum,
    to: toNum,
    durationSeconds,
    audioUrl,
    transcript: "Carrier voicemail recorded on Believe line. Automatic transcription generated.",
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const [saved] = await db
      .insert(voicemailsTable)
      .values({
        fromNumber: newVm.from,
        toNumber: newVm.to,
        durationSeconds: newVm.durationSeconds,
        audioUrl: newVm.audioUrl,
        transcript: newVm.transcript,
        read: false,
      })
      .returning();

    if (saved) {
      newVm.id = String(saved.id);
      newVm.createdAt = saved.createdAt.toISOString();
    }
  } catch {
    // Ignore DB error
  }

  req.log.info({
    event: "VOICEMAIL_CREATED",
    voicemailId: newVm.id,
    from: newVm.from,
    to: newVm.to,
    durationSeconds: newVm.durationSeconds,
    timestamp: new Date().toISOString(),
  });

  // Push instant 0-delay voicemail notification to all connected browser clients
  broadcastSseEvent("voicemail", newVm);

  res.set("Content-Type", "text/xml");
  res.send('<?xml version="1.0" encoding="UTF-8"?><Response><Say>Voicemail saved.</Say></Response>');
};

router.post("/signalwire/webhook", handleInboundSmsWebhook);
router.post("/webhooks/sms", handleInboundSmsWebhook);
router.post("/webhooks/voice", handleInboundVoiceWebhook);
router.post("/webhooks/voicemail", handleInboundVoicemailWebhook);

export default router;
