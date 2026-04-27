import { useState } from "react";
import { ArrowLeft, CheckCircle2, FileImage, FileSpreadsheet, FileText, MessageSquare, Printer, ShieldCheck, ShieldX, Upload, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { QuotaDetail } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

const fmt = (n: number, d = 0) => n.toLocaleString(undefined, { maximumFractionDigits: d });

const materialIcon = (t: string) => {
  switch (t) {
    case "image": return FileImage;
    case "excel": return FileSpreadsheet;
    default: return FileText;
  }
};

export function AuditDetailView({ detail, onBack }: { detail: QuotaDetail; onBack: () => void }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [approveComment, setApproveComment] = useState("");
  const [rejectErr, setRejectErr] = useState(false);

  const submitReject = () => {
    if (!rejectComment.trim()) {
      setRejectErr(true);
      toast.error("驳回时必须填写审批意见");
      return;
    }
    toast.success("已驳回，审批意见已发送至企业");
    setRejectOpen(false);
    setRejectComment("");
    setRejectErr(false);
  };

  const submitApprove = () => {
    toast.success("审批通过，企业状态已更新为「已完成」");
    setApproveOpen(false);
    setApproveComment("");
  };

  const exceedRows = detail.energyData.filter((r) => r.exceed).length;

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <Card className="panel">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" />返回列表</Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{detail.enterpriseName}</h2>
                <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">待审核</Badge>
              </div>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{detail.creditCode} · {detail.industry}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("已生成 PDF 预览")}><Printer className="mr-1 h-4 w-4" />打印 PDF</Button>
            <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)}><ShieldX className="mr-1 h-4 w-4" />驳回</Button>
            <Button size="sm" onClick={() => setApproveOpen(true)} className="bg-success text-success-foreground hover:bg-success/90"><ShieldCheck className="mr-1 h-4 w-4" />通过</Button>
          </div>
        </CardContent>
      </Card>

      {/* 顶部只读信息条 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="panel lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">基础信息（只读）</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Field label="企业名称" value={detail.enterpriseName} />
            <Field label="统一社会信用代码" value={detail.creditCode} mono />
            <Field label="所属行业" value={detail.industry} />
            <Field label="限额周期" value={detail.cyclePeriod} mono />
            <Field label="标准号" value={detail.standardCode} mono highlight />
            <Field label="标准名称" value={detail.standardName} highlight />
          </CardContent>
        </Card>

        {/* 审批记录轴 */}
        <Card className="panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground"><Clock className="mr-1 inline h-3.5 w-3.5" />审批记录轴</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative space-y-3 border-l border-border/60 pl-4">
              {detail.records.map((r, i) => (
                <li key={i} className="relative">
                  <span className={cn("absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background",
                    r.action === "驳回" ? "bg-destructive" : r.action === "通过" ? "bg-success" : r.action === "提交" ? "bg-warning" : "bg-secondary")} />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{r.operator} <span className="text-muted-foreground">@{r.account}</span></span>
                    <Badge variant="outline" className={cn("h-5 text-[10px]",
                      r.action === "驳回" ? "border-destructive/40 bg-destructive/10 text-destructive" :
                      r.action === "通过" ? "border-success/40 bg-success/10 text-success" :
                      "border-secondary/40 bg-secondary/10 text-secondary")}>{r.action}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{r.time}</p>
                  {r.comment && <p className="mt-1 rounded bg-muted/40 p-2 text-xs text-foreground/80">{r.comment}</p>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* 能耗数据表格 */}
      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">能耗数据（只读）</CardTitle>
            {exceedRows > 0 && (
              <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
                <XCircle className="mr-1 h-3 w-3" />{exceedRows} 项产品超限
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>产品</TableHead>
                <TableHead className="text-right">产量</TableHead>
                <TableHead className="text-right">综合能耗（吨标煤）</TableHead>
                <TableHead className="text-right">单位产品能耗</TableHead>
                <TableHead className="text-right">限额值</TableHead>
                <TableHead className="text-center w-20">合规</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.energyData.map((r, i) => (
                <TableRow key={i} className="h-12 border-border/40">
                  <TableCell className="text-sm">{r.product}<span className="ml-1 text-xs text-muted-foreground">/ {r.unit}</span></TableCell>
                  <TableCell className="text-right font-mono text-xs">{fmt(r.output)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{fmt(r.energy)}</TableCell>
                  <TableCell className={cn("text-right font-mono text-xs", r.exceed && "text-destructive font-semibold")}>{r.unitEnergy.toFixed(3)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">{r.limit.toFixed(3)}</TableCell>
                  <TableCell className="text-center">
                    {r.exceed
                      ? <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive"><XCircle className="mr-1 h-3 w-3" />超限</Badge>
                      : <Badge variant="outline" className="border-success/40 bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" />达标</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 证明材料 */}
      <Card className="panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base"><Upload className="mr-1 inline h-4 w-4" />证明材料（{detail.materials.length}）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {detail.materials.map((m) => {
              const Icon = materialIcon(m.type);
              return (
                <button key={m.name} onClick={() => toast.info(`预览 ${m.name}`)} className="group flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 p-3 text-left transition hover:border-primary/40 hover:bg-primary/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-secondary/10 text-secondary group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{m.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{m.size}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 驳回弹窗 */}
      <Dialog open={rejectOpen} onOpenChange={(o) => { setRejectOpen(o); if (!o) setRejectErr(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive"><ShieldX className="mr-2 inline h-5 w-5" />驳回审批</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">驳回意见将发送至企业填报人。<span className="text-destructive">必填</span>。</p>
            <Textarea
              value={rejectComment}
              onChange={(e) => { setRejectComment(e.target.value); if (e.target.value.trim()) setRejectErr(false); }}
              placeholder="请详细说明驳回原因（如：单位产品能耗高于限额，需补充能源审计报告等）"
              rows={5}
              className={cn(rejectErr && "border-destructive ring-2 ring-destructive/30")}
            />
            {rejectErr && <p className="text-xs text-destructive"><MessageSquare className="mr-1 inline h-3 w-3" />驳回时必须填写审批意见</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={submitReject}>确认驳回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 通过弹窗 */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-success"><ShieldCheck className="mr-2 inline h-5 w-5" />审批通过</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">确认通过后，企业状态将变更为「已完成」并锁定数据。审批意见可选。</p>
            <Textarea value={approveComment} onChange={(e) => setApproveComment(e.target.value)} placeholder="审批意见（选填）" rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>取消</Button>
            <Button onClick={submitApprove} className="bg-success text-success-foreground hover:bg-success/90">确认通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm", mono && "font-mono text-xs", highlight && "font-semibold text-primary")}>{value}</p>
    </div>
  );
}
