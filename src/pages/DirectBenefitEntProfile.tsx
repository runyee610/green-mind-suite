import { useMemo, useState } from "react";
import { Search, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { enterprises, matches, getEntCertificate } from "@/components/direct-benefit/directBenefitData";

export default function DirectBenefitEntProfile() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const list = useMemo(
    () => enterprises.filter((e) => !q || (e.name + e.creditCode + e.district).toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">企业画像 · 数据确权证书</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              智能体综合节能月报、能源利用、温室气体、能耗限额、绿色工厂、节能技改等 7 类数据生成企业画像，并由市数据要素登记中心签发数据确权证书。
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-[10px]">
            <Sparkles className="mr-1 h-2.5 w-2.5" />已生成 {enterprises.length} 家
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
                  <TableHead className="w-44">数据确权证书</TableHead>
                  <TableHead className="w-20">确权项</TableHead>
                  <TableHead className="w-24">已匹配政策</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((e) => {
                  const mc = matches.filter((m) => m.enterpriseId === e.id).length;
                  const cert = getEntCertificate(e.id);
                  return (
                    <TableRow key={e.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/direct-benefit/gov/entprofile/${e.id}`)}>
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
                      <TableCell>
                        {cert ? (
                          <span className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(0_65%_35%/0.5)] bg-[hsl(45_60%_92%)] px-2 py-0.5 font-mono text-[10px] text-[hsl(0_70%_25%)]">
                            <ShieldCheck className="h-3 w-3" />{cert.id}
                          </span>
                        ) : <span className="text-[10px] text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell><span className="font-mono text-xs text-foreground">{cert?.items.length ?? 0}</span></TableCell>
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
    </AppLayout>
  );
}
