import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileSearch, Workflow, CircleDollarSign } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataCertificate } from "@/components/direct-benefit/DataCertificate";
import {
  findEnterprise, getEntCertificate, matches, disbursements, findPolicy,
} from "@/components/direct-benefit/directBenefitData";

export default function DirectBenefitEntProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const e = id ? findEnterprise(id) : null;
  const cert = id ? getEntCertificate(id) : null;
  const ms = id ? matches.filter((m) => m.enterpriseId === id) : [];
  const ds = id ? disbursements.filter((d) => d.enterpriseId === id) : [];

  if (!e) {
    return (
      <AppLayout hideHeader>
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">未找到该企业</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" />返回
        </Button>

        {/* 企业信息条 */}
        <Card className="border-border/60">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="text-base font-semibold text-foreground">{e.name}</div>
              <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{e.creditCode}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{e.district}</Badge>
                <Badge variant="outline" className="text-[10px]">{e.industry}</Badge>
                {e.isKeyUnit && <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">重点用能</Badge>}
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>已匹配政策 <span className="font-mono font-semibold text-primary">{ms.length}</span> 项</div>
              <div className="mt-0.5">已拨付/在途 <span className="font-mono font-semibold text-warning">{ds.length}</span> 笔</div>
            </div>
          </CardContent>
        </Card>

        {/* 数据确权证书 */}
        {cert && (
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">数据确权证书（企业画像）</h3>
                <Badge variant="outline" className="text-[10px]">A4 公文展示</Badge>
              </div>
              <DataCertificate certificate={cert} />
            </CardContent>
          </Card>
        )}

        {/* 已匹配政策 */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold text-foreground text-lg">
              <Workflow className="mr-1 inline h-3.5 w-3.5" />已匹配政策（{ms.length}）
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>政策</TableHead>
                  <TableHead className="w-24">命中</TableHead>
                  <TableHead className="w-24">置信度</TableHead>
                  <TableHead className="w-24">金额</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ms.map((m) => {
                  const p = findPolicy(m.policyId);
                  const hit = m.hits.filter((h) => h.hit).length;
                  return (
                    <TableRow key={m.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/direct-benefit/gov/matches/${m.id}`)}>
                      <TableCell className="text-xs">{p?.name}</TableCell>
                      <TableCell className="font-mono text-xs">{hit}/{m.hits.length}</TableCell>
                      <TableCell className="font-mono text-xs">{(m.confidence * 100).toFixed(0)}%</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-warning">{m.estimatedFunding} 万</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{m.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 证书使用记录 */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold text-foreground text-lg">
              <CircleDollarSign className="mr-1 inline h-3.5 w-3.5" />证书引用记录（{ds.length}）
            </h3>
            <ul className="space-y-1.5">
              {ds.map((d) => {
                const p = findPolicy(d.policyId);
                return (
                  <li key={d.id} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <div className="text-foreground">{p?.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        证书 {d.certificateId} · 引用项 {d.usedCertItemKeys?.length ?? 0}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-warning">{d.amount} 万</span>
                      <Badge variant="outline" className="text-[10px]">{d.stage}</Badge>
                    </div>
                  </li>
                );
              })}
              {ds.length === 0 && <div className="py-4 text-center text-[11px] text-muted-foreground">尚无引用记录</div>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
