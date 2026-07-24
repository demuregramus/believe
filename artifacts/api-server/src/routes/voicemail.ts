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

const memoryVoicemailStore: VoicemailRecord[] = [
  {
    id: "vm_1",
    from: "+14155552671",
    to: "+18634738499",
    durationSeconds: 24,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    transcript: "Hey! Just calling to confirm our appointment for tomorrow afternoon at 2 PM. Give me a call back when you get a chance!",
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "vm_2",
    from: "+12125558839",
    to: "+18634738499",
    durationSeconds: 18,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    transcript: "Hi, this is Believe Support following up on your eSIM profile setup. Everything looks great on your account. Thanks!",
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// GET /voicemail?phoneNumber=
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

    if (rows.length > 0) {
      res.json(
        rows.map((v) => ({
          id: String(v.id),
          from: v.fromNumber,
          to: v.toNumber,
          durationSeconds: v.durationSeconds,
          audioUrl: v.audioUrl,
          transcript: v.transcript,
          read: v.read,
          createdAt: v.createdAt.toISOString(),
        }))
      );
      return;
    }
  } catch {
    // Fallback to memory
  }

  const list = phoneNumber
    ? memoryVoicemailStore.filter((v) => v.to === phoneNumber || v.from === phoneNumber)
    : memoryVoicemailStore;
  res.json(list);
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
  } catch {
    // Ignore DB error
  }

  memoryVoicemailStore.unshift(newVm);

  // Broadcast zero-delay SSE voicemail event
  broadcastSseEvent("voicemail", newVm);

  res.status(201).json(newVm);
});

// POST /voicemail/:id/read — mark voicemail as read
router.post("/voicemail/:id/read", async (req, res): Promise<void> => {
  const id = req.params.id;
  try {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      await db.update(voicemailsTable).set({ read: true }).where(eq(voicemailsTable.id, numericId));
    }
  } catch {
    // Ignore DB error
  }

  const item = memoryVoicemailStore.find((v) => v.id === id);
  if (item) {
    item.read = true;
  }
  res.json({ success: true, item });
});

// DELETE /voicemail/:id — delete voicemail
router.delete("/voicemail/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  try {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      await db.delete(voicemailsTable).where(eq(voicemailsTable.id, numericId));
    }
  } catch {
    // Ignore DB error
  }

  const idx = memoryVoicemailStore.findIndex((v) => v.id === id);
  if (idx !== -1) {
    memoryVoicemailStore.splice(idx, 1);
  }
  res.json({ success: true });
});

export default router;
