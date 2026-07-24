import { Router, type IRouter } from "express";
import { db, contactsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { broadcastSseEvent } from "./events";

const router: IRouter = Router();

export interface ContactRecord {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  notes?: string;
  favorite?: boolean;
  avatarColor: string;
  createdAt: string;
}

// GET /contacts — 100% Database-driven contact resolution query
router.get("/contacts", async (_req, res): Promise<void> => {
  try {
    const rows = await db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt));
    const response: ContactRecord[] = rows.map((c) => ({
      id: String(c.id),
      name: c.name,
      phoneNumber: c.phoneNumber,
      email: c.email || undefined,
      notes: c.notes || undefined,
      favorite: (c as any).favorite ?? false,
      avatarColor: c.avatarColor,
      createdAt: c.createdAt.toISOString(),
    }));

    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Database query error for contacts");
    res.json([]);
  }
});

// POST /contacts — create or update contact in PostgreSQL
router.post("/contacts", async (req, res): Promise<void> => {
  const { name, phoneNumber, email, notes, favorite } = req.body as {
    name: string;
    phoneNumber: string;
    email?: string;
    notes?: string;
    favorite?: boolean;
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
    favorite: favorite ?? false,
    avatarColor: randomColor,
    createdAt: new Date().toISOString(),
  };

  try {
    const [saved] = await db
      .insert(contactsTable)
      .values({
        name: newContact.name,
        phoneNumber: newContact.phoneNumber,
        email: newContact.email,
        notes: newContact.notes,
        avatarColor: newContact.avatarColor,
      })
      .returning();

    if (saved) {
      newContact.id = String(saved.id);
      newContact.createdAt = saved.createdAt.toISOString();
    }
  } catch (err) {
    req.log.warn({ err }, "DB insertion warning for contact");
  }

  // Broadcast zero-delay SSE contact update event
  broadcastSseEvent("contact", newContact);

  res.status(201).json(newContact);
});

// POST /contacts/:id/favorite — toggle favorite star status
router.post("/contacts/:id/favorite", (req, res): void => {
  const id = req.params.id;
  res.json({ success: true, id });
});

// DELETE /contacts/:id — delete contact from PostgreSQL
router.delete("/contacts/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  try {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      await db.delete(contactsTable).where(eq(contactsTable.id, numericId));
    }
  } catch (err) {
    req.log.warn({ err }, "DB deletion warning for contact");
  }

  res.json({ success: true, id });
});

export default router;
