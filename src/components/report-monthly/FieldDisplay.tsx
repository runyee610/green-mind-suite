import { AlertTriangle, Calculator, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type FieldKind = "input" | "computed";

const fmt = (v: number | string | undefined, digits = 2) => {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "string") return v;
  return v.toLocaleString(undefined, { maximumFractionDigits: digits });
};

const fmtRate = (rate: number | null) => {
  if (rate === null) return "—";
  return `${rate > 0 ? "+" : ""}${rate.toFixed(2)}%`;
};

/** 单值字段（无双列对比） */
export function SingleField({
  label,
  value,
  unit,
  kind = "input",
  formula,
  source,
}: {
  label: string;
  value: number | string;
  unit?: string;
  kind?: FieldKind;
  formula?: string;
  source?: string;
}) {
  const isComputed = kind === "computed";
  return (
    <div
      className={cn(
        "rounded-md border-2 border-l-4 p-3",
        isComputed
          ? "border-primary/40 border-l-primary bg-primary/[0.08]"
          : "border-success/50 border-l-success bg-success/[0.10]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium leading-tight text-foreground">{label}</span>
        <KindBadge kind={kind} formula={formula} source={source} />
      </div>
      <div className={cn("mt-2 font-mono text-base font-semibold", isComputed ? "text-primary" : "text-success")}>
        {fmt(value)}
        {unit ? <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span> : null}
      </div>
    </div>
  );
}

/** 双列字段：今年累计 vs 去年累计，可选变化率提示 */
export function DualField({
  label,
  unit,
  kind = "input",
  current,
  last,
  rate,
  formula,
  source,
}: {
  label: string;
  unit?: string;
  kind?: FieldKind;
  current: number | string;
  last: number | string;
  /** 若提供，则展示变化率；变化率绝对值 > 10% 高亮告警 */
  rate?: number | null;
  formula?: string;
  source?: string;
}) {
  const isComputed = kind === "computed";
  const abnormal = rate !== undefined && rate !== null && Math.abs(rate) > 10;

  return (
    <div
      className={cn(
        "rounded-md border-2 border-l-4 p-3 transition-colors",
        isComputed
          ? "border-primary/40 border-l-primary bg-primary/[0.08]"
          : "border-success/50 border-l-success bg-success/[0.10]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium leading-tight text-foreground">{label}</div>
          {unit ? <div className="mt-0.5 text-[10px] text-muted-foreground">单位：{unit}</div> : null}
        </div>
        <KindBadge kind={kind} formula={formula} source={source} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <ValueCell label="今年累计" value={current} highlight={isComputed} input={!isComputed} />
        <ValueCell label="去年累计" value={last} muted />
      </div>

      {rate !== undefined ? (
        <div
          className={cn(
            "mt-2 flex items-center gap-1.5 rounded border px-2 py-1 text-[11px]",
            abnormal
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border bg-muted/40 text-muted-foreground",
          )}
        >
          {abnormal ? <AlertTriangle className="h-3 w-3" /> : null}
          <span>同比变化率</span>
          <span className="ml-auto font-mono font-semibold">{fmtRate(rate ?? null)}</span>
          {abnormal ? <span className="ml-1">超 10% 阈值</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function ValueCell({ label, value, highlight, muted, input }: { label: string; value: number | string; highlight?: boolean; muted?: boolean; input?: boolean }) {
  return (
    <div className={cn(
      "rounded border px-2 py-1.5",
      muted ? "border-border bg-muted/40" : input ? "border-success/40 bg-success/15" : "border-primary/40 bg-primary/15",
    )}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-mono text-sm font-semibold tabular-nums",
          highlight && "text-primary",
          muted && "text-muted-foreground",
          input && "text-success",
          !highlight && !muted && !input && "text-foreground",
        )}
      >
        {fmt(value)}
      </div>
    </div>
  );
}

function KindBadge({ kind, formula, source }: { kind: FieldKind; formula?: string; source?: string }) {
  if (kind === "computed") {
    return (
      <TooltipProvider delayDuration={120}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="h-5 cursor-help gap-1 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
              <Calculator className="h-3 w-3" />
              系统计算
            </Badge>
          </TooltipTrigger>
          {(formula || source) && (
            <TooltipContent side="left" className="max-w-sm space-y-1.5 border-primary/30 bg-popover text-xs">
              {formula ? (
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-primary">公式</div>
                  <div className="mt-0.5 font-mono text-foreground">{formula}</div>
                </div>
              ) : null}
              {source ? (
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-primary">数据来源</div>
                  <div className="mt-0.5 text-muted-foreground">{source}</div>
                </div>
              ) : null}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge variant="outline" className="h-5 gap-1 border-success/40 bg-success/10 px-1.5 text-[10px] text-success">
      <Pencil className="h-3 w-3" />
      企业填报
    </Badge>
  );
}

/** 兼容旧 import：保留 FieldDisplay 作为单值简化封装 */
export function FieldDisplay(props: { label: string; value: string | number; unit?: string; kind?: FieldKind; abnormal?: boolean }) {
  return <SingleField {...props} />;
}
