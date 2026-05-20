import {
  Check,
  X,
  Clock,
  Send,
  Hourglass,
  Sparkles,
  UserCheck,
  FileEdit,
  Award,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditFlowNode } from "./data";

/**
 * 审批流转时间轴
 * - 支持多轮循环：企业填写→智能打分→专家审核→（驳回）企业修改→…→通过/进入培育
 * - 按 round 分组渲染，每组顶部带"第 N 轮"标识与结论摘要
 */

const SCORED_KIND = new Set(["ai", "expert"]);

type Tone = "success" | "destructive" | "warning" | "primary" | "muted";

const TONE_CLASSES: Record<Tone, { ring: string; soft: string; text: string; line: string; chip: string }> = {
  success: {
    ring: "border-success bg-success text-success-foreground shadow-[0_0_0_4px_hsl(var(--success)/0.12)]",
    soft: "border-success/30 bg-success/5",
    text: "text-success",
    line: "bg-gradient-to-b from-success/60 via-success/30 to-success/0",
    chip: "border-success/40 bg-success/10 text-success",
  },
  destructive: {
    ring: "border-destructive bg-destructive text-destructive-foreground shadow-[0_0_0_4px_hsl(var(--destructive)/0.12)]",
    soft: "border-destructive/30 bg-destructive/5",
    text: "text-destructive",
    line: "bg-gradient-to-b from-destructive/60 via-destructive/30 to-destructive/0",
    chip: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  warning: {
    ring: "border-warning bg-warning text-warning-foreground shadow-[0_0_0_4px_hsl(var(--warning)/0.12)]",
    soft: "border-warning/30 bg-warning/5",
    text: "text-warning",
    line: "bg-gradient-to-b from-warning/60 via-warning/30 to-warning/0",
    chip: "border-warning/40 bg-warning/10 text-warning",
  },
  primary: {
    ring: "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]",
    soft: "border-primary/30 bg-primary/5",
    text: "text-primary",
    line: "bg-gradient-to-b from-primary/60 via-primary/30 to-primary/0",
    chip: "border-primary/40 bg-primary/10 text-primary",
  },
  muted: {
    ring: "border-dashed border-border bg-background text-muted-foreground",
    soft: "border-border/60 bg-muted/20",
    text: "text-muted-foreground",
    line: "bg-border/60",
    chip: "border-border bg-muted/40 text-muted-foreground",
  },
};

function nodeTone(n: AuditFlowNode): Tone {
  if (n.result === "待办") return "muted";
  if (n.result === "驳回") return "destructive";
  if (n.result === "进入培育") return "warning";
  if (n.kind === "submit" || n.kind === "revise") return "primary";
  if (n.kind === "ai") return "primary";
  return "success";
}

function nodeIcon(n: AuditFlowNode) {
  switch (n.kind) {
    case "submit": return Send;
    case "revise": return RotateCcw;
    case "ai": return Sparkles;
    case "expert": return UserCheck;
    case "incubate": return Hourglass;
    default:
      if (n.result === "通过") return Check;
      if (n.result === "驳回") return X;
      if (n.result === "进入培育") return Hourglass;
      if (n.result === "提交") return Send;
      return Clock;
  }
}

function resultLabel(n: AuditFlowNode): string {
  if (n.result === "待办") return "待办";
  if (n.kind === "submit") return "已提交";
  if (n.kind === "revise") return "已修改并重新提交";
  if (n.kind === "ai") return n.result === "通过" ? "AI 评分完成" : "AI 评分异常";
  if (n.kind === "expert") return n.result === "通过" ? "审核通过（流程结束）" : n.result === "驳回" ? "已驳回" : n.result;
  if (n.kind === "incubate") return "进入培育库（流程结束）";
  return n.result;
}

interface RoundGroup {
  round: number;
  nodes: AuditFlowNode[];
}

function groupByRound(nodes: AuditFlowNode[]): RoundGroup[] {
  const map = new Map<number, AuditFlowNode[]>();
  nodes.forEach((n) => {
    const r = n.round ?? 1;
    if (!map.has(r)) map.set(r, []);
    map.get(r)!.push(n);
  });
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([round, nodes]) => ({ round, nodes }));
}

