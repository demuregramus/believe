import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const voicemailsTable = pgTable("voicemails", {
  id: serial("id").primaryKey(),
  fromNumber: text("from_number").notNull(),
  toNumber: text("to_number").notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  audioUrl: text("audio_url").notNull(),
  transcript: text("transcript").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVoicemailSchema = createInsertSchema(voicemailsTable).omit({ id: true, createdAt: true });
export type InsertVoicemail = z.infer<typeof insertVoicemailSchema>;
export type Voicemail = typeof voicemailsTable.$inferSelect;
