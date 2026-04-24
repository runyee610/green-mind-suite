import { Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FieldKind } from "./monthlyReportData";

export function FieldDisplay({ label, value, unit, kind = "input", abnormal = false }: { label: string; value: string | number; unit?: string; kind?: FieldKind; abnormal?: boolean }) {
  if (kind === "computed") {
    return (
      <div className="rounded-md border border-primary/30 bg-primary/10 p-3">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{label}</span>
          <Badge variant="outline" className="h-6 border-primary/40 bg-primary/10 px-2 text-primary">
            <Calculator className="mr-1 h-3 w-3" />∑ 计算
          </Badge>
        </div>
        <div className={cn("mt-2 font-mono text-lg font-semibold text-primary", abnormal && "text-destructive")}>{value}{unit ? <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span> : null}</div>
      </div>
    );
  }

  return (
    <label className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="relative">
        <Input disabled value={`${value}${unit ? ` ${unit}` : ""}`} className="h-10 border-success/30 bg-success/10 font-mono text-foreground disabled:cursor-default disabled:opacity-100" readOnly />
      </div>
    </label>
  );
}