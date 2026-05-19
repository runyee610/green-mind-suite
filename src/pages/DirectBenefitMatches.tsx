import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const navigate = useNavigate();

  const list = useMemo(() => {
    return matches.filter((m) => {
      if (status !== "全部" && m.status !== status) return false;
      const ent = findEnterprise(m.enterpriseId);
      const pol = findPolicy(m.policyId);
      if (q && !(ent?.name + " " + pol?.name).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [status, q]);

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">撮合名单</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            智能体根据企业画像与政策条件生成的匹配清单。点击行进入撮合详情，查看智能体匹配理由、条件命中证据与数据确权证书。
          </p>
        </div>

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
                    <TableRow key={m.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/direct-benefit/gov/matches/${m.id}`)}>
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
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/direct-benefit/gov/matches/${m.id}`); }}>
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
    </AppLayout>
  );
}
