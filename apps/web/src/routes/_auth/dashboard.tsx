import { Button } from "@study-sys/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, List, PlusCircle } from "lucide-react";

import { RecentRecordsList } from "@/components/recent-records-list";
import { StudyStatsCards } from "@/components/study-stats-cards";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  const stats = useQuery(trpc.studyRecord.stats.queryOptions());
  const today = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-[#f9f9ff] px-5 py-8 text-[#111c2c] lg:pl-72 lg:pr-16 lg:py-16">
      <div className="mx-auto w-full max-w-[1200px] space-y-12">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1960a3]">
              LearnTrack
            </p>
            <h1 className="font-study-heading text-4xl font-semibold leading-tight text-[#002045] lg:text-5xl">
              {stats.data?.hasRecordedToday ? "今日已记录，继续保持专注。" : "欢迎回来，开启今日学习。"}
            </h1>
            <p className="text-lg leading-8 text-[#43474e]">
              {today}，{session.data?.user.name ?? "学习者"}，把今天的学习沉淀成可回顾的进步。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link to="/records/new" />}
              className="h-11 rounded-xl bg-[#002045] px-5 text-sm font-bold text-white hover:bg-[#1a365d]"
            >
              <PlusCircle className="size-4" />
              新增学习记录
            </Button>
            <Button
              variant="outline"
              render={<Link to="/records" />}
              className="h-11 rounded-xl border-[#c4c6cf] bg-white px-5 text-sm font-bold text-[#002045] hover:bg-[#f0f3ff]"
            >
              <List className="size-4" />
              查看全部记录
            </Button>
          </div>
        </header>

        <StudyStatsCards data={stats.data} isLoading={stats.isLoading} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-8">
            <RecentRecordsList records={stats.data?.recentRecords} isLoading={stats.isLoading} />
          </section>

          <aside className="space-y-6 xl:col-span-4">
            <div className="relative min-h-80 overflow-hidden rounded-xl bg-[#002045] p-8 text-center text-white shadow-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#7db6ff_0,transparent_34%),linear-gradient(135deg,#002045,#1a365d)] opacity-95" />
              <div className="relative flex h-full min-h-64 flex-col items-center justify-center gap-5">
                <span className="text-5xl text-[#7db6ff]">“</span>
                <blockquote className="font-study-heading text-2xl font-semibold italic leading-10">
                  博学之，审问之，慎思之，明辨之，笃行之。
                </blockquote>
                <cite className="text-xs font-bold not-italic tracking-[0.2em] text-[#d8e3fa]">
                  《礼记·中庸》
                </cite>
              </div>
            </div>

            <div className="rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#002045]">学习热度（本周）</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link to="/records" />}
                  className="rounded-lg text-[#1960a3]"
                >
                  查看
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <div className="flex h-32 items-end justify-between gap-2 px-1">
                {[42, 62, 46, 80, Math.min(95, Math.max(16, (stats.data?.weekMinutes ?? 0) / 8)), 12, 12].map(
                  (height, index) => (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      className="w-full rounded-t-lg bg-[#7db6ff]"
                      style={{
                        height: `${height}%`,
                        opacity: index === 4 ? 1 : 0.2 + index * 0.12,
                      }}
                    />
                  ),
                )}
              </div>
              <div className="mt-3 flex justify-between text-[10px] font-bold text-[#43474e]">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
