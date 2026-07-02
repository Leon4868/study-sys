import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@study-sys/ui/components/card";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { StudyRecordForm, type StudyRecordFormValues } from "@/components/study-record-form";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/records/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const createMutation = useMutation(
    trpc.studyRecord.create.mutationOptions({
      onSuccess: (record) => {
        toast.success("保存成功");
        navigate({ to: "/records/$id", params: { id: record.id } });
      },
    }),
  );

  const handleSubmit = async (values: StudyRecordFormValues) => {
    await createMutation.mutateAsync(values);
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>新增学习记录</CardTitle>
          <CardDescription>记录今天的学习内容</CardDescription>
        </CardHeader>
        <CardContent>
          <StudyRecordForm
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/records" })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
