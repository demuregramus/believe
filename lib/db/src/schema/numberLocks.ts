import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const numberLocksTable = pgTable("number_locks", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  isLocked: boolean("is_locked").notNull().default(true),
  lockTier: text("lock_tier").notNull().default("Believe VIP Number Protection"),
  e911Address: text("e911_address").notNull().default("100 Believe Plaza, Princeton, NJ 08540"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNumberLockSchema = createInsertSchema(numberLocksTable).omit({ id: true, updatedAt: true });
export type InsertNumberLock = z.infer<typeof insertNumberLockSchema>;
export type NumberLock = typeof numberLocksTable.$inferSelect;
