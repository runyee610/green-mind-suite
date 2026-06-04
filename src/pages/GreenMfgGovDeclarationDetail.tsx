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
import { AIScoringAgentPanel } from "@/components/green-mfg/AIScoringAgentPanel";
import { DataAttestationPanel } from "@/components/green-mfg/DataAttestationPanel";
import {
  EnterpriseBasicInfoCard,
  BasicRequirementsCard,
  EvaluationIndicatorCard,
} from "@/components/green-mfg/DeclarationDetailSections";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "evaluation-indicator", label: "评价指标表（通则）" },
  { value: "basic-info", label: "企业基本信息表" },
  { value: "basic-requirements", label: "基本要求" },
  { value: "audit-record", label: "审批记录" },
  { value: "ai-scoring", label: "AI 打分结果" },

];

export default function GreenMfgGovDeclarationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isIncubator = (id ?? "").startsWith("INC-");
  const detail = useMemo(
    () => MOCK_DECLARATIONS.find((d) => d.id === id) ?? MOCK_DECLARATIONS[0],
    [id],
  );

  const [approveOpen, setApproveOpen] = useState(false);
  const [cultivateOpen, setCultivateOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState<string>(TABS[0].value);
  const [indicators, setIndicators] = useState<IndicatorRow[]>(EVALUATION_INDICATORS);

  const totalScore = SCORE_DIMENSIONS.reduce((s, d) => s + d.score, 0);
  const totalWeight = SCORE_DIMENSIONS.reduce((s, d) => s + d.weight, 0);

  const handleApprove = () => {
    toast.success(detail.stage === "待审核" ? "已通过审核，颁发市级绿色工厂" : "已通过，颁发市级绿色工厂");
    setApproveOpen(false);
    setComment("");
  };
  const handleCultivate = () => {
    toast.success("已转入培育阶段，企业等级标记为「区级培育」");
    setCultivateOpen(false);
    setComment("");
  };
  const handleReject = () => {
    toast.error("已驳回该申报，企业可按意见整改后重新提交");
    setRejectOpen(false);
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
        <Badge variant="outline" className={stageBadgeClass(detail.stage)}>{detail.stage}</Badge>
        <div className="flex items-center gap-2">
          {!isIncubator && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectOpen(true)}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <ShieldX className="mr-1 h-4 w-4" />驳回
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCultivateOpen(true)}
                className="border-warning/40 text-warning hover:bg-warning/10 hover:text-warning"
              >
                <Clock className="mr-1 h-4 w-4" />进入培育
              </Button>
              <Button
                size="sm"
                onClick={() => setApproveOpen(true)}
                className="bg-success text-success-foreground hover:bg-success/90"
              >
                <ShieldCheck className="mr-1 h-4 w-4" />通过
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate(isIncubator ? "/green-mfg/gov/incubator" : "/green-mfg/gov")}>
            <ArrowLeft className="mr-1 h-4 w-4" />返回列表
          </Button>
        </div>
      </div>

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

        <TabsContent value="basic-info" className="mt-0">
          <EnterpriseBasicInfoCard />
        </TabsContent>
        <TabsContent value="basic-requirements" className="mt-0">
          <BasicRequirementsCard />
        </TabsContent>
        <TabsContent value="evaluation-indicator" className="mt-0">
          <EvaluationIndicatorCard mode="gov" data={indicators} onChange={setIndicators} />
        </TabsContent>
        <TabsContent value="ai-scoring" className="mt-0">
          <AIScoringAgentPanel initialFinished hideSupplementButton />
        </TabsContent>

      </Tabs>

      {/* 通过 */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-success"><ShieldCheck className="mr-2 inline h-5 w-5" />确认通过</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{detail.stage === "待审核" ? "通过后将颁发市级绿色工厂证书并锁定本次自评价。" : "通过后将颁发市级绿色工厂证书并锁定本次自评价。"}</p>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="审批意见（选填）" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>取消</Button>
            <Button onClick={handleApprove} className="bg-success text-success-foreground hover:bg-success/90">确认通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 培育 */}
      <Dialog open={cultivateOpen} onOpenChange={setCultivateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-warning"><Clock className="mr-2 inline h-5 w-5" />转入培育阶段</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">企业未达本次评定要求，转入区级培育，可在下一周期重新自评价。</p>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="培育阶段说明 / 整改方向（选填）" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCultivateOpen(false)}>取消</Button>
            <Button onClick={handleCultivate} className="bg-warning text-warning-foreground hover:bg-warning/90">确认转入培育</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 驳回 */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive"><ShieldX className="mr-2 inline h-5 w-5" />驳回申报</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">驳回后本次申报将被退回企业，企业需按驳回意见整改后重新提交。</p>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="驳回意见（建议填写，便于企业整改）" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>取消</Button>
            <Button onClick={handleReject} variant="destructive">确认驳回</Button>
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
