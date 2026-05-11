import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock, FileText, ShieldCheck, ShieldX, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MOCK_AUDIT_FLOW,
  MOCK_DECLARATIONS,
  SCORE_DIMENSIONS,
  stageBadgeClass,
} from "@/components/green-mfg/data";
import { DeclarationDetailSections } from "@/components/green-mfg/DeclarationDetailSections";
import { cn } from "@/lib/utils";

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

  const totalScore = SCORE_DIMENSIONS.reduce((s, d) => s + d.score, 0);

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

      {/* 锚点导航 */}
      <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-wrap items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <span className="px-2 text-[11px] text-muted-foreground">快速跳转：</span>
        {[
          { href: "audit-record", label: "审批记录" },
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

      <div className="grid gap-4 lg:grid-cols-5">
        {/* 审批记录 */}
        <Card id="audit-record" className="panel scroll-mt-24 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ChevronRight className="h-4 w-4 text-primary" />
              审批记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border/60 pl-5">
              {MOCK_AUDIT_FLOW.map((n, i) => (
                <li key={i} className="relative">
                  <span className={cn("absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-background",
                    n.result === "通过" ? "bg-success" :
                    n.result === "驳回" ? "bg-destructive" :
                    n.result === "进入培育" ? "bg-warning" :
                    n.result === "提交" ? "bg-primary" : "bg-muted-foreground/40")} />
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{n.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground">{n.time}</span>
                      <Badge variant="outline" className={cn("h-5 text-[10px]",
                        n.result === "通过" ? "border-success/40 bg-success/10 text-success" :
                        n.result === "驳回" ? "border-destructive/40 bg-destructive/10 text-destructive" :
                        n.result === "进入培育" ? "border-warning/40 bg-warning/10 text-warning" :
                        n.result === "提交" ? "border-primary/40 bg-primary/10 text-primary" :
                        "border-border")}>{n.result}</Badge>
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.operator}</p>
                  {n.comment && <p className="mt-1 rounded bg-muted/40 p-2 text-xs leading-relaxed">{n.comment}</p>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* 智能打分 */}
        <Card id="smart-score" className="panel scroll-mt-24 lg:col-span-2">
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
                {detail.score >= 80 ? "推荐通过" : detail.score >= 60 ? "建议人工复核" : "不达标"}
              </Badge>
            </div>
            <div className="space-y-2.5">
              {SCORE_DIMENSIONS.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs">
                    <span>
                      {d.name}
                      <span className="ml-1 text-muted-foreground">（权重 {d.weight}）</span>
                    </span>
                    <span className="font-mono">{d.score}/{d.weight}</span>
                  </div>
                  <Progress value={(d.score / d.weight) * 100} className="mt-1 h-1.5" />
                </div>
              ))}
            </div>
            <p className="mt-3 rounded bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
              合计 {totalScore} 分；模型基于近三年能源、碳排、固废等口径数据综合计算。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 申报书四部分 */}
      <DeclarationDetailSections />

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
