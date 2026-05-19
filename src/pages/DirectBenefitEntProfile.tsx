import { useMemo, useState } from "react";
import { Search, FileSearch, Building2, Sparkles, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { enterprises, matches, findEnterprise } from "@/components/direct-benefit/directBenefitData";

export default function DirectBenefitEntProfile() {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(
    () => enterprises.filter((e) => !q || (e.name + e.creditCode + e.district).toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const profileCount = enterprises.length;
  const current = openId ? findEnterprise(openId) : null;
  const currentMatches = current ? matches.filter((m) => m.enterpriseId === current.id) : [];

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">企业画像</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              智能体综合节能月报、能源利用报告、温室气体、能耗限额、绿色工厂自评、节能技改等 7 类填报数据生成。每个画像维度均可溯源至原始报表。
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-[10px]">
            <Sparkles className="mr-1 h-2.5 w-2.5" />已生成 {profileCount} 家
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="按企业名 / 信用代码 / 行政区搜索" className="h-9 pl-8 text-xs" />
          </div>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>企业</TableHead>
                  <TableHead className="w-24">行政区</TableHead>
                  <TableHead className="w-32">行业</TableHead>
                  <TableHead className="w-24">单位属性</TableHead>
                  <TableHead className="w-24">画像维度</TableHead>
                  <TableHead className="w-24">已匹配政策</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((e) => {
                  const mc = matches.filter((m) => m.enterpriseId === e.id).length;
                  return (
                    <TableRow key={e.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setOpenId(e.id)}>
                      <TableCell>
                        <div className="font-medium text-foreground">{e.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{e.creditCode}</div>
                      </TableCell>
                      <TableCell className="text-xs">{e.district}</TableCell>
                      <TableCell className="text-xs">{e.industry}</TableCell>
                      <TableCell>
                        {e.isKeyUnit ? (
                          <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">重点用能</Badge>
                        ) : (
                          <Badge variant="outline" className="border-border/60 text-[10px] text-muted-foreground">一般用能</Badge>
                        )}
                      </TableCell>
                      <TableCell><span className="font-mono text-xs text-foreground">{e.profile.length}</span></TableCell>
                      <TableCell><span className="font-mono text-xs font-semibold text-primary">{mc}</span></TableCell>
                      <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 详情抽屉 */}
      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />企业画像
            </SheetTitle>
            <SheetDescription className="text-xs">智能体生成的画像维度及数据来源</SheetDescription>
          </SheetHeader>

          {current && (
            <div className="mt-4 space-y-4">
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="text-sm font-semibold text-foreground">{current.name}</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{current.creditCode}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="border-border/60 text-[10px]">{current.district}</Badge>
                  <Badge variant="outline" className="border-border/60 text-[10px]">{current.industry}</Badge>
                  {current.isKeyUnit && <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">重点用能单位</Badge>}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold text-foreground">画像维度（{current.profile.length}）</h4>
                <div className="space-y-2">
                  {current.profile.map((f) => (
                    <div key={f.label} className="rounded-md border border-border bg-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[11px] text-muted-foreground">{f.label}</div>
                          <div className="mt-0.5 text-sm font-medium text-foreground">{f.value}</div>
                        </div>
                        <Badge variant="outline" className="shrink-0 border-primary/30 bg-primary/5 text-[10px] text-primary">
                          <FileSearch className="mr-1 h-2.5 w-2.5" />{f.source}
                        </Badge>
                      </div>
                      <div className="mt-1.5 text-[10px] text-muted-foreground">更新于 <span className="font-mono">{f.updatedAt}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {currentMatches.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-foreground">已匹配政策（{currentMatches.length}）</h4>
                  <div className="space-y-1.5">
                    {currentMatches.map((m) => {
                      const p = m.policyId;
                      return (
                        <div key={m.id} className="flex items-center justify-between rounded-md border border-border bg-muted/10 px-3 py-2 text-xs">
                          <span className="text-foreground">{p}</span>
                          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-[10px] text-primary">
                            置信度 {(m.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
