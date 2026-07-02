import type { AppRouter } from "@study-sys/api/routers/index";
import { Button } from "@study-sys/ui/components/button";
import { Skeleton } from "@study-sys/ui/components/skeleton";
import { Link } from "@tanstack/react-router";
import type { inferRouterOutputs } from "@trpc/server";
import { CheckCircle2, Clock3, History, PlusCircle } from "lucide-react";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type StudyRecord = RouterOutputs["studyRecord"]["stats"]["recentRecords"][number];

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

function RecentRecordsSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

interface RecentRecordsListProps {
  records: StudyRecord[] | undefined;
  isLoading: boolean;
}

export function RecentRecordsList({ records, isLoading }: RecentRecordsListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#c4c6cf] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c4c6cf] p-6">
        <h2 className="font-study-heading flex items-center gap-3 text-3xl font-semibold text-[#002045]">
          <History className="size-7" />
          最近记录
        </h2>
        <Button
          variant="ghost"
          render={<Link to="/records" />}
          className="rounded-lg text-sm font-bold text-[#1960a3] hover:bg-[#f0f3ff]"
        >
          查看全部
        </Button>
      </div>

      <div>
        {isLoading ? (
          <RecentRecordsSkeleton />
        ) : !records || records.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#f0f3ff] text-[#1960a3]">
              <PlusCircle className="size-7" />
            </div>
            <p className="text-[#43474e]">还没有学习记录，点击新增开始记录</p>
            <Button
              render={<Link to="/records/new" />}
              className="rounded-xl bg-[#002045] text-white hover:bg-[#1a365d]"
            >
              新增学习记录
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#c4c6cf] bg-[#f0f3ff]">
                  <th className="p-5 text-xs font-bold uppercase tracking-[0.16em] text-[#43474e]">
                    学习主题
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-[0.16em] text-[#43474e]">
                    日期
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-[0.16em] text-[#43474e]">
                    分类
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-[0.16em] text-[#43474e]">
                    时长
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]">
                {records.map((record) => (
                  <tr key={record.id} className="group transition-colors hover:bg-[#e7eeff]">
                    <td className="p-5">
                      <Link
                        to="/records/$id"
                        params={{ id: record.id }}
                        className="flex items-center gap-3"
                      >
                        <span className="size-2 rounded-full bg-[#1960a3]" />
                        <span className="max-w-[320px] truncate font-bold text-[#002045] transition-colors group-hover:text-[#1960a3]">
                          {record.title}
                        </span>
                      </Link>
                    </td>
                    <td className="p-5 text-sm font-medium text-[#43474e]">{record.studyDate}</td>
                    <td className="p-5">
                      <span className="rounded-full bg-[#d8e3fa] px-3 py-1 text-sm font-semibold text-[#002045]">
                        {record.category || "未分类"}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1960a3]">
                        {record.status === "completed" ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Clock3 className="size-4" />
                        )}
                        {formatDuration(record.durationMinutes)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
