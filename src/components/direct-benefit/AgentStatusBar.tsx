import { Brain, Activity, Sparkles, ChevronRight, Database, Workflow, CircleDollarSign, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { workflowSteps, type WorkflowStep } from "./directBenefitData";
import { cn } from "@/lib/utils";

const stepIcon: Record<WorkflowStep["key"], typeof Brain> = {
  collect: FileSearch,
  profile: Database,
  match: Workflow,
  disburse: CircleDollarSign,
};

interface Props {
  /** 摘要数据：覆盖政策数 / 撮合企业数 */
  policiesCount: number;
  matchedEnterprises: number;
  lastRunAt: string;
}

export function AgentStatusBar({ policiesCount, matchedEnterprises, lastRunAt }: Props) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* 左：智能体名片 */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Brain className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground whitespace-nowrap">免审即享智能体</h2>
              <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-[10px]">
                <Activity className="mr-1 h-2.5 w-2.5" />运行中
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
              政策追着企业跑 · 上次运行 <span className="font-mono">{lastRunAt}</span>
            </p>
          </div>
        </div>

        {/* 中：核心数字 */}
        <div className="flex items-center gap-6 text-sm">
          <div>
            <div className="text-[11px] text-muted-foreground">在库政策</div>
            <div className="font-mono text-xl font-semibold text-foreground">{policiesCount}</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <div className="text-[11px] text-muted-foreground">已匹配企业</div>
            <div className="font-mono text-xl font-semibold text-foreground">{matchedEnterprises}</div>
          </div>
        </div>

        {/* 右：4 步工作流芯片（可点击展开看"它做了什么"） */}
        <div className="flex flex-wrap items-center gap-1.5">
          {workflowSteps.map((s, i) => {
            const Icon = stepIcon[s.key];
            return (
              <div key={s.key} className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5">
                      <Icon className="h-3 w-3 text-primary" />
                      {s.name}
                      <span className={cn("ml-0.5 h-1.5 w-1.5 rounded-full", s.confidence >= 0.9 ? "bg-success" : "bg-warning")} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="border-b border-border bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-semibold">{s.name}</span>
                        <Badge variant="outline" className="ml-auto border-primary/30 bg-primary/5 text-primary text-[10px]">
                          置信度 {(s.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{s.description}</p>
                    </div>
                    <div className="space-y-2.5 px-3 py-2.5 text-xs">
                      <div>
                        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">数据来源</div>
                        <div className="flex flex-wrap gap-1">
                          {s.sources.map((src) => (
                            <span key={src} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-foreground">{src}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">智能体产出</div>
                        <ul className="space-y-0.5 text-[11px] text-foreground">
                          {s.outputs.map((o) => (
                            <li key={o} className="flex items-start gap-1.5">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t border-border/60 pt-1.5 text-[10px] text-muted-foreground">
                        上次运行：<span className="font-mono">{s.lastRunAt}</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {i < workflowSteps.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
