import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const claimedNumbersTable = pgTable("claimed_numbers", {
  id: serial("id").primaryKey(),
  sid: text("sid").notNull().unique(),
  phoneNumber: text("phone_number").notNull().unique(),
  friendlyName: text("friendly_name").notNull(),
  userEmail: text("user_email"),
  userName: text("user_name"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClaimedNumberSchema = createInsertSchema(claimedNumbersTable).omit({ id: true, createdAt: true });
export type InsertClaimedNumber = z.infer<typeof insertClaimedNumberSchema>;
export type ClaimedNumber = typeof claimedNumbersTable.$inferSelect;
