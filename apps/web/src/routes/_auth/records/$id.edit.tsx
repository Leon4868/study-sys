import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@study-sys/ui/components/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { StudyRecordForm, type StudyRecordFormValues } from "@/components/study-record-form";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/records/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const recordQuery = useQuery(trpc.studyRecord.getById.queryOptions({ id }));

  const updateMutation = useMutation(
    trpc.studyRecord.update.mutationOptions({
      onSuccess: (record) => {
        toast.success("保存成功");
        navigate({ to: "/records/$id", params: { id: record.id } });
      },
    }),
  );

  const handleSubmit = async (values: StudyRecordFormValues) => {
    await updateMutation.mutateAsync({ id, ...values });
  };

  if (recordQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!recordQuery.data) {
    return <div className="py-10 text-center">记录不存在</div>;
  }

  const record = recordQuery.data;

  return (
    <div className="mx-auto w-full max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>编辑学习记录</CardTitle>
          <CardDescription>修改并保存学习记录</CardDescription>
        </CardHeader>
        <CardContent>
          <StudyRecordForm
            initialValues={{
              studyDate: record.studyDate,
              title: record.title,
              category: record.category,
              durationMinutes: record.durationMinutes,
              content: record.content,
              gains: record.gains,
              problems: record.problems,
              nextPlan: record.nextPlan,
              status: record.status,
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/records/$id", params: { id } })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
