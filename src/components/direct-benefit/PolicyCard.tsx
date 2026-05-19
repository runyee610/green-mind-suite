import { useState } from "react";
import { ChevronDown, ExternalLink, FileText, Coins, CalendarClock, ShieldCheck, Sparkles, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { domainStyle, type Policy } from "./directBenefitData";

interface Props {
  policy: Policy;
  role: "gov" | "ent";
  /** 企业侧：该政策对当前企业的命中情况，用于显示"已命中 N/M 条" */
  hitInfo?: { hit: number; total: number; confidence: number };
  onClaim?: () => void;
  onPush?: () => void;
}

export function PolicyCard({ policy, role, hitInfo, onClaim, onPush }: Props) {
  const [open, setOpen] = useState(false);
  const ds = domainStyle[policy.domain];

  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      {/* 顶部标签 */}
      <div className="flex items-center gap-2">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", ds.badge)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", ds.dot)} />
          {policy.domain}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
          <Coins className="h-3 w-3" />
          {policy.fundingMin}–{policy.fundingMax} 万
        </span>
        {hitInfo && (
          <Badge
            variant="outline"
            className={cn(
              "ml-auto text-[10px]",
              hitInfo.hit === hitInfo.total
                ? "border-success/40 bg-success/10 text-success"
                : "border-warning/40 bg-warning/10 text-warning",
            )}
          >
            已命中 {hitInfo.hit}/{hitInfo.total}
          </Badge>
        )}
      </div>

      {/* 标题与摘要 */}
      <h3 className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">{policy.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{policy.summary}</p>

      {/* 元信息行 */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{policy.docNo}</span>
        <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" />截止 {policy.deadline}</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{policy.issuer}</span>
      </div>

      {/* AI 透明化条 */}
      <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1 font-medium text-primary">
            <Sparkles className="h-3 w-3" />智能体解析置信度
          </span>
          <span className="font-mono text-foreground">{(policy.parseConfidence * 100).toFixed(0)}%</span>
        </div>
        <Progress value={policy.parseConfidence * 100} className="mt-1.5 h-1" />
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>抓取时间 <span className="font-mono">{policy.fetchedAt}</span></span>
          <a
            href={policy.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            原文 <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>

      {/* 智能体解读折叠区 */}
      <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/50">
            <span>智能体解读：条件 / 额度 / 申报指引</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-3 rounded-md border border-border/60 bg-muted/20 p-3 text-xs">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">申报条件</div>
            <ul className="space-y-1">
              {policy.conditions.map((c) => (
                <li key={c.key} className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <div className="text-foreground">{c.text}</div>
                    <div className="text-[10px] text-muted-foreground">取数：{c.dataField}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">资助额度</div>
            <p className="text-foreground">{policy.fundingFormula}</p>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">申报指引</div>
            <ol className="space-y-0.5">
              {policy.guideSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-foreground">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 操作 */}
      <div className="mt-3 flex items-center gap-2">
        {role === "ent" ? (
          <>
            <Button size="sm" className="flex-1" onClick={onClaim}>
              <Send className="mr-1 h-3.5 w-3.5" />一键确认申领
            </Button>
            {hitInfo && (
              <span className="text-[10px] text-muted-foreground">
                预计 <span className="font-mono text-foreground">{Math.round((policy.fundingMin + policy.fundingMax) / 2)}</span> 万
              </span>
            )}
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" className="flex-1" onClick={onPush}>
              <Send className="mr-1 h-3.5 w-3.5" />点对点推送
            </Button>
            <Badge variant="outline" className="border-border/60 bg-muted/40 text-[10px] text-muted-foreground">
              {policy.status}
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}
