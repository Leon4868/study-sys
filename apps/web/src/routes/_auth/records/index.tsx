import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@study-sys/ui/components/alert-dialog";
import { Button } from "@study-sys/ui/components/button";
import { Card, CardContent } from "@study-sys/ui/components/card";
import { cn } from "@study-sys/ui/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, Filter, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { CATEGORY_OPTIONS, STATUS_OPTIONS } from "@/components/study-record-form";
import { StudyRecordFilters } from "@/components/study-record-filters";
import { queryClient, trpc } from "@/utils/trpc";

const recordsSearchSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  category: z.string().optional(),
  keyword: z.string().optional(),
});

export const Route = createFileRoute("/_auth/records/")({
  component: RouteComponent,
  validateSearch: recordsSearchSchema,
});

function statusLabel(status: string | null) {
  if (!status) return "未填写";
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const recordsQuery = useQuery(trpc.studyRecord.list.queryOptions(search));
  const selectedCategory = search.category ?? "";

  const deleteMutation = useMutation(
    trpc.studyRecord.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("删除成功");
        if (deleteTargetId) {
          queryClient.removeQueries({
            queryKey: trpc.studyRecord.getById.queryKey({ id: deleteTargetId }),
          });
        }
        setDeleteTargetId(null);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: trpc.studyRecord.list.pathKey() }),
          queryClient.invalidateQueries({ queryKey: trpc.studyRecord.stats.pathKey() }),
        ]);
      },
    }),
  );

  const handleFiltersChange = (next: typeof search) => {
    navigate({ search: next });
  };

  return (
    <main className="min-h-screen bg-[#f9f9ff] text-[#111c2c] lg:pl-64">
      <header className="sticky top-0 z-30 border-b border-[#c4c6cf] bg-white/90 px-5 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur lg:px-8">
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-6">
          <h1 className="font-study-heading text-3xl font-semibold text-[#002045]">学习记录</h1>
          <div className="relative ml-auto hidden w-full max-w-md md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#74777f]" />
            <input
              className="h-10 w-full rounded-full border border-[#c4c6cf] bg-[#e7eeff] pl-10 pr-4 text-sm outline-none transition focus:border-[#1960a3] focus:ring-2 focus:ring-[#1960a3]/20"
              placeholder="搜索学习主题或内容..."
              value={search.keyword ?? ""}
              onChange={(e) => handleFiltersChange({ ...search, keyword: e.target.value || undefined })}
            />
          </div>
          <Button
            render={<Link to="/records/new" />}
            className="h-10 rounded-xl bg-[#002045] px-4 text-sm font-bold text-white hover:bg-[#1a365d]"
          >
            <Plus className="size-4" />
            新增记录
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-6 px-5 py-8 lg:px-8">
        <div className="col-span-12 flex flex-col gap-6 xl:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#c4c6cf] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {[{ value: "", label: "全部" }, ...CATEGORY_OPTIONS].map((category) => (
                <button
                  key={category.value || "all"}
                  type="button"
                  className={cn(
                    "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
                    selectedCategory === category.value
                      ? "border-[#002045] bg-[#002045] text-white"
                      : "border-[#c4c6cf] text-[#43474e] hover:bg-[#f0f3ff] hover:text-[#002045]",
                  )}
                  onClick={() =>
                    handleFiltersChange({
                      ...search,
                      category: category.value || undefined,
                    })
                  }
                >
                  {category.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1960a3]">
              <Filter className="size-4" />
              高级筛选
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#c4c6cf] bg-white shadow-sm">
            {recordsQuery.isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-7 animate-spin text-[#1960a3]" />
              </div>
            ) : recordsQuery.data?.length === 0 ? (
              <p className="py-16 text-center text-[#43474e]">暂无记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[940px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#c4c6cf] bg-[#f0f3ff]">
                      <th className="px-6 py-4 font-bold text-[#43474e]">日期</th>
                      <th className="px-6 py-4 font-bold text-[#43474e]">主题</th>
                      <th className="px-6 py-4 font-bold text-[#43474e]">分类</th>
                      <th className="px-6 py-4 text-center font-bold text-[#43474e]">时长</th>
                      <th className="px-6 py-4 font-bold text-[#43474e]">状态</th>
                      <th className="px-6 py-4 text-right font-bold text-[#43474e]">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c4c6cf]">
                    {recordsQuery.data?.map((record) => (
                      <tr key={record.id} className="group transition-colors hover:bg-[#e7eeff]">
                        <td className="px-6 py-4 font-medium text-[#43474e]">{record.studyDate}</td>
                        <td className="px-6 py-4 font-semibold text-[#002045]">{record.title}</td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-[#d3e4ff] px-3 py-1 text-xs font-bold uppercase text-[#004881]">
                            {record.category || "未填写"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-[#111c2c]">
                          {record.durationMinutes} min
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 font-semibold text-[#43474e]">
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                record.status === "completed"
                                  ? "bg-emerald-500"
                                  : record.status === "in_progress"
                                    ? "bg-amber-500"
                                    : "bg-slate-400",
                              )}
                            />
                            {statusLabel(record.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              render={<Link to="/records/$id" params={{ id: record.id }} />}
                              className="rounded-lg text-[#1960a3] hover:bg-[#d8e3fa]"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              render={<Link to="/records/$id/edit" params={{ id: record.id }} />}
                              className="rounded-lg text-[#1960a3] hover:bg-[#d8e3fa]"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTargetId(record.id)}
                              className="rounded-lg text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <aside className="col-span-12 space-y-6 xl:col-span-3">
          <StudyRecordFilters value={search} onChange={handleFiltersChange} />

          <Card className="rounded-xl border-[#c4c6cf] bg-white py-0 text-[#111c2c] shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-bold text-[#002045]">记录概览</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#43474e]">当前结果</span>
                  <span className="font-study-heading text-3xl font-semibold text-[#002045]">
                    {recordsQuery.data?.length ?? 0}
                  </span>
                </div>
                <div className="rounded-xl bg-[#f0f3ff] p-4 text-sm leading-6 text-[#43474e]">
                  使用分类和日期筛选，把学习历史整理成能复盘的档案。
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该学习记录？</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销，删除后无法恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTargetId) deleteMutation.mutate({ id: deleteTargetId });
              }}
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
