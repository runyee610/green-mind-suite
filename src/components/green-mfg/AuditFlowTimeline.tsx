import { Check, X, Clock, Send, Hourglass, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditFlowNode } from "./data";

const resultStyle = (result: string) => {
  switch (result) {
    case "通过":
      return { ring: "border-success bg-success text-success-foreground", text: "text-success", line: "bg-success", Icon: Check, label: "通过" };
    case "驳回":
      return { ring: "border-destructive bg-destructive text-destructive-foreground", text: "text-destructive", line: "bg-destructive", Icon: X, label: "驳回" };
    case "进入培育":
      return { ring: "border-warning bg-warning text-warning-foreground", text: "text-warning", line: "bg-warning", Icon: Hourglass, label: "进入培育" };
    case "提交":
      return { ring: "border-primary bg-primary text-primary-foreground", text: "text-primary", line: "bg-primary", Icon: Send, label: "提交" };
    default:
      return { ring: "border-border bg-muted text-muted-foreground", text: "text-muted-foreground", line: "bg-border", Icon: Clock, label: result || "待办" };
  }
};

export function AuditFlowTimeline({ nodes, dense = false }: { nodes: AuditFlowNode[]; dense?: boolean }) {
  return (
    <div className="space-y-4">
      {/* 横向里程碑（中等屏及以上） */}
      <ol className="hidden md:grid gap-0" style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0,1fr))` }}>
        {nodes.map((n, i) => {
          const s = resultStyle(n.result);
          const next = nodes[i + 1];
          const nextDone = next && next.result !== "待办";
          const isPending = n.result === "待办";
          return (
            <li key={i} className="relative flex flex-col items-center text-center">
              {/* 连接线 */}
              {i < nodes.length - 1 && (
                <>
                  <span className={cn("absolute top-4 left-1/2 right-0 h-0.5 -translate-y-1/2", nextDone ? s.line : "bg-border/60")} />
                  <ChevronRight
                    className={cn(
                      "absolute top-4 right-0 h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2",
                      nextDone ? s.text : "text-border",
                    )}
                  />
                </>
              )}
              {/* 节点圆点 */}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-sm",
                  isPending ? "border-dashed border-border bg-background text-muted-foreground" : s.ring,
                )}
              >
                <s.Icon className="h-4 w-4" />
              </span>
              {/* 文案 */}
              <div className="mt-2 px-1">
                <p className={cn("text-xs font-medium", isPending && "text-muted-foreground")}>{n.stage}</p>
                <p className={cn("mt-0.5 text-[10px] font-medium uppercase tracking-wide", s.text)}>{s.label}</p>
                {SCORED_STAGES.has(n.stage) && (
                  <p className="mt-1">
                    <span className="text-[10px] text-muted-foreground">最终评分 </span>
                    <span className={cn("font-mono text-xs font-semibold", n.score != null ? s.text : "text-muted-foreground")}>
                      {n.score != null ? n.score : "—"}
                    </span>
                    <span className="text-[10px] text-muted-foreground"> / 100</span>
                  </p>
                )}
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{n.time}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">{n.operator}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* 备注信息 */}
      {!dense && nodes.some((n) => n.comment) && (
        <ul className="hidden md:block space-y-1.5 border-t border-border/50 pt-3">
          {nodes.map((n, i) =>
            n.comment ? (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{n.stage}：</span>
                  {n.comment}
                </span>
              </li>
            ) : null,
          )}
        </ul>
      )}

      {/* 移动端纵向时间轴 */}
      <ol className="md:hidden relative space-y-3 border-l border-border/60 pl-5">
        {nodes.map((n, i) => {
          const s = resultStyle(n.result);
          const isPending = n.result === "待办";
          return (
            <li key={i} className="relative">
              <span
                className={cn(
                  "absolute -left-[26px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background",
                  isPending ? "bg-muted-foreground/40" : s.ring.split(" ")[1],
                )}
              />
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">{n.stage}</span>
                <span className={cn("text-[10px] font-medium", s.text)}>{s.label}</span>
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{n.time} · {n.operator}</p>
              {n.comment && <p className="mt-1 rounded bg-muted/40 p-2 text-xs leading-relaxed">{n.comment}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
