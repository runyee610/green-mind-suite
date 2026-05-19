import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Sparkles, Coins, CalendarClock, ShieldCheck, Send, Users, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { findPolicy, matches, findEnterprise, domainStyle } from "@/components/direct-benefit/directBenefitData";
import { cn } from "@/lib/utils";

export default function DirectBenefitPolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const p = id ? findPolicy(id) : null;
  const [pushNote, setPushNote] = useState("");

  if (!p) {
    return (
      <AppLayout hideHeader>
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">未找到该政策</div>
      </AppLayout>
    );
  }

  const ds = domainStyle[p.domain];
  const hits = matches.filter((m) => m.policyId === p.id);

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" />返回
        </Button>

        {/* 顶部摘要 */}
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5">
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", ds.badge)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", ds.dot)} />{p.domain}
            </span>
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">
              <Coins className="mr-1 h-2.5 w-2.5" />{p.fundingMin}–{p.fundingMax} 万
            </Badge>
            <Badge variant="outline" className="border-border/60 text-[10px]">{p.status}</Badge>
          </div>
          <h1 className="mt-2 text-lg font-semibold text-foreground">{p.name}</h1>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{p.docNo}</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{p.issuer}</span>
            <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" />截止 {p.deadline}</span>
            <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline">
              原文 <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-foreground">{p.summary}</p>

          <div className="mt-3 flex items-center gap-3 rounded-md border border-primary/20 bg-background/60 px-3 py-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] text-muted-foreground">智能体解析置信度</span>
            <Progress value={p.parseConfidence * 100} className="h-1 w-40" />
            <span className="font-mono text-[11px] text-foreground">{(p.parseConfidence * 100).toFixed(0)}%</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">抓取于 {p.fetchedAt}</span>
          </div>
        </div>

        {/* 申报条件 + 额度 + 指引 */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">申报条件</h3>
              <ul className="space-y-2">
                {p.conditions.map((c) => (
                  <li key={c.key} className="rounded-md border border-border bg-muted/20 p-2">
                    <div className="text-xs text-foreground">{c.text}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">取数：{c.dataField}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">资助额度</h3>
              <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-xs leading-relaxed text-foreground">
                {p.fundingFormula}
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground">
                额度范围 <span className="font-mono text-foreground">{p.fundingMin}-{p.fundingMax} 万元</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">申报指引</h3>
              <ol className="space-y-1.5">
                {p.guideSteps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{i + 1}</span>
                    <span className="text-foreground">{s}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* 匹配企业 */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                <Users className="mr-1 inline h-3.5 w-3.5" />智能体匹配的企业（{hits.length}）
              </h3>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">点击行进入撮合详情</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>企业</TableHead>
                  <TableHead className="w-24">命中</TableHead>
                  <TableHead className="w-32">置信度</TableHead>
                  <TableHead className="w-24">估算金额</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hits.map((m) => {
                  const e = findEnterprise(m.enterpriseId);
                  const hit = m.hits.filter((h) => h.hit).length;
                  return (
                    <TableRow key={m.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/direct-benefit/gov/matches/${m.id}`)}>
                      <TableCell>
                        <div className="text-xs font-medium text-foreground">{e?.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{e?.creditCode}</div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("font-mono text-xs font-semibold", hit === m.hits.length ? "text-success" : "text-warning")}>
                          {hit}/{m.hits.length}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={m.confidence * 100} className="h-1.5 w-16" />
                          <span className="font-mono text-[11px] text-foreground">{(m.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="font-mono text-xs font-semibold text-warning">{m.estimatedFunding} 万</span></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{m.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 推送操作 */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              <Send className="mr-1 inline h-3.5 w-3.5 text-primary" />点对点推送
            </h3>
            <p className="text-[11px] text-muted-foreground">
              智能体将通过站内信 + 短信向以上 <span className="font-semibold text-primary">{hits.length}</span> 家匹配企业推送本政策。
            </p>
            <Textarea
              value={pushNote}
              onChange={(e) => setPushNote(e.target.value)}
              rows={2}
              placeholder="可附加自定义说明（可选）"
              className="mt-2 text-xs"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success("已批准公示")}>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />批准公示
              </Button>
              <Button size="sm" onClick={() => toast.success("已发起定向推送")}>
                <Send className="mr-1 h-3.5 w-3.5" />确认推送
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
