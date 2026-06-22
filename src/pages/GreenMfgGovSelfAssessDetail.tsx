import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Building2, ClipboardList, AlertTriangle, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MOCK_SELF_ASSESS, SCORE_DIMENSIONS } from "@/components/green-mfg/data";
import { cn } from "@/lib/utils";

export default function GreenMfgGovSelfAssessDetail() {
  const { creditCode } = useParams();
  const navigate = useNavigate();

  // 取该企业最新一次评价
  const latest = useMemo(() => {
    const list = MOCK_SELF_ASSESS.filter((r) => r.creditCode === creditCode).sort(
      (a, b) => b.date.localeCompare(a.date),
    );
    return list[0] ?? null;
  }, [creditCode]);

  if (!latest) {
    return (
      <AppLayout title="企业模拟评价 · 详情" subtitle="\n">
        <Card className="panel">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            未找到该企业的模拟评价记录
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/green-mfg/gov/self-assess")}>
                <ArrowLeft className="mr-1 h-3 w-3" />返回列表
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  // 用得分对维度做缩放，得到该企业本次维度得分（mock：与 aiScore 同比例）
  const baseTotal = SCORE_DIMENSIONS.reduce((s, d) => s + d.score, 0);
  const scale = latest.aiScore / Math.max(baseTotal, 1);
  const dims = SCORE_DIMENSIONS.map((d) => ({
    ...d,
    actualScore: Math.round(d.score * scale * 10) / 10,
  }));

  // 薄弱项：取得分率最低的若干二级指标
  const weakItems = SCORE_DIMENSIONS.flatMap((d) =>
    d.children.map((c) => ({
      l1: d.name,
      name: c.name,
      weight: c.weight,
      score: c.score,
      rate: c.weight ? c.score / c.weight : 1,
    })),
  )
    .filter((c) => c.weight > 0)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, latest.weakCount);

  return (
    <AppLayout
      title={`企业模拟评价 · ${latest.enterpriseName}`}
      subtitle="仅展示该企业最新一次 AI 模拟自我评价结果"
    >
      <div className="mb-3">
        <Button variant="outline" size="sm" className="h-8" onClick={() => navigate("/green-mfg/gov/self-assess")}>
          <ArrowLeft className="mr-1 h-3 w-3" />返回列表
        </Button>
      </div>

      {/* 企业信息 */}
      <Card className="panel mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />企业信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Field label="企业名称" value={latest.enterpriseName} />
            <Field label="统一社会信用代码" value={latest.creditCode} mono />
            <Field label="所属区" value={latest.district} />
            <Field label="行业 / 子行业" value={`${latest.industry}${latest.subIndustry ? " / " + latest.subIndustry : ""}`} />
          </div>
        </CardContent>
      </Card>

      {/* 评价摘要 */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-4">
        <SummaryCard title="评价日期" value={latest.date} icon={ClipboardList} accent="cyan" />
        <SummaryCard
          title="AI 模拟分数"
          value={
            <span className="inline-flex items-center">
              <Sparkles className="mr-1 h-4 w-4 text-secondary" />{latest.aiScore}
            </span>
          }
          icon={BarChart3}
          accent="primary"
        />
        <SummaryCard title="指标总数" value={latest.indicatorCount} icon={ClipboardList} accent="success" />
        <SummaryCard title="薄弱项数" value={latest.weakCount} icon={AlertTriangle} accent="warning" />
      </div>

      {/* 维度得分 */}
      <Card className="panel mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />一级指标维度得分
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dims.map((d) => {
            const pct = Math.round((d.actualScore / d.weight) * 100);
            return (
              <div key={d.name}>
                <div className="flex items-baseline justify-between text-sm">
                  <div className="font-medium">{d.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {d.actualScore} / {d.weight} 分（{pct}%）
                  </div>
                </div>
                <Progress value={pct} className="mt-2 h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 薄弱项 */}
      <Card className="panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />薄弱指标清单 · {weakItems.length} 项
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weakItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">暂无薄弱指标</div>
          ) : (
            <div className="space-y-2">
              {weakItems.map((w) => (
                <div
                  key={w.name}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px]">{w.l1}</Badge>
                    <span className="text-sm">{w.name}</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {w.score} / {w.weight} 分（{Math.round(w.rate * 100)}%）
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm font-medium break-all", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: React.ReactNode;
  icon: typeof ClipboardList;
  accent: "primary" | "cyan" | "warning" | "success";
}) {
  const map = {
    primary: { bg: "bg-primary/15", text: "text-primary", value: "text-primary" },
    cyan: { bg: "bg-cyan-500/15", text: "text-cyan-600 dark:text-cyan-300", value: "text-cyan-600 dark:text-cyan-300" },
    warning: { bg: "bg-warning/15", text: "text-warning", value: "text-warning" },
    success: { bg: "bg-success/15", text: "text-success", value: "text-success" },
  } as const;
  const c = map[accent];
  return (
    <Card className="panel">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", c.bg, c.text)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">{title}</div>
            <div className={cn("mt-0.5 text-xl font-bold tracking-tight", c.value)}>{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
