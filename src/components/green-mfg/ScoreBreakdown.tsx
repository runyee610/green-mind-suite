import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SCORE_DIMENSIONS, type ScoreL1Dim } from "./data";
import { cn } from "@/lib/utils";

interface Props {
  /** 缩放比例（用于专家审核按总体差异等比缩放）；默认 1 */
  ratio?: number;
  /** 是否隐藏数值（用于"待专家审核"占位） */
  hideValues?: boolean;
  /** 弱项预警阈值（百分比），默认不预警 */
  warnUnderRatio?: number;
}

export function ScoreBreakdown({ ratio = 1, hideValues = false, warnUnderRatio }: Props) {
  return (
    <div className="space-y-3">
      {SCORE_DIMENSIONS.map((l1) => (
        <ScoreL1Block key={l1.name} l1={l1} ratio={ratio} hideValues={hideValues} warnUnderRatio={warnUnderRatio} />
      ))}
    </div>
  );
}

function scale(score: number, weight: number, ratio: number) {
  if (weight === 0) return 0;
  return Math.min(weight, Math.round(score * ratio * 10) / 10);
}

function ScoreL1Block({
  l1, ratio, hideValues, warnUnderRatio,
}: { l1: ScoreL1Dim; ratio: number; hideValues: boolean; warnUnderRatio?: number }) {
  const [open, setOpen] = useState<boolean>(false);
  const l1Score = scale(l1.score, l1.weight, ratio);
  const l1Pct = l1.weight === 0 ? 0 : (l1Score / l1.weight) * 100;
  const l1Weak = warnUnderRatio != null && l1.weight > 0 && l1Pct < warnUnderRatio;

  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-2.5">
      {/* 一级指标（汇总） */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="mb-1 flex w-full items-center justify-between text-xs"
      >
        <div className="flex items-center gap-1.5">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="font-semibold">
            {l1.name}
            <span className="ml-1 font-normal text-muted-foreground">（权重 {l1.weight}）</span>
          </span>
        </div>
        <span className={cn("font-mono", l1Weak ? "text-warning" : "text-foreground")}>
          {hideValues ? `—/${l1.weight}` : `${l1Score}/${l1.weight}`}
        </span>
      </button>
      <Progress value={hideValues ? 0 : l1Pct} className={cn("h-1.5", l1Weak && "[&>div]:bg-warning")} />
      {/* 二级指标（明细） */}
      {open && (
        <div className="mt-2 space-y-1.5 pl-3">
          {l1.children.map((l2) => {
            const v = scale(l2.score, l2.weight, ratio);
            const pct = l2.weight === 0 ? 0 : (v / l2.weight) * 100;
            const weak = warnUnderRatio != null && l2.weight > 0 && pct < warnUnderRatio;
            return (
              <div key={l2.name}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">
                    └ {l2.name}
                    <span className="ml-1">（权重 {l2.weight || "/"}）</span>
                  </span>
                  <span className={cn("font-mono", weak ? "text-warning" : "text-muted-foreground")}>
                    {l2.weight === 0 ? "—" : hideValues ? `—/${l2.weight}` : `${v}/${l2.weight}`}
                  </span>
                </div>
                {l2.weight > 0 && (
                  <Progress value={hideValues ? 0 : pct} className={cn("mt-1 h-1", weak && "[&>div]:bg-warning")} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
