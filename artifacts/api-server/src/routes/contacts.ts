import { Router, type IRouter } from "express";

const router: IRouter = Router();

export interface ContactRecord {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  notes?: string;
  avatarColor: string;
  createdAt: string;
}

const memoryContactsStore: ContactRecord[] = [
  {
    id: "contact_1",
    name: "Alex Rivera",
    phoneNumber: "+14155552671",
    email: "alex.rivera@example.com",
    notes: "Design Partner",
    avatarColor: "bg-blue-500",
    createdAt: new Date().toISOString(),
  },
  {
    id: "contact_2",
    name: "Sarah Chen",
    phoneNumber: "+13125550198",
    email: "sarah.c@example.com",
    notes: "Believe Wireless VIP",
    avatarColor: "bg-emerald-500",
    createdAt: new Date().toISOString(),
  },
  {
    id: "contact_3",
    name: "Jordan Taylor",
    phoneNumber: "+12125558839",
    email: "jtaylor@example.com",
    notes: "Business Line",
    avatarColor: "bg-purple-500",
    createdAt: new Date().toISOString(),
  },
];

// GET /contacts
router.get("/contacts", (_req, res): void => {
  res.json(memoryContactsStore);
});

// POST /contacts — create or update contact
router.post("/contacts", (req, res): void => {
  const { name, phoneNumber, email, notes } = req.body as {
    name: string;
    phoneNumber: string;
    email?: string;
    notes?: string;
  };

  if (!name || !phoneNumber) {
    res.status(400).json({ error: "Name and Phone Number are required" });
    return;
  }

  const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newContact: ContactRecord = {
    id: `contact_${Date.now()}`,
    name,
    phoneNumber,
    email: email || undefined,
    notes: notes || undefined,
    avatarColor: randomColor,
    createdAt: new Date().toISOString(),
  };

  memoryContactsStore.unshift(newContact);
  res.status(201).json(newContact);
});

// DELETE /contacts/:id
router.delete("/contacts/:id", (req, res): void => {
  const idx = memoryContactsStore.findIndex((c) => c.id === req.params.id);
  if (idx !== -1) {
    memoryContactsStore.splice(idx, 1);
  }
  res.json({ success: true });
});

export default router;
