import { Router, type IRouter } from "express";

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
router.get("/voicemail", (req, res): void => {
  const phoneNumber = String(req.query.phoneNumber || "");
  const list = phoneNumber
    ? memoryVoicemailStore.filter((v) => v.to === phoneNumber || v.from === phoneNumber)
    : memoryVoicemailStore;
  res.json(list);
});

// POST /voicemail/:id/read — mark voicemail as read
router.post("/voicemail/:id/read", (req, res): void => {
  const id = req.params.id;
  const item = memoryVoicemailStore.find((v) => v.id === id);
  if (item) {
    item.read = true;
  }
  res.json({ success: true, item });
});

export default router;