function roundConclusion(nodes: AuditFlowNode[]): { label: string; tone: Tone } {
  // 取该轮最终态：done > expert > ai > submit
  const expert = [...nodes].reverse().find((n) => n.kind === "expert");
  const done = nodes.find((n) => n.kind === "done");
  if (done && done.result !== "待办") return { label: "已颁证", tone: "success" };
  if (expert) {
    if (expert.result === "通过") return { label: "专家审核通过", tone: "success" };
    if (expert.result === "驳回") return { label: "专家驳回，企业修改中", tone: "destructive" };
    if (expert.result === "进入培育") return { label: "进入培育库", tone: "warning" };
  }
  if (nodes.some((n) => n.kind === "ai" && n.result !== "待办")) {
    return { label: "AI 评分完成，待专家审核", tone: "primary" };
  }
  if (nodes.some((n) => n.kind === "submit" || n.kind === "revise")) {
    return { label: "已提交，待智能打分", tone: "primary" };
  }
  return { label: "进行中", tone: "muted" };
}

export function AuditFlowTimeline({ nodes, dense = false }: { nodes: AuditFlowNode[]; dense?: boolean }) {
  const groups = groupByRound(nodes);

  return (
    <div className="space-y-5">
      {groups.map((g, gi) => {
        const conclusion = roundConclusion(g.nodes);
        const conclusionTone = TONE_CLASSES[conclusion.tone];
        const isFinal = gi === groups.length - 1;
        return (
          <div
            key={g.round}
            className={cn(
              "rounded-xl border bg-card/60 backdrop-blur-sm transition",
              isFinal ? "border-primary/30 shadow-[0_4px_24px_-12px_hsl(var(--primary)/0.25)]" : "border-border/60",
            )}
          >
            {/* 轮次头 */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-4 py-2.5">
              <span
                className={cn(
                  "inline-flex h-6 min-w-[2rem] items-center justify-center rounded-full px-2 text-[11px] font-semibold",
                  isFinal ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                第 {g.round} 轮
              </span>
              <span className="text-xs text-muted-foreground">
                共 {g.nodes.length} 个环节
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isFinal ? conclusionTone.text.replace("text-", "bg-") : "bg-muted-foreground/40")} />
                <span className={cn("text-xs font-medium", conclusionTone.text)}>
                  {conclusion.label}
                </span>
              </span>
            </div>

            {/* 节点列表（竖向时间轴） */}
            <ol className="relative px-4 py-4">
              {g.nodes.map((n, i) => {
                const tone = nodeTone(n);
                const T = TONE_CLASSES[tone];
                const Icon = nodeIcon(n);
                const isLast = i === g.nodes.length - 1;
                const showScore = SCORED_KIND.has(n.kind ?? "") && n.score != null;
                return (
                  <li key={i} className="relative grid grid-cols-[36px_1fr] gap-3 pb-4 last:pb-0">
                    {/* 竖线 */}
                    {!isLast && (
                      <span
                        className={cn("absolute left-[17px] top-9 bottom-0 w-px", T.line)}
                        aria-hidden
                      />
                    )}
                    {/* 节点圆点 */}
                    <span
                      className={cn(
                        "relative z-10 mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform",
                        T.ring,
                        n.result === "待办" && "animate-pulse",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    {/* 节点内容卡片 */}
                    <div
                      className={cn(
                        "rounded-lg border px-3 py-2.5 transition group",
                        T.soft,
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold text-foreground">{n.stage}</span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                            T.chip,
                          )}
                        >
                          {resultLabel(n)}
                        </span>
                        {showScore && (
                          <span className="inline-flex items-baseline gap-0.5 rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5">
                            <span className={cn("font-mono text-xs font-semibold", T.text)}>{n.score}</span>
                            <span className="text-[10px] text-muted-foreground">/ 100</span>
                          </span>
                        )}
                        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {n.time}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                        <span>{n.operator}</span>
                      </div>
                      {!dense && n.comment && (
                        <p className="mt-2 rounded-md border border-border/40 bg-background/70 p-2 text-[12px] leading-relaxed text-foreground/80">
                          {n.comment}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}

      {/* 流程图例 */}
      {!dense && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">流转说明：</span>
          <LegendDot tone="primary" label="企业填写 / 修改" Icon={Send} />
          <LegendDot tone="primary" label="系统智能打分" Icon={Sparkles} />
          <LegendDot tone="success" label="专家审核通过" Icon={Check} />
          <LegendDot tone="destructive" label="专家驳回（可修改重提）" Icon={X} />
          <LegendDot tone="warning" label="进入培育库" Icon={Hourglass} />
          <LegendDot tone="success" label="完成 · 颁发证书" Icon={Award} />
        </div>
      )}
    </div>
  );
}

function LegendDot({
  tone,
  label,
  Icon,
}: {
  tone: Tone;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const T = TONE_CLASSES[tone];
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("inline-flex h-4 w-4 items-center justify-center rounded-full border", T.ring)}>
        <Icon className="h-2.5 w-2.5" />
      </span>
      <span>{label}</span>
    </span>
  );
}
