import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Sprout,
  Target,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MOCK_DECLARATIONS } from "@/components/green-mfg/data";
import {
  loadResearch,
  runIncubatorResearch,
  type IncubatorResearchResult,
} from "@/components/green-mfg/incubatorResearchData";

export default function GreenMfgEntIncubator() {
  const me =
    MOCK_DECLARATIONS.find((r) => r.stage === "培育中" || r.level === "区级培育") ??
    MOCK_DECLARATIONS[0];

  const target = 80;
  const gap = Math.max(0, target - me.score);

  const [research, setResearch] = useState<IncubatorResearchResult | null>(() =>
    loadResearch(me.creditCode),
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === me.creditCode) setResearch(loadResearch(me.creditCode));
    };
    window.addEventListener("incubator-research-updated", handler as EventListener);
    return () => window.removeEventListener("incubator-research-updated", handler as EventListener);
  }, [me.creditCode]);

  const rerun = () => {
    void runIncubatorResearch({
      creditCode: me.creditCode,
      enterpriseName: me.enterpriseName,
      onUpdate: setResearch,
    });
  };

  const overviewStats: Array<{ label: string; value: string }> = [
    { label: "所属区", value: me.district },
    { label: "所属行业", value: `${me.industry}${me.subIndustry ? " / " + me.subIndustry : ""}` },
    { label: "产值（万元）", value: me.outputValue.toLocaleString() },
    { label: "模拟自评价得分", value: me.score != null ? `${me.score}` : "—" },
    { label: "区级专家评分", value: me.manualScore != null ? `${me.manualScore}` : "—" },
    { label: "市级专家评分", value: "—" },
  ];

  return (
    <AppLayout title="梯度培育&nbsp;" subtitle="">
      {/* 企业培育总览 */}
      <Card className="panel mb-4">
        <CardContent className="p-6 space-y-6">
          {/* 顶部：企业标识 */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold leading-tight">{me.enterpriseName}</div>
              <div className="mt-1 text-[11px] text-muted-foreground font-mono">{me.creditCode}</div>
            </div>
          </div>

          {/* 中部：信息网格 */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border/40 pt-5 md:grid-cols-3 lg:grid-cols-6">
            {overviewStats.map((s) => (
              <div key={s.label} className="min-w-0">
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
                <div className="mt-1 truncate text-sm font-medium text-foreground">{s.value}</div>
              </div>
            ))}
          </div>

          {/* 底部：培育目标 + 培育期信息 */}
          <div className="grid gap-6 border-t border-border/40 pt-5 lg:grid-cols-[1.4fr_1fr]">
            {/* 培育目标 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4 text-primary" />培育目标
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold font-mono leading-none">{me.score}</span>
                  <span className="text-xs text-muted-foreground">/ {target}</span>
                </div>
              </div>
              <Progress value={(me.score / target) * 100} className="h-1.5" />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>当前综合得分</span>
                <span className="text-warning">还差 {gap} 分达成培育目标</span>
              </div>
            </div>

            {/* 培育期信息 */}
            <div className="space-y-3 lg:border-l lg:border-border/40 lg:pl-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sprout className="h-4 w-4 text-success" />培育期信息
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-muted-foreground">进入培育时间</div>
                  <div className="mt-1 text-sm font-medium">{me.submitDate}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">培育周期</div>
                  <div className="mt-1 text-sm font-medium">12 个月</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI 节能技术推荐 */}
      <Card className="panel mb-4">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              AI 节能技术推荐
              {research?.status === "researching" && (
                <Badge variant="outline" className="border-border/60 bg-muted/40 text-muted-foreground font-normal">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />智能体调研中
                </Badge>
              )}
              {research?.status === "done" && (
                <Badge variant="outline" className="border-success/30 bg-success/10 text-success font-normal">
                  已完成 · {research.techs.length} 项
                </Badge>
              )}
            </CardTitle>
            <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-foreground" onClick={rerun} disabled={research?.status === "researching"}>
              <RefreshCw className="mr-1 h-3 w-3" />重新调研
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {!research && (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-xs text-muted-foreground">
              请先在「模拟自我评价」页点击「加入培育库」启动智能体调研。
              <div className="mt-3">
                <Button size="sm" variant="outline" className="h-8" onClick={rerun}>
                  <Sparkles className="mr-1 h-3 w-3" />立即启动调研
                </Button>
              </div>
            </div>
          )}

          {research && (
            <>
              {/* 调研思考日志 */}
              <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  智能体思考过程 · deepthink + deep research
                </div>
                <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                  {research.logs.map((log, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-mono text-muted-foreground/50 shrink-0">{log.time}</span>
                      <span className="text-foreground/70 font-medium shrink-0 w-20">{log.stage}</span>
                      <span className="flex-1 text-muted-foreground">{log.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 薄弱项 */}
              {research.weakAreas.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground">识别薄弱项</span>
                  {research.weakAreas.map((w) => (
                    <span
                      key={w.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-foreground/80"
                    >
                      {w.name}
                      <span className="text-muted-foreground/60">·</span>
                      <span className="text-warning font-medium">缺口 {w.gap} 分</span>
                    </span>
                  ))}
                </div>
              )}

              {/* 推荐技术卡片 */}
              {research.techs.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {research.techs.map((t) => (
                    <div
                      key={t.id}
                      className="group rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                    >
                      {/* 标题 + TRL */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold leading-snug text-foreground">{t.name}</div>
                        <span className="shrink-0 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          TRL {t.trl}
                        </span>
                      </div>

                      {/* 公司 / 地点 */}
                      <div className="mt-2.5 flex items-start gap-1.5 text-[12px]">
                        <Building2 className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/70" />
                        <div className="min-w-0">
                          <div className="truncate text-foreground/90">{t.company}</div>
                          <div className="mt-0.5 truncate text-[11px] text-muted-foreground/70">{t.location}</div>
                        </div>
                      </div>

                      {/* 统一中性标签 */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {t.category}
                        </span>
                        {t.appliesTo.slice(0, 2).map((k) => (
                          <span
                            key={k}
                            className="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {k}
                          </span>
                        ))}
                      </div>

                      {/* 收益 */}
                      <div className="mt-3 flex items-start gap-1.5 border-t border-border/40 pt-3 text-[12px] text-foreground/85">
                        <span className="text-success shrink-0">▲</span>
                        <span className="leading-relaxed">{t.benefit}</span>
                      </div>

                      {/* 引用源 */}
                      <a
                        href={t.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 flex items-center gap-1 text-[11px] text-primary/90 hover:text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{t.source}</span>
                      </a>
                      <div className="mt-0.5 text-[10px] text-muted-foreground/60">引用日期 {t.citedAt}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 改进建议 */}
      <Card className="panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />改进建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {research?.status === "done" && research.techs.slice(0, 4).map((t) => (
              <li key={t.id} className="flex gap-2">
                <FileText className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  建议引入 <span className="text-foreground font-medium">{t.name}</span>
                  （{t.company}），{t.benefit}。
                </span>
              </li>
            ))}
            {!research && (
              <li className="flex gap-2">
                <FileText className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
                <span>启动 AI 智能体调研后，将在此自动生成针对薄弱项的改进建议。</span>
              </li>
            )}
            <li className="flex gap-2">
              <FileText className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
              <span>{me.comment ?? "审核意见暂未给出，请关注最新审批进度。"}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

