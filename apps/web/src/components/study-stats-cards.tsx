import type { AppRouter } from "@study-sys/api/routers/index";
import { Skeleton } from "@study-sys/ui/components/skeleton";
import type { inferRouterOutputs } from "@trpc/server";
import { BarChart3, CalendarDays, Clock, Flame } from "lucide-react";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type StudyStats = RouterOutputs["studyRecord"]["stats"];

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} 分钟`;
  }
  if (minutes === 0) {
    return `${hours} 小时`;
  }
  return `${hours} 小时 ${minutes} 分钟`;
}

function formatCompactHours(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  if (hours < 1) {
    return `${totalMinutes}`;
  }
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#c4c6cf] bg-white p-6">
      <Skeleton className="mb-8 h-5 w-20" />
      <Skeleton className="h-14 w-28" />
      <Skeleton className="mt-3 h-4 w-24" />
    </div>
  );
}

interface StudyStatsCardsProps {
  data: StudyStats | undefined;
  isLoading: boolean;
}

export function StudyStatsCards({ data, isLoading }: StudyStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  const cards = [
    {
      label: "累计学习天数",
      tag: "DAYS",
      value: data?.totalDays ?? 0,
      unit: "天",
      icon: CalendarDays,
      helper: data?.hasRecordedToday ? "今日已完成记录" : "今日还未记录",
    },
    {
      label: "总学习时长",
      tag: "TOTAL",
      value: formatCompactHours(data?.totalMinutes ?? 0),
      unit: (data?.totalMinutes ?? 0) < 60 ? "min" : "h",
      icon: Clock,
      helper: formatDuration(data?.totalMinutes ?? 0),
    },
    {
      label: "本周学习时长",
      tag: "WEEKLY",
      value: formatCompactHours(data?.weekMinutes ?? 0),
      unit: (data?.weekMinutes ?? 0) < 60 ? "min" : "h",
      icon: BarChart3,
      helper: formatDuration(data?.weekMinutes ?? 0),
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(0,32,69,0.05)]"
          >
            <div className="mb-6 flex items-start justify-between">
              <Icon className="size-6 text-[#1960a3]" />
              <span className="text-xs font-bold tracking-[0.16em] text-[#989fa6]">
                {card.tag}
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-study-heading text-6xl font-bold leading-none text-[#002045]">
                {card.value}
                <span className="ml-1 text-2xl font-semibold">{card.unit}</span>
              </p>
              <p className="text-sm font-semibold text-[#43474e]">{card.label}</p>
              <p className="text-xs text-[#74777f]">{card.helper}</p>
            </div>
          </div>
        );
      })}

      <div className="relative overflow-hidden rounded-xl bg-[#002045] p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(0,32,69,0.08)]">
        <Flame className="absolute -bottom-6 -right-5 size-32 text-white/10" />
        <div className="relative">
          <div className="mb-6 flex items-start justify-between">
            <Flame className="size-6 text-[#7db6ff]" />
            <span className="text-xs font-bold tracking-[0.16em] text-[#7db6ff]">TODAY</span>
          </div>
          <p className="font-study-heading text-5xl font-bold leading-none">
            {data?.hasRecordedToday ? "已记录" : "待记录"}
          </p>
          <p className="mt-3 text-sm font-semibold text-white/80">今日学习状态</p>
          <p className="mt-1 text-xs text-white/60">稳定习惯从一次记录开始</p>
        </div>
      </div>
    </section>
  );
}
