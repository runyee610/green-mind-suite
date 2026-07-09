import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  Sparkles,
  Loader2,
  CheckCircle2,
  FileSearch,
  Gauge,
  Lightbulb,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "parse", label: "解析证明材料 & 填报数据", desc: "读取已上传 PDF/图片，抽取关键指标数值", Icon: FileSearch },
  { key: "match", label: "匹配指标评分模型", desc: "对照绿色工厂评价标准计算各项得分", Icon: Gauge },
  { key: "weak", label: "识别薄弱项 & 生成技改建议", desc: "分析低得分指标，匹配节能技改技术库", Icon: Lightbulb },
  { key: "sum", label: "汇总综合评分", desc: "生成一级维度得分与自评结论", Icon: ClipboardCheck },
];

interface Props {
  onComplete: () => void;
  durationMs?: number;
}

export function AIScoringGeneratingOverlay({ onComplete, durationMs = 8000 }: Props) {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = 120;
    const start = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now() - start;
      const pct = Math.min(100, (now / durationMs) * 100);
      setProgress(pct);
      setElapsed(now);
      if (pct >= 100) {
        window.clearInterval(id);
        window.setTimeout(onComplete, 350);
      }
    }, tick);
    return () => window.clearInterval(id);
  }, [durationMs, onComplete]);

  const currentIdx = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));
  const etaSec = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));

  return (
    <Card
      id="ai-scoring"
      className="panel scroll-mt-24 relative overflow-hidden animate-fade-in"
    >
      {/* Tech background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 50% 0%, #000 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, #000 40%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <CardContent className="relative flex flex-col items-center px-6 py-12">
        {/* Robot avatar */}
        <div className="relative mb-5">
          <span className="absolute inset-0 -m-3 rounded-full bg-primary/20 blur-xl animate-pulse-glow" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elevated">
            <Bot className="h-8 w-8" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-white">
              <Sparkles className="h-3 w-3 animate-pulse" />
            </span>
          </span>
        </div>

        <Badge
          variant="outline"
          className="mb-2 border-primary/40 bg-primary/5 font-mono text-[10px] uppercase tracking-widest text-primary"
        >
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          AI Generating
        </Badge>
        <h3 className="text-lg font-semibold text-foreground">
          AI 智能体正在分析
          <span className="ml-0.5 inline-flex w-6 justify-start">
            <span className="animate-pulse">…</span>
          </span>
        </h3>
        <p className="mt-1 max-w-lg text-center text-xs text-muted-foreground">
          请稍等几分钟，AI 正在综合评分并生成节能技改建议。生成过程中你也可以先返回填报页继续完善材料。
        </p>

        {/* Overall progress */}
        <div className="mt-6 w-full max-w-xl">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>综合分析进度</span>
            <span>
              {progress.toFixed(0)}%
              <span className="ml-2 text-muted-foreground/70">
                已用时 {(elapsed / 1000).toFixed(1)}s · 预计剩余 ~{etaSec}s
              </span>
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <ol className="mt-6 w-full max-w-xl space-y-2">
          {STEPS.map((s, idx) => {
            const done = idx < currentIdx || progress >= 100;
            const active = idx === currentIdx && progress < 100;
            const StepIcon = s.Icon;
            return (
              <li
                key={s.key}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-2.5 backdrop-blur-sm transition-colors",
                  done && "border-success/40 bg-success/5",
                  active && "border-primary/40 bg-primary/5",
                  !done && !active && "border-border/60 bg-muted/30",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                    done && "bg-success/15 text-success",
                    active && "bg-primary/15 text-primary",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        done && "text-success",
                        active && "text-foreground",
                        !done && !active && "text-muted-foreground",
                      )}
                    >
                      {idx + 1}. {s.label}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-wider",
                        done && "text-success",
                        active && "text-primary",
                        !done && !active && "text-muted-foreground/70",
                      )}
                    >
                      {done ? "已完成" : active ? "进行中" : "等待中"}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{s.desc}</div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>模型：绿色制造评价智能体 v1.2 · 结果生成后将自动展示</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-4 text-xs text-muted-foreground"
          onClick={onComplete}
        >
          跳过等待，直接查看结果
        </Button>
      </CardContent>
    </Card>
  );
}
