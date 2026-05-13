import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DYNAMIC_FIELD_DEFS,
  MOCK_DYNAMIC,
  dynamicStatusClass,
} from "@/components/green-mfg/data";
import { cn } from "@/lib/utils";

export default function GreenMfgGovDynamicEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const row = useMemo(() => MOCK_DYNAMIC.find((r) => r.id === id) ?? MOCK_DYNAMIC[0], [id]);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState("");

  const handleApprove = () => { toast.success("已审核通过，本年度动态管理表入档"); setApproveOpen(false); setComment(""); };
  const handleReject = () => {
    if (!comment.trim()) { toast.error("驳回必须填写意见"); return; }
    toast.success("已驳回，意见已发送至企业"); setRejectOpen(false); setComment("");
  };

  return (
    <AppLayout title="动态管理表 · 政府侧审核" subtitle={`${row.id} · ${row.enterpriseName} · ${row.year} 年度`}>
      <div className="mb-4 flex items-center justify-end gap-3">
        <Badge variant="outline" className={dynamicStatusClass(row.status)}>{row.status}</Badge>
        <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/gov/dynamic")}>
          <ArrowLeft className="mr-1 h-4 w-4" />返回列表
        </Button>
        {row.status === "已填报" && (
          <>
            <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)}><ShieldX className="mr-1 h-4 w-4" />驳回</Button>
            <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setApproveOpen(true)}><ShieldCheck className="mr-1 h-4 w-4" />通过</Button>
          </>
        )}
      </div>

      <Card className="panel">
        <CardHeader className="pb-3"><CardTitle className="text-base">指标填报情况（只读）</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>指标</TableHead>
                <TableHead className="text-right">填报值</TableHead>
                <TableHead className="text-right">基准值</TableHead>
                <TableHead className="text-center">达标</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DYNAMIC_FIELD_DEFS.map((d) => {
                const v = row[d.key] as number | undefined;
                const meet =
                  v == null || d.baseline == null ? null :
                  d.key === "wasteRecycleRate" || d.key === "greenProductRatio" || d.key === "rdInvestRatio" ? v >= d.baseline :
                  v <= d.baseline;
                return (
                  <TableRow key={d.key} className="h-12 border-border/40">
                    <TableCell className="text-sm">{d.label} <span className="text-xs text-muted-foreground">/ {d.unit}</span></TableCell>
                    <TableCell className={cn("text-right font-mono text-xs", meet === false && "text-destructive font-semibold")}>{v ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">{d.baseline ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      {meet == null ? <span className="text-xs text-muted-foreground">—</span> :
                        meet ? <Badge variant="outline" className="border-success/40 bg-success/10 text-success">达标</Badge> :
                        <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">未达标</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.hint ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-success"><ShieldCheck className="mr-2 inline h-5 w-5" />审核通过</DialogTitle></DialogHeader>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="审核意见（选填）" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>取消</Button>
            <Button onClick={handleApprove} className="bg-success text-success-foreground hover:bg-success/90">确认通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive"><ShieldX className="mr-2 inline h-5 w-5" />驳回</DialogTitle></DialogHeader>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="请说明驳回原因..." rows={5} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleReject}>确认驳回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
