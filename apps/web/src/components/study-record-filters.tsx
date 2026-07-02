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

import { CATEGORY_OPTIONS } from "@/components/study-record-form";

const NONE_VALUE = "__none__";

export type StudyRecordFiltersValue = {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  keyword?: string;
};

type StudyRecordFiltersProps = {
  value: StudyRecordFiltersValue;
  onChange: (value: StudyRecordFiltersValue) => void;
};

export function StudyRecordFilters({ value, onChange }: StudyRecordFiltersProps) {
  const hasActiveFilters =
    !!value.dateFrom || !!value.dateTo || !!value.category || !!value.keyword;

  return (
    <div className="space-y-4 rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-sm font-bold text-[#002045]">高级筛选</h2>
        <p className="mt-1 text-sm text-[#43474e]">按日期、分类和关键词缩小记录范围。</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateFrom" className="text-[#43474e]">
          日期从
        </Label>
        <Input
          id="dateFrom"
          type="date"
          className="rounded-lg border-[#c4c6cf] bg-[#f9f9ff]"
          value={value.dateFrom ?? ""}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateTo" className="text-[#43474e]">
          日期到
        </Label>
        <Input
          id="dateTo"
          type="date"
          className="rounded-lg border-[#c4c6cf] bg-[#f9f9ff]"
          value={value.dateTo ?? ""}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-[#43474e]">
          学习分类
        </Label>
        <Select
          value={value.category || NONE_VALUE}
          onValueChange={(next) =>
            onChange({ ...value, category: !next || next === NONE_VALUE ? undefined : next })
          }
        >
          <SelectTrigger id="category" className="w-full rounded-lg border-[#c4c6cf] bg-[#f9f9ff]">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>全部分类</SelectItem>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keyword" className="text-[#43474e]">
          关键词
        </Label>
        <Input
          id="keyword"
          type="text"
          placeholder="搜索主题或内容"
          className="rounded-lg border-[#c4c6cf] bg-[#f9f9ff]"
          value={value.keyword ?? ""}
          onChange={(e) => onChange({ ...value, keyword: e.target.value || undefined })}
        />
      </div>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl border-[#c4c6cf] bg-white text-[#002045] hover:bg-[#f0f3ff]"
          onClick={() => onChange({})}
        >
          清除筛选
        </Button>
      )}
    </div>
  );
}
