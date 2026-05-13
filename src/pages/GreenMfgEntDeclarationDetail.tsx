import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Sparkles, UserCheck } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MOCK_AUDIT_FLOW,
  MOCK_DECLARATIONS,
  stageBadgeClass,
} from "@/components/green-mfg/data";
import { AuditFlowTimeline } from "@/components/green-mfg/AuditFlowTimeline";
import { ScoreBreakdown } from "@/components/green-mfg/ScoreBreakdown";
import {
  EnterpriseBasicInfoCard,
  BasicRequirementsCard,
  EvaluationIndicatorCard,
  AuthenticityCommitmentCard,
} from "@/components/green-mfg/DeclarationDetailSections";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "audit-flow", label: "审批流转" },
  { value: "basic-info", label: "企业基本信息表" },
  { value: "evaluation-indicator", label: "评价指标表（通则）" },
  { value: "basic-requirements", label: "基本要求" },
  { value: "authenticity-commitment", label: "真实性承诺" },
  { value: "smart-score", label: "智能打分明细" },
];

export default function GreenMfgEntDeclarationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = useMemo(
    () => MOCK_DECLARATIONS.find((d) => d.id === id) ?? MOCK_DECLARATIONS[0],
    [id],
  );
  const [activeTab, setActiveTab] = useState<string>(TABS[0].value);

  const scoreTone = (s: number) =>
    s >= 80
      ? "border-success/40 bg-success/10 text-success"
      : s >= 60
      ? "border-warning/40 bg-warning/10 text-warning"
      : "border-destructive/40 bg-destructive/10 text-destructive";

  return (
    <AppLayout
      title={detail.enterpriseName}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">{detail.creditCode}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{detail.industry}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{detail.batch}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono">{detail.submitDate}</span>
        </span>
      }
    >
      {/* 返回按钮：与副标题底部对齐 */}
      <div className="-mt-16 mb-3 flex items-center justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/ent")}>
          <ArrowLeft className="mr-1 h-4 w-4" />返回
        </Button>
      </div>

      {/* 状态 + 打分 概览：常态化展示，置于选项卡上方 */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Card className="panel">
          <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
            <p className="text-xs text-muted-foreground">当前状态</p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={cn("h-7 px-3 text-sm", stageBadgeClass(detail.stage))}>
                {detail.stage}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                {detail.reviewer ? `审核人：${detail.reviewer}` : "等待分派"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="panel">
          <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
            <p className="text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-secondary" />智能打分
            </p>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold leading-none text-primary">{detail.score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <Badge variant="outline" className={scoreTone(detail.score)}>
                {detail.score >= 80 ? "推荐通过" : detail.score >= 60 ? "建议复核" : "不达标"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="panel">
          <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
            <p className="text-xs text-muted-foreground">
              <UserCheck className="mr-1 inline h-3.5 w-3.5 text-success" />专家打分
            </p>
            <div className="flex items-end justify-between">
              {detail.manualScore != null ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold leading-none text-success">{detail.manualScore}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <Badge variant="outline" className={scoreTone(detail.manualScore)}>
                    {detail.manualScore >= 80 ? "通过" : detail.manualScore >= 60 ? "复核中" : "不达标"}
                  </Badge>
                </>
              ) : (
                <>
                  <span className="text-2xl font-semibold leading-none text-muted-foreground">—</span>
                  <Badge variant="outline" className="border-muted-foreground/30 text-[10px] text-muted-foreground">
                    待专家审核
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {detail.comment && (
        <div className="mb-4 rounded-md border border-border/60 bg-muted/30 p-3">
          <p className="text-[11px] text-muted-foreground">最新审核意见</p>
          <p className="mt-1 text-sm leading-relaxed">{detail.comment}</p>
        </div>
      )}

      {/* 分页 Tab 导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="sticky top-0 z-10 h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1.5">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-base font-medium px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="audit-flow" className="mt-0">
          <Card className="panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ChevronRight className="h-4 w-4 text-primary" />审批流转
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AuditFlowTimeline nodes={MOCK_AUDIT_FLOW} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart-score" className="mt-0">
          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="panel">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-secondary" />智能打分明细
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between rounded-md border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-primary">{detail.score}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <Badge variant="outline" className={scoreTone(detail.score)}>
                    {detail.score >= 80 ? "推荐通过" : detail.score >= 60 ? "建议复核" : "不达标"}
                  </Badge>
                </div>
                <ScoreBreakdown />
                <p className="mt-3 rounded bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
                  基于近三年能源、碳排、固废等口径数据综合计算。
                </p>
              </CardContent>
            </Card>

            <Card className="panel">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCheck className="h-4 w-4 text-success" />专家打分
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detail.manualScore != null ? (
                  <>
                    <div className="mb-4 flex items-center justify-between rounded-md border border-border/60 bg-muted/30 p-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold text-success">{detail.manualScore}</span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                      </div>
                      <Badge variant="outline" className={scoreTone(detail.manualScore)}>
                        {detail.manualScore >= 80 ? "通过" : detail.manualScore >= 60 ? "复核中" : "不达标"}
                      </Badge>
                    </div>
                    <ScoreBreakdown ratio={detail.score ? detail.manualScore! / detail.score : 1} />
                    {detail.comment && (
                      <div className="mt-3 rounded bg-muted/40 p-2 text-[11px] leading-relaxed">
                        <span className="text-muted-foreground">专家意见：</span>
                        {detail.comment}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/60 bg-muted/20 p-6 text-center">
                    <UserCheck className="h-6 w-6 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">尚未完成专家打分</p>
                    <p className="text-[11px] text-muted-foreground">智能打分通过后，将由行业专家进行复核打分。</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="basic-info" className="mt-0">
          <EnterpriseBasicInfoCard />
        </TabsContent>
        <TabsContent value="basic-requirements" className="mt-0">
          <BasicRequirementsCard />
        </TabsContent>
        <TabsContent value="evaluation-indicator" className="mt-0">
          <EvaluationIndicatorCard mode="ent" />
        </TabsContent>
        <TabsContent value="authenticity-commitment" className="mt-0">
          <AuthenticityCommitmentCard defaultSignedFileName="真实性承诺函-签章扫描件.pdf" />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
