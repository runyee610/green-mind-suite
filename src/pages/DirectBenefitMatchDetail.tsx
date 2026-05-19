import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, FileSearch, Send } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataCertificate } from "@/components/direct-benefit/DataCertificate";
import { findMatch, findPolicy, findEnterprise, getMatchCertificate } from "@/components/direct-benefit/directBenefitData";

export default function DirectBenefitMatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const m = id ? findMatch(id) : null;
  const p = m ? findPolicy(m.policyId) : null;
  const e = m ? findEnterprise(m.enterpriseId) : null;
  const cert = id ? getMatchCertificate(id) : null;
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (!m || !p || !e) {
    return (
      <AppLayout hideHeader>
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">未找到该匹配记录</div>
      </AppLayout>
    );
  }

  const usedKeys = m.hits.filter((h) => h.hit).map((h) => h.conditionKey);

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" />返回
        </Button>

        {/* 顶部摘要 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">企业</div>
              <div className="mt-1 font-semibold text-foreground text-lg">{e.name}</div>
              <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{e.creditCode}</div>
              <div className="mt-2 flex gap-1.5">
                <Badge variant="outline" className="text-[10px]">{e.district}</Badge>
                <Badge variant="outline" className="text-[10px]">{e.industry}</Badge>
                {e.isKeyUnit && <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">重点用能</Badge>}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">政策</div>
              <div className="mt-1 font-semibold text-foreground text-lg line-clamp-2">{p.name}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">{p.docNo} · {p.issuer}</div>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-mono text-base font-semibold text-warning">{m.estimatedFunding} 万</span>
                <Badge variant="outline" className="text-[10px]">{m.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI 匹配理由 */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />智能体匹配理由
              </div>
              <div className="flex items-center gap-2">
                <Progress value={m.confidence * 100} className="h-1 w-32" />
                <Badge variant="outline" className="border-primary/40 bg-background text-[10px] text-primary">
                  置信度 {(m.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-foreground">{m.rationale}</p>
            <div className="mt-2 font-mono text-[10px] text-muted-foreground">生成时间：{m.generatedAt}</div>
          </CardContent>
        </Card>

        {/* 条件命中 */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold text-foreground text-lg">条件命中证据（条件 ↔ 数据）</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">命中</TableHead>
                  <TableHead>申报条件</TableHead>
                  <TableHead>来自企业的数据证据</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {m.hits.map((h) => {
                  const c = p.conditions.find((x) => x.key === h.conditionKey);
                  return (
                    <TableRow key={h.conditionKey}>
                      <TableCell className="text-center">
                        {h.hit ? <CheckCircle2 className="mx-auto h-4 w-4 text-success" /> : <XCircle className="mx-auto h-4 w-4 text-destructive" />}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">{c?.text}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <FileSearch className="mr-1 inline h-3 w-3" />{h.evidence}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 数据确权证书 */}
        {cert && (
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold text-foreground text-lg">本次撮合所引用的数据确权证书</h3>
              <DataCertificate certificate={cert} highlightItemKeys={usedKeys} />
            </CardContent>
          </Card>
        )}

        {/* 操作 */}
        {rejecting ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="space-y-2 p-4">
              <div className="text-xs font-medium text-destructive">驳回理由（将反馈给智能体优化未来匹配）</div>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="text-xs" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setRejecting(false)}>取消</Button>
                <Button variant="destructive" size="sm" onClick={() => {
                  if (!reason.trim()) return toast.error("请填写驳回理由");
                  toast.success("已驳回");
                  navigate(-1);
                }}>确认驳回</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-2 rounded-lg border border-border bg-card p-3">
            <Button variant="outline" size="sm" onClick={() => setRejecting(true)}>
              <XCircle className="mr-1 h-3.5 w-3.5" />驳回
            </Button>
            <Button variant="outline" size="sm" onClick={() => { toast.success("已批准公示"); navigate(-1); }}>
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />批准公示
            </Button>
            <Button size="sm" onClick={() => { toast.success("已点对点推送至企业"); navigate(-1); }}>
              <Send className="mr-1 h-3.5 w-3.5" />点对点推送
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
