import { db } from "@study-sys/db";
import { studyRecord } from "@study-sys/db/schema/study-record";
import { TRPCError } from "@trpc/server";
import { and, count, countDistinct, desc, eq, gte, ilike, lte, or, sum } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, router } from "../index";

const studyRecordInput = {
  studyDate: z.string().min(1),
  title: z.string().min(1),
  category: z.string().optional(),
  durationMinutes: z.number().positive(),
  content: z.string().min(1),
  gains: z.string().optional(),
  problems: z.string().optional(),
  nextPlan: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
};

const createSchema = z.object(studyRecordInput);
const updateSchema = z.object({ id: z.string(), ...studyRecordInput }).partial({
  studyDate: true,
  title: true,
  category: true,
  durationMinutes: true,
  content: true,
  gains: true,
  problems: true,
  nextPlan: true,
  status: true,
});

const listSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  category: z.string().optional(),
  keyword: z.string().optional(),
});

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  return toLocalDateString(monday);
}

function getToday(): string {
  return toLocalDateString(new Date());
}

export const studyRecordRouter = router({
  create: protectedProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
    const [record] = await db
      .insert(studyRecord)
      .values({
        ...input,
        userId: ctx.session.user.id,
      })
      .returning();
    return record;
  }),

  update: protectedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    const { id, ...values } = input;
    const [record] = await db
      .update(studyRecord)
      .set(values)
      .where(and(eq(studyRecord.id, id), eq(studyRecord.userId, ctx.session.user.id)))
      .returning();
    if (!record) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Study record not found" });
    }
    return record;
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [record] = await db
        .delete(studyRecord)
        .where(and(eq(studyRecord.id, input.id), eq(studyRecord.userId, ctx.session.user.id)))
        .returning();
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Study record not found" });
      }
      return { success: true as const };
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const [record] = await db
      .select()
      .from(studyRecord)
      .where(and(eq(studyRecord.id, input.id), eq(studyRecord.userId, ctx.session.user.id)));
    if (!record) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Study record not found" });
    }
    return record;
  }),

  list: protectedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    const conditions = [eq(studyRecord.userId, ctx.session.user.id)];
    if (input.dateFrom) conditions.push(gte(studyRecord.studyDate, input.dateFrom));
    if (input.dateTo) conditions.push(lte(studyRecord.studyDate, input.dateTo));
    if (input.category) conditions.push(eq(studyRecord.category, input.category));
    if (input.keyword) {
      const pattern = `%${input.keyword}%`;
      conditions.push(
        or(ilike(studyRecord.title, pattern), ilike(studyRecord.content, pattern))!,
      );
    }

    return await db
      .select()
      .from(studyRecord)
      .where(and(...conditions))
      .orderBy(desc(studyRecord.studyDate));
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const today = getToday();
    const weekStart = getWeekStart();

    const [todayStats] = await db
      .select({ todayCount: count(studyRecord.id) })
      .from(studyRecord)
      .where(and(eq(studyRecord.userId, userId), eq(studyRecord.studyDate, today)));

    const [allTime] = await db
      .select({
        totalDays: countDistinct(studyRecord.studyDate),
        totalMinutes: sum(studyRecord.durationMinutes),
      })
      .from(studyRecord)
      .where(eq(studyRecord.userId, userId));

    const [week] = await db
      .select({ weekMinutes: sum(studyRecord.durationMinutes) })
      .from(studyRecord)
      .where(and(eq(studyRecord.userId, userId), gte(studyRecord.studyDate, weekStart)));

    const recentRecords = await db
      .select()
      .from(studyRecord)
      .where(eq(studyRecord.userId, userId))
      .orderBy(desc(studyRecord.studyDate))
      .limit(5);

    return {
      hasRecordedToday: (todayStats?.todayCount ?? 0) > 0,
      totalDays: allTime?.totalDays ?? 0,
      totalMinutes: Number(allTime?.totalMinutes ?? 0),
      weekMinutes: Number(week?.weekMinutes ?? 0),
      recentRecords,
    };
  }),
});
