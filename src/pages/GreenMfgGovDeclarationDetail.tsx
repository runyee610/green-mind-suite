import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock, FileText, ShieldCheck, ShieldX, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MOCK_AUDIT_FLOW,
  MOCK_DECLARATIONS,
  SCORE_DIMENSIONS,
  stageBadgeClass,
} from "@/components/green-mfg/data";
import { EVALUATION_INDICATORS, type IndicatorRow } from "@/components/green-mfg/evaluationIndicators";
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
  { value: "audit-record", label: "审批记录" },
  { value: "smart-score", label: "智能打分" },
  { value: "basic-info", label: "企业基本信息表" },
  { value: "basic-requirements", label: "基本要求" },
  { value: "evaluation-indicator", label: "评价指标表（通则）" },
  { value: "authenticity-commitment", label: "真实性承诺" },
];

export default function GreenMfgGovDeclarationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = useMemo(
    () => MOCK_DECLARATIONS.find((d) => d.id === id) ?? MOCK_DECLARATIONS[0],
    [id],
  );

  const [approveOpen, setApproveOpen] = useState(false);
  const [cultivateOpen, setCultivateOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState<string>(TABS[0].value);
  const [indicators, setIndicators] = useState<IndicatorRow[]>(EVALUATION_INDICATORS);

  const totalScore = SCORE_DIMENSIONS.reduce((s, d) => s + d.score, 0);
  const totalWeight = SCORE_DIMENSIONS.reduce((s, d) => s + d.weight, 0);

  const handleApprove = () => {
    toast.success(detail.stage === "区审批" ? "已上报市级审批" : "已上报，颁发市级绿色工厂");
    setApproveOpen(false);
    setComment("");
  };
  const handleCultivate = () => {
    toast.success("已转入培育阶段，企业等级标记为「区级培育」");
    setCultivateOpen(false);
    setComment("");
  };

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
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/gov")}>
          <ArrowLeft className="mr-1 h-4 w-4" />返回列表
        </Button>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={stageBadgeClass(detail.stage)}>{detail.stage}</Badge>
          <Button variant="outline" size="sm" onClick={() => setCultivateOpen(true)}>
            <Clock className="mr-1 h-4 w-4" />进入培育
          </Button>
          <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setApproveOpen(true)}>
            <ShieldCheck className="mr-1 h-4 w-4" />上报
          </Button>
        </div>
      </div>

      {/* 分页 Tab 导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="sticky top-0 z-10 h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="audit-record" className="mt-0">
          <Card className="panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ChevronRight className="h-4 w-4 text-primary" />
                审批记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AuditFlowTimeline nodes={MOCK_AUDIT_FLOW} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart-score" className="mt-0">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="panel">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  智能打分
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-end justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold leading-none text-primary">{detail.score}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    detail.score >= 80 ? "border-success/40 bg-success/10 text-success" :
                    detail.score >= 60 ? "border-warning/40 bg-warning/10 text-warning" :
                    "border-destructive/40 bg-destructive/10 text-destructive")}>
                    {detail.score >= 80 ? "推荐通过" : detail.score >= 60 ? "建议专家复核" : "不达标"}
                  </Badge>
                </div>
                <ScoreBreakdown />
                <p className="mt-3 rounded bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
                  合计 {totalScore} / {totalWeight} 分；模型基于近三年能源、碳排、固废等口径数据综合计算。
                </p>
              </CardContent>
            </Card>

            <Card className="panel">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCheck className="h-4 w-4 text-success" />
                  专家打分
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-end justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2.5">
                  {detail.manualScore != null ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold leading-none text-success">{detail.manualScore}</span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                      </div>
                      <Badge variant="outline" className={cn(
                        detail.manualScore >= 80 ? "border-success/40 bg-success/10 text-success" :
                        detail.manualScore >= 60 ? "border-warning/40 bg-warning/10 text-warning" :
                        "border-destructive/40 bg-destructive/10 text-destructive")}>
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
                <ScoreBreakdown
                  ratio={detail.manualScore != null && detail.score ? detail.manualScore / detail.score : 1}
                  hideValues={detail.manualScore == null}
                />
                <p className="mt-3 rounded bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
                  {detail.manualScore != null
                    ? `专家组复核结论：${detail.comment ?? "已完成核验，结果以审批意见为准。"}`
                    : "尚未分派专家或专家评审未完成。"}
                </p>
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
          <EvaluationIndicatorCard mode="gov" />
        </TabsContent>
        <TabsContent value="authenticity-commitment" className="mt-0">
          <AuthenticityCommitmentCard defaultSignedFileName="真实性承诺函-签章扫描件.pdf" />
        </TabsContent>
      </Tabs>

      {/* 上报 */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-success"><ShieldCheck className="mr-2 inline h-5 w-5" />确认上报</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{detail.stage === "区审批" ? "上报后将自动进入市级审批。" : "上报后将颁发市级绿色工厂证书并锁定本次申报。"}</p>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="审批意见（选填）" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>取消</Button>
            <Button onClick={handleApprove} className="bg-success text-success-foreground hover:bg-success/90">确认上报</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 培育 */}
      <Dialog open={cultivateOpen} onOpenChange={setCultivateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-warning"><Clock className="mr-2 inline h-5 w-5" />转入培育阶段</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">企业未达本次评定要求，转入区级培育，可在下一周期重新申报。</p>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="培育阶段说明 / 整改方向（选填）" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCultivateOpen(false)}>取消</Button>
            <Button onClick={handleCultivate} className="bg-warning text-warning-foreground hover:bg-warning/90">确认转入培育</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm", mono && "font-mono text-xs")}>{value}</p>
    </div>
  );
}
