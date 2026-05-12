import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronRight, ClipboardList, Eye, FileEdit, Plus, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MOCK_AUDIT_FLOW,
  MOCK_DECLARATIONS,
  MOCK_DYNAMIC,
  dynamicStatusClass,
  stageBadgeClass,
} from "@/components/green-mfg/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function GreenMfgEnt() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("declaration");

  // 假设当前企业 = MOCK_DECLARATIONS[0]
  const myDeclaration = MOCK_DECLARATIONS[0];
  const myDynamics = MOCK_DYNAMIC.filter((_, i) => i < 2);

  return (
    <AppLayout title="绿色工厂（梯度培育）· 企业侧" subtitle="申报、动态管理表填报、审核进度查看">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="declaration">绿色工厂申报</TabsTrigger>
          <TabsTrigger value="dynamic">动态管理表（年度）</TabsTrigger>
        </TabsList>

        <TabsContent value="declaration" className="mt-4 space-y-4">
          {/* 申报状态卡 */}
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">本年度申报</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">{myDeclaration.id} · 提交于 {myDeclaration.submitDate}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={stageBadgeClass(myDeclaration.stage)}>{myDeclaration.stage}</Badge>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => navigate(`/green-mfg/ent/declaration/${myDeclaration.id}`)}>
                    <Eye className="mr-1 h-4 w-4" />查看详情
                  </Button>
                  <Button size="sm" className="h-8 bg-gradient-primary text-primary-foreground" onClick={() => navigate("/green-mfg/ent/declaration/new")}>
                    <Plus className="mr-1 h-4 w-4" />新增申报
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <Field label="智能预审得分" value={`${myDeclaration.score}`} accent="primary" />
              <Field label="专家打分" value={myDeclaration.manualScore != null ? `${myDeclaration.manualScore}` : "—"} accent="success" />
              <Field label="所属区" value={myDeclaration.district} />
              <Field label="当前等级" value={myDeclaration.level} />
            </CardContent>
          </Card>

          {/* 流转节点 */}
          <Card className="panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><ChevronRight className="mr-1 inline h-4 w-4" />审核流转状态</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-2 md:grid-cols-4">
                {MOCK_AUDIT_FLOW.map((n, i) => (
                  <li key={i} className={cn("rounded-md border p-3",
                    n.result === "通过" ? "border-success/40 bg-success/5" :
                    n.result === "驳回" ? "border-destructive/40 bg-destructive/5" :
                    n.result === "提交" ? "border-primary/40 bg-primary/5" :
                    n.result === "进入培育" ? "border-warning/40 bg-warning/5" :
                    "border-border bg-muted/30")}>
                    <p className="text-xs font-medium">{n.stage}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{n.time}</p>
                    <p className="mt-1 text-[11px]">{n.operator}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* 历年申报记录 */}
          <Card className="panel">
            <CardHeader className="pb-3"><CardTitle className="text-base"><ClipboardList className="mr-1 inline h-4 w-4" />历史申报记录</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>申报编号</TableHead>
                    <TableHead className="text-right">智能打分</TableHead>
                    <TableHead className="text-right">专家打分</TableHead>
                    <TableHead className="text-center">状态</TableHead>
                    <TableHead className="text-center">结果</TableHead>
                    <TableHead>提交日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DECLARATIONS.slice(0, 3).map((r) => (
                    <TableRow key={r.id} className="h-12 border-border/40">
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="text-right font-mono text-xs"><Sparkles className="mr-1 inline h-3 w-3 text-secondary" />{r.score}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.manualScore ?? "—"}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className={stageBadgeClass(r.stage)}>{r.stage}</Badge></TableCell>
                      <TableCell className="text-center text-xs">{r.level}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.submitDate}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => navigate(`/green-mfg/ent/declaration/${r.id}`)}>
                          <Eye className="mr-1 h-3 w-3" />查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dynamic" className="mt-4">
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">动态管理表填报</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">市级绿色工厂年度复核：每年填报一次，由市级生态主管部门审核。</p>
                </div>
                <Button size="sm" className="h-8 bg-gradient-primary text-primary-foreground" onClick={() => navigate("/green-mfg/ent/dynamic/new")}>
                  <FileEdit className="mr-1 h-4 w-4" />填报本年度
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>编号</TableHead>
                    <TableHead className="text-center">年度</TableHead>
                    <TableHead className="text-right">综合能耗</TableHead>
                    <TableHead className="text-right">碳排放</TableHead>
                    <TableHead className="text-right">固废利用率</TableHead>
                    <TableHead className="text-center">状态</TableHead>
                    <TableHead>提交日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myDynamics.map((r) => (
                    <TableRow key={r.id} className="h-12 border-border/40">
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="text-center font-mono text-xs">{r.year}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.energyConsumption?.toLocaleString() ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.carbonEmission?.toLocaleString() ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.wasteRecycleRate != null ? `${r.wasteRecycleRate}%` : "—"}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className={dynamicStatusClass(r.status)}>{r.status}</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.submitDate ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => navigate(`/green-mfg/ent/dynamic/${r.id}`)}>
                          {r.status === "待填报" || r.status === "已驳回" ? <><FileEdit className="mr-1 h-3 w-3" />填报</> : <><Eye className="mr-1 h-3 w-3" />查看</>}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: "primary" | "success" }) {
  const cls = accent === "primary" ? "text-primary" : accent === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-base font-semibold", cls)}>
        {value === "—" ? <CheckCircle2 className="inline h-4 w-4 text-muted-foreground" /> : value}
      </p>
    </div>
  );
}
