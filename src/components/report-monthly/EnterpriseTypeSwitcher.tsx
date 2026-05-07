import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const ENTERPRISE_TYPES = [
  { id: "power_gen", label: "电力生产企业" },
  { id: "power_supply", label: "供电企业" },
  { id: "energy_convert", label: "其他能源加工转换或有能源回收企业" },
  { id: "non_energy", label: "非能源加工转换工业企业" },
  { id: "telecom", label: "电信企业" },
] as const;

export type EnterpriseTypeId = (typeof ENTERPRISE_TYPES)[number]["id"];

/** 蒸汽相关指标：仅“其他能源加工转换或有能源回收企业”需要填报 */
export const TYPE_HAS_STEAM: EnterpriseTypeId = "energy_convert";

export function EnterpriseTypeSwitcher({
  value,
  onChange,
}: {
  value: EnterpriseTypeId;
  onChange: (v: EnterpriseTypeId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/[0.04] px-3 py-2">
      <Badge variant="outline" className="gap-1 border-primary/40 bg-primary/10 text-primary">
        <Building2 className="h-3 w-3" />
        演示：企业类型切换
      </Badge>
      <span className="text-[11px] text-muted-foreground">
        切换企业类型以查看不同的填报字段（通用字段所有企业一致；特殊字段按企业类型差异化）
      </span>
      <div className="ml-auto flex flex-wrap gap-1">
        {ENTERPRISE_TYPES.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs transition",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SpecialFieldsPlaceholder({ typeLabel }: { typeLabel: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
      <div className="font-medium text-foreground">「{typeLabel}」专属字段待补充</div>
      <p className="mt-1 text-[11px]">通用字段（基础信息、能源消费、工业产值、碳排放、节能措施）所有企业一致填报；该企业类型的特殊字段稍后补齐。</p>
    </div>
  );
}
