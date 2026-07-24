import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blockedNumbersTable = pgTable("blocked_numbers", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlockedNumberSchema = createInsertSchema(blockedNumbersTable).omit({ id: true, createdAt: true });
export type InsertBlockedNumber = z.infer<typeof insertBlockedNumberSchema>;
export type BlockedNumber = typeof blockedNumbersTable.$inferSelect;
