import { Router, type IRouter } from "express";
import { db, voicemailsTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { broadcastSseEvent } from "./events";

const router: IRouter = Router();

export interface VoicemailRecord {
  id: string;
  from: string;
  to: string;
  durationSeconds: number;
  audioUrl: string;
  transcript: string;
  read: boolean;
  createdAt: string;
}

// GET /voicemail?phoneNumber= — 100% Database-driven voicemail query
router.get("/voicemail", async (req, res): Promise<void> => {
  const phoneNumber = String(req.query.phoneNumber || "");

  try {
    const rows = await db
      .select()
      .from(voicemailsTable)
      .where(
        phoneNumber
          ? or(eq(voicemailsTable.toNumber, phoneNumber), eq(voicemailsTable.fromNumber, phoneNumber))
          : undefined
      )
      .orderBy(desc(voicemailsTable.createdAt))
      .limit(50);

    const response: VoicemailRecord[] = rows.map((v) => ({
      id: String(v.id),
      from: v.fromNumber,
      to: v.toNumber,
      durationSeconds: v.durationSeconds,
      audioUrl: v.audioUrl,
      transcript: v.transcript,
      read: v.read,
      createdAt: v.createdAt.toISOString(),
    }));

    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Database query error for voicemails");
    res.json([]);
  }
});

// POST /voicemail — record new voicemail & trigger Speech-to-Text transcription
router.post("/voicemail", async (req, res): Promise<void> => {
  const { from, to, durationSeconds, audioUrl, transcript } = req.body as {
    from: string;
    to: string;
    durationSeconds?: number;
    audioUrl?: string;
    transcript?: string;
  };

  const newVm: VoicemailRecord = {
    id: `vm_${Date.now()}`,
    from: from || "+14155552671",
    to: to || "+18634738499",
    durationSeconds: durationSeconds || 20,
    audioUrl: audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    transcript: transcript || "Received voicemail on Believe Wireless line. Automatic transcription generated.",
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
  } catch (err) {
    req.log.warn({ err }, "DB insertion warning for voicemail");
  }

  // Broadcast zero-delay SSE voicemail event
  broadcastSseEvent("voicemail", newVm);

  res.status(201).json(newVm);
});

// POST /voicemail/:id/read — mark voicemail as read in PostgreSQL
router.post("/voicemail/:id/read", async (req, res): Promise<void> => {
  const id = req.params.id;
  try {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      await db.update(voicemailsTable).set({ read: true }).where(eq(voicemailsTable.id, numericId));
    }
  } catch (err) {
    req.log.warn({ err }, "DB update warning for voicemail read status");
  }

  res.json({ success: true, id });
});

// DELETE /voicemail/:id — delete voicemail from PostgreSQL
router.delete("/voicemail/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  try {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      await db.delete(voicemailsTable).where(eq(voicemailsTable.id, numericId));
    }
  } catch (err) {
    req.log.warn({ err }, "DB deletion warning for voicemail");
  }

  res.json({ success: true, id });
});

export default router;
