import { AlertTriangle, Building2, CalendarDays, FileText, Sprout, Target } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MOCK_DECLARATIONS } from "@/components/green-mfg/data";
import { ScoreBreakdown } from "@/components/green-mfg/ScoreBreakdown";

export default function GreenMfgEntIncubator() {
  // 假定当前企业为培育中样本，否则取首个
  const me =
    MOCK_DECLARATIONS.find((r) => r.stage === "培育中" || r.level === "区级培育") ??
    MOCK_DECLARATIONS[0];

  const target = 80;
  const gap = Math.max(0, target - me.score);

  return (
    <AppLayout title="绿色工厂培育库 · 企业侧" subtitle="本企业培育进展与改进建议">
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
              培育中
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <InfoTile label="所属区" value={me.district} />
            <InfoTile label="所属行业" value={`${me.industry}${me.subIndustry ? " / " + me.subIndustry : ""}`} />
            <InfoTile label="申报批次" value={me.batch} />
            <InfoTile label="提交时间" value={me.submitDate} icon={CalendarDays} />
            <InfoTile label="产值（万元）" value={me.outputValue.toLocaleString()} />
            <InfoTile label="智能打分" value={`${me.score}`} />
            <InfoTile label="专家打分" value={me.manualScore != null ? `${me.manualScore}` : "—"} />
            <InfoTile label="责任审核员" value={me.reviewer ?? "—"} />
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
            <InfoTile label="计划复评批次" value="2026年第一批" />
            <InfoTile label="培育周期" value="12 个月" />
            <InfoTile label="培育阶段" value="资料补正" />
          </CardContent>
        </Card>
      </div>

      {/* 各维度得分 */}
      <Card className="panel mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">各维度得分情况</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScoreBreakdown warnUnderRatio={80} />
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
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <FileText className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
              <span>补充近三年能源审计报告及节能技改项目清单。</span>
            </li>
            <li className="flex gap-2">
              <FileText className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
              <span>提升一般工业固体废物综合利用率至 ≥ 90%，并提供台账与第三方核查证明。</span>
            </li>
            <li className="flex gap-2">
              <FileText className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
              <span>完善绿色产品产值核算口径,提交统计部门 B204-1 报表。</span>
            </li>
            <li className="flex gap-2">
              <FileText className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
              <span>{me.comment ?? "审核意见暂未给出,请关注最新审批进度。"}</span>
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
  return (
    <div className="rounded-md border border-border/60 bg-background/40 px-3 py-2">
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
