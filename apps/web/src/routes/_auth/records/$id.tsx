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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@study-sys/ui/components/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { STATUS_OPTIONS } from "@/components/study-record-form";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/records/$id")({
  component: RouteComponent,
});

function statusLabel(status: string | null) {
  if (!status) return "未填写";
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString();
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap text-sm">{value}</p>
    </div>
  );
}

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const recordQuery = useQuery(trpc.studyRecord.getById.queryOptions({ id }));

  const deleteMutation = useMutation(
    trpc.studyRecord.delete.mutationOptions({
      onSuccess: () => {
        toast.success("删除成功");
        navigate({ to: "/records" });
      },
    }),
  );

  if (recordQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!recordQuery.data) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 py-10 text-center">
        <p>记录不存在</p>
        <Button render={<Link to="/records" />}>返回列表</Button>
      </div>
    );
  }

  const record = recordQuery.data;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{record.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="学习日期" value={record.studyDate} />
            <Field label="学习分类" value={record.category || "未填写"} />
            <Field label="学习时长" value={`${record.durationMinutes} 分钟`} />
            <Field label="学习状态" value={statusLabel(record.status)} />
            <Field label="创建时间" value={formatDateTime(record.createdAt)} />
            <Field label="更新时间" value={formatDateTime(record.updatedAt)} />
          </div>

          <Field label="学习内容" value={record.content} />
          <Field label="学习收获" value={record.gains || "未填写"} />
          <Field label="遇到的问题" value={record.problems || "未填写"} />
          <Field label="下一步计划" value={record.nextPlan || "未填写"} />

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" render={<Link to="/records" />}>
              返回列表
            </Button>
            <Button
              variant="outline"
              render={<Link to="/records/$id/edit" params={{ id }} />}
            >
              编辑
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              删除
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={() => deleteMutation.mutate({ id })}
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
