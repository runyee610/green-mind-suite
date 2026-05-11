import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Sparkles, UserCheck } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  MOCK_AUDIT_FLOW,
  MOCK_DECLARATIONS,
  SCORE_DIMENSIONS,
  stageBadgeClass,
} from "@/components/green-mfg/data";
import { DeclarationDetailSections } from "@/components/green-mfg/DeclarationDetailSections";
import { cn } from "@/lib/utils";

export default function GreenMfgEntDeclarationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = useMemo(
    () => MOCK_DECLARATIONS.find((d) => d.id === id) ?? MOCK_DECLARATIONS[0],
    [id],
  );

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
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/ent")}>
          <ArrowLeft className="mr-1 h-4 w-4" />返回
        </Button>
      </div>

      {/* 锚点导航 */}
      <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-wrap items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <span className="px-2 text-[11px] text-muted-foreground">快速跳转：</span>
        {[
          { href: "audit-flow", label: "审批流转" },
          { href: "smart-score", label: "智能打分" },
          { href: "basic-info", label: "企业基本信息表" },
          { href: "basic-requirements", label: "基本要求" },
          { href: "evaluation-indicator", label: "评价指标表（通则）" },
          { href: "authenticity-commitment", label: "真实性承诺" },
        ].map((a) => (
          <a
            key={a.href}
            href={`#${a.href}`}
            className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {a.label}
          </a>
        ))}
      </div>

      {/* 状态 + 打分 概览 */}
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
              <UserCheck className="mr-1 inline h-3.5 w-3.5 text-success" />人工打分
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
                    待人工审核
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

      <div className="grid gap-4 lg:grid-cols-5">
        {/* 审核流转 */}
        <Card id="audit-flow" className="panel scroll-mt-24 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ChevronRight className="h-4 w-4 text-primary" />审批流转
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border/60 pl-5">
              {MOCK_AUDIT_FLOW.map((n, i) => (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-background",
                      n.result === "通过"
                        ? "bg-success"
                        : n.result === "驳回"
                        ? "bg-destructive"
                        : n.result === "进入培育"
                        ? "bg-warning"
                        : n.result === "提交"
                        ? "bg-primary"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{n.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground">{n.time}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 text-[10px]",
                          n.result === "通过"
                            ? "border-success/40 bg-success/10 text-success"
                            : n.result === "驳回"
                            ? "border-destructive/40 bg-destructive/10 text-destructive"
                            : n.result === "进入培育"
                            ? "border-warning/40 bg-warning/10 text-warning"
                            : n.result === "提交"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border",
                        )}
                      >
                        {n.result}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.operator}</p>
                  {n.comment && (
                    <p className="mt-1 rounded bg-muted/40 p-2 text-xs leading-relaxed">{n.comment}</p>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* 智能打分 明细 */}
        <Card id="smart-score" className="panel scroll-mt-24 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-secondary" />智能打分明细
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {SCORE_DIMENSIONS.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs">
                    <span>
                      {d.name}
                      <span className="ml-1 text-muted-foreground">（权重 {d.weight}）</span>
                    </span>
                    <span className="font-mono">
                      {d.score}/{d.weight}
                    </span>
                  </div>
                  <Progress value={(d.score / d.weight) * 100} className="mt-1 h-1.5" />
                </div>
              ))}
            </div>
            <p className="mt-3 rounded bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
              基于近三年能源、碳排、固废等口径数据综合计算。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 申报书四部分 */}
      <DeclarationDetailSections />
    </AppLayout>
  );
}
