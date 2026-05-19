import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Send, Sparkles, ExternalLink, FileSearch } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  matches, findPolicy, findEnterprise, matchStatusStyle,
  type MatchStatus,
} from "@/components/direct-benefit/directBenefitData";
import { cn } from "@/lib/utils";

const STATUS_TABS: Array<"全部" | MatchStatus> = [
  "全部", "待公示", "已公示", "已推送", "企业已确认", "已拨付", "已驳回",
];

export default function DirectBenefitMatches() {
  const [status, setStatus] = useState<"全部" | MatchStatus>("全部");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const list = useMemo(() => {
    return matches.filter((m) => {
      if (status !== "全部" && m.status !== status) return false;
      const ent = findEnterprise(m.enterpriseId);
      const pol = findPolicy(m.policyId);
      if (q && !(ent?.name + " " + pol?.name).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [status, q]);

  const current = openId ? matches.find((m) => m.id === openId) : null;
  const ent = current ? findEnterprise(current.enterpriseId) : null;
  const pol = current ? findPolicy(current.policyId) : null;

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">撮合名单</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            智能体根据企业画像与政策条件生成的匹配清单。点击行可查看匹配解释与企业画像证据。
          </p>
        </div>

        {/* 筛选 */}
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <TabsList className="flex-wrap">
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs">{t}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="按企业名 / 政策搜索"
            className="ml-auto h-9 w-64 text-xs"
          />
        </div>

        {/* 表格 */}
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>企业</TableHead>
                  <TableHead>匹配政策</TableHead>
                  <TableHead className="w-28">命中条件</TableHead>
                  <TableHead className="w-32">智能体置信度</TableHead>
                  <TableHead className="w-24">估算金额</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                  <TableHead className="w-28 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((m) => {
                  const e = findEnterprise(m.enterpriseId);
                  const p = findPolicy(m.policyId);
                  const hit = m.hits.filter((h) => h.hit).length;
                  const total = m.hits.length;
                  const style = matchStatusStyle[m.status];
                  return (
                    <TableRow key={m.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setOpenId(m.id)}>
                      <TableCell>
                        <div className="font-medium text-foreground">{e?.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{e?.creditCode}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-foreground line-clamp-1">{p?.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p?.docNo}</div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("font-mono text-xs font-semibold", hit === total ? "text-success" : "text-warning")}>
                          {hit}/{total}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={m.confidence * 100} className="h-1.5 w-16" />
                          <span className="font-mono text-[11px] text-foreground">{(m.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-foreground">{m.estimatedFunding} 万</span>
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", style.badge)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                          {m.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => setOpenId(m.id)}>
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      暂无撮合记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 详情抽屉 */}
      <Sheet open={!!openId} onOpenChange={(o) => !o && (setOpenId(null), setRejecting(false))}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />匹配详情
            </SheetTitle>
            <SheetDescription className="text-xs">智能体匹配理由、条件命中证据与企业画像</SheetDescription>
          </SheetHeader>

          {current && ent && pol && (
            <div className="mt-4 space-y-4">
              {/* 企业 + 政策摘要 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">企业</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{ent.name}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{ent.creditCode}</div>
                  <div className="mt-1 flex gap-1.5">
                    <Badge variant="outline" className="border-border/60 text-[10px]">{ent.district}</Badge>
                    {ent.isKeyUnit && <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">重点用能</Badge>}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">政策</div>
                  <div className="mt-1 text-sm font-semibold text-foreground line-clamp-2">{pol.name}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{pol.docNo} · {pol.issuer}</div>
                  <div className="mt-1 font-mono text-[11px] text-foreground">估算金额：{current.estimatedFunding} 万</div>
                </div>
              </div>

              {/* 智能体匹配理由 */}
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />智能体匹配理由
                  </div>
                  <Badge variant="outline" className="border-primary/40 bg-background text-[10px] text-primary">
                    置信度 {(current.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-foreground">{current.rationale}</p>
                <div className="mt-1.5 font-mono text-[10px] text-muted-foreground">生成时间：{current.generatedAt}</div>
              </div>

              {/* 条件 ↔ 数据 对照 */}
              <div>
                <h4 className="mb-2 text-xs font-semibold text-foreground">条件命中证据（条件 ↔ 数据）</h4>
                <div className="overflow-hidden rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center">命中</TableHead>
                        <TableHead>申报条件</TableHead>
                        <TableHead>来自企业的数据证据</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {current.hits.map((h) => {
                        const cond = pol.conditions.find((c) => c.key === h.conditionKey);
                        return (
                          <TableRow key={h.conditionKey}>
                            <TableCell className="text-center">
                              {h.hit ? (
                                <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="mx-auto h-4 w-4 text-destructive" />
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-foreground">{cond?.text}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{h.evidence}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* 企业画像 */}
              <div>
                <h4 className="mb-2 text-xs font-semibold text-foreground">企业画像（智能体综合本平台数据生成）</h4>
                <div className="grid grid-cols-2 gap-2">
                  {ent.profile.map((f) => (
                    <div key={f.label} className="rounded-md border border-border bg-card p-2.5">
                      <div className="text-[10px] text-muted-foreground">{f.label}</div>
                      <div className="mt-0.5 text-xs font-medium text-foreground">{f.value}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5">
                          <FileSearch className="h-2.5 w-2.5" />{f.source}
                        </span>
                        <span className="font-mono">{f.updatedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作 */}
              {rejecting ? (
                <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <div className="text-xs font-medium text-destructive">驳回理由（将记录到智能体反馈库以优化未来匹配）</div>
                  <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="text-xs" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRejecting(false)}>取消</Button>
                    <Button variant="destructive" size="sm" onClick={() => {
                      if (!rejectReason.trim()) return toast.error("请填写驳回理由");
                      toast.success("已驳回，理由已反馈给智能体");
                      setOpenId(null); setRejecting(false); setRejectReason("");
                    }}>确认驳回</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                  <Button variant="outline" size="sm" onClick={() => setRejecting(true)}>
                    <XCircle className="mr-1 h-3.5 w-3.5" />驳回
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { toast.success("已批准公示"); setOpenId(null); }}>
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />批准公示
                  </Button>
                  <Button size="sm" onClick={() => { toast.success("已点对点推送至企业"); setOpenId(null); }}>
                    <Send className="mr-1 h-3.5 w-3.5" />点对点推送
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
