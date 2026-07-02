import { relations } from "drizzle-orm";
import { date, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const studyRecord = pgTable(
  "study_record",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    studyDate: date("study_date").notNull(),
    title: text("title").notNull(),
    category: text("category"),
    durationMinutes: integer("duration_minutes").notNull(),
    content: text("content").notNull(),
    gains: text("gains"),
    problems: text("problems"),
    nextPlan: text("next_plan"),
    status: text("status"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("study_record_userId_idx").on(table.userId),
    index("study_record_studyDate_idx").on(table.studyDate),
  ],
);

export const studyRecordRelations = relations(studyRecord, ({ one }) => ({
  user: one(user, {
    fields: [studyRecord.userId],
    references: [user.id],
  }),
}));
