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

  return (
    <AppLayout title="绿色工厂梯度培育 · 上海石化化工新材料分公司" subtitle="本企业培育进展与改进建议">
      {/* 企业基础信息 */}
      <Card className="panel mb-4">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{me.enterpriseName}</CardTitle>
                <div className="mt-0.5 text-[11px] text-muted-foreground font-mono">{me.creditCode}</div>
              </div>
            </div>
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
              区培育中
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <InfoTile label="所属区" value={me.district} />
            <InfoTile label="所属行业" value={`${me.industry}${me.subIndustry ? " / " + me.subIndustry : ""}`} />
            <InfoTile label="产值（万元）" value={me.outputValue.toLocaleString()} />
            <InfoTile label="模拟自评价得分" value={me.score != null ? `${me.score}` : "—"} />
            <InfoTile label="区级专家评分" value={me.manualScore != null ? `${me.manualScore}` : "—"} />
            <InfoTile label="市级专家评分" value="—" />
            <InfoTile label="" value="" />
            <InfoTile label="" value="" />
          </div>
        </CardContent>
      </Card>

      {/* 培育目标 */}
      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        <Card className="panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />培育目标
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-xs text-muted-foreground">当前综合得分</span>
              <span className="text-2xl font-semibold font-mono">{me.score}</span>
            </div>
            <Progress value={(me.score / target) * 100} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>目标得分 {target} 分</span>
              <span className="text-warning">还差 {gap} 分</span>
            </div>
          </CardContent>
        </Card>

        <Card className="panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sprout className="h-4 w-4 text-success" />培育期信息
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <InfoTile label="进入培育时间" value={me.submitDate} />
            <InfoTile label="培育周期" value="12 个月" />
          </CardContent>
        </Card>
      </div>

      {/* AI 节能技术推荐 */}
      <Card className="panel mb-4">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />AI 节能技术推荐
              {research?.status === "researching" && (
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />智能体调研中
                </Badge>
              )}
              {research?.status === "done" && (
                <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
                  已完成 · {research.techs.length} 项
                </Badge>
              )}
            </CardTitle>
            <Button size="sm" variant="outline" className="h-8" onClick={rerun} disabled={research?.status === "researching"}>
              <RefreshCw className="mr-1 h-3 w-3" />重新调研
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!research && (
            <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
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
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <div className="mb-2 text-xs font-medium text-muted-foreground">智能体思考过程（deepthink + deep research）</div>
                <ul className="space-y-1 text-[11px] font-mono text-muted-foreground">
                  {research.logs.map((log, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary/70">[{log.time}]</span>
                      <span className="text-foreground/80">{log.stage}</span>
                      <span className="flex-1">{log.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 薄弱项 */}
              {research.weakAreas.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground">识别薄弱项：</span>
                  {research.weakAreas.map((w) => (
                    <Badge key={w.name} variant="outline" className="border-warning/40 bg-warning/10 text-warning">
                      {w.name} · 缺口 {w.gap} 分
                    </Badge>
                  ))}
                </div>
              )}

              {/* 推荐技术卡片 */}
              {research.techs.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {research.techs.map((t) => (
                    <div key={t.id} className="rounded-md border border-border/60 bg-background/40 p-3 hover:border-primary/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold leading-snug">{t.name}</div>
                        <Badge variant="outline" className="shrink-0 text-[10px]">TRL {t.trl}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span className="text-foreground/90">{t.company}</span>
                          <span className="text-muted-foreground/70">· {t.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          <Badge variant="outline" className="text-[10px] border-primary/30 bg-primary/5 text-primary">
                            {t.category}
                          </Badge>
                          {t.appliesTo.slice(0, 2).map((k) => (
                            <Badge key={k} variant="outline" className="text-[10px] border-warning/30 bg-warning/5 text-warning">
                              {k}
                            </Badge>
                          ))}
                        </div>
                        <div className="pt-1 text-foreground/90">
                          <span className="text-success">▲ </span>{t.benefit}
                        </div>
                        <a
                          href={t.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate">{t.source}</span>
                        </a>
                        <div className="text-muted-foreground/60">引用日期 {t.citedAt}</div>
                      </div>
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

function InfoTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Building2;
}) {
  if (!label && !value) return <div className="hidden lg:block" />;
  return (
    <div className="rounded-md border border-border/60 bg-background/40 px-3 py-2">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value || "—"}</div>
    </div>
  );
}
