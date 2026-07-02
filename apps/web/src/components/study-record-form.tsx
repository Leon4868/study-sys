import { Button } from "@study-sys/ui/components/button";
import { Input } from "@study-sys/ui/components/input";
import { Label } from "@study-sys/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@study-sys/ui/components/select";
import { Textarea } from "@study-sys/ui/components/textarea";
import { useForm } from "@tanstack/react-form";
import z from "zod";

export const CATEGORY_OPTIONS = [
  { value: "编程", label: "编程" },
  { value: "英语", label: "英语" },
  { value: "AI", label: "AI" },
  { value: "阅读", label: "阅读" },
  { value: "考试", label: "考试" },
];

export const STATUS_OPTIONS = [
  { value: "not_started", label: "未开始" },
  { value: "in_progress", label: "进行中" },
  { value: "completed", label: "已完成" },
];

const NONE_VALUE = "__none__";

export const studyRecordFormSchema = z.object({
  studyDate: z.string().min(1, "学习日期不能为空"),
  title: z.string().min(1, "学习主题不能为空"),
  category: z.string().optional(),
  durationMinutes: z.number().positive("学习时长必须大于 0"),
  content: z.string().min(1, "学习内容不能为空"),
  gains: z.string().optional(),
  problems: z.string().optional(),
  nextPlan: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
});

export type StudyRecordFormValues = z.infer<typeof studyRecordFormSchema>;

export type StudyRecordFormInitialValues = {
  studyDate: string;
  title: string;
  category?: string | null;
  durationMinutes: number;
  content: string;
  gains?: string | null;
  problems?: string | null;
  nextPlan?: string | null;
  status?: string | null;
};

type StudyRecordFormProps = {
  initialValues?: StudyRecordFormInitialValues;
  onSubmit: (values: StudyRecordFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

export function StudyRecordForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "保存",
}: StudyRecordFormProps) {
  const form = useForm({
    defaultValues: {
      studyDate: initialValues?.studyDate ?? "",
      title: initialValues?.title ?? "",
      category: initialValues?.category ?? "",
      durationMinutes: initialValues?.durationMinutes ?? 0,
      content: initialValues?.content ?? "",
      gains: initialValues?.gains ?? "",
      problems: initialValues?.problems ?? "",
      nextPlan: initialValues?.nextPlan ?? "",
      status: initialValues?.status ?? "",
    },
    onSubmit: async ({ value }) => {
      const parsed = studyRecordFormSchema.parse({
        ...value,
        category: value.category || undefined,
        gains: value.gains || undefined,
        problems: value.problems || undefined,
        nextPlan: value.nextPlan || undefined,
        status: value.status || undefined,
      });
      await onSubmit(parsed);
    },
    validators: {
      onSubmit: z.object({
        studyDate: z.string().min(1, "学习日期不能为空"),
        title: z.string().min(1, "学习主题不能为空"),
        category: z.string(),
        durationMinutes: z.number().positive("学习时长必须大于 0"),
        content: z.string().min(1, "学习内容不能为空"),
        gains: z.string(),
        problems: z.string(),
        nextPlan: z.string(),
        status: z.string(),
      }),
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <form.Field name="studyDate">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>学习日期 *</Label>
              <Input
                id={field.name}
                name={field.name}
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-red-500 text-xs">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="title">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>学习主题 *</Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-red-500 text-xs">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="category">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>学习分类</Label>
              <Select
                value={field.state.value || NONE_VALUE}
                onValueChange={(value) =>
                  field.handleChange(!value || value === NONE_VALUE ? "" : value)
                }
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue placeholder="请选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>不选择</SelectItem>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-red-500 text-xs">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="durationMinutes">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>学习时长（分钟） *</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min={1}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-red-500 text-xs">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="content">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>学习内容 *</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-red-500 text-xs">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="gains">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>学习收获</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="problems">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>遇到的问题</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="nextPlan">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>下一步计划</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="status">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>学习状态</Label>
              <Select
                value={field.state.value || NONE_VALUE}
                onValueChange={(value) =>
                  field.handleChange(!value || value === NONE_VALUE ? "" : value)
                }
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>不选择</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "保存中..." : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
