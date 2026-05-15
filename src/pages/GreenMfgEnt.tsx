import { useEffect, useState } from "react";
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
import { AuditFlowTimeline } from "@/components/green-mfg/AuditFlowTimeline";
import { GreenArchivePanel } from "@/components/green-mfg/GreenArchivePanel";
import { RiskWarningPanel } from "@/components/green-mfg/RiskWarningPanel";
import { MOCK_RISKS } from "@/components/green-mfg/dynamicExtData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function GreenMfgEnt({ section }: { section?: "declaration" | "dynamic" } = {}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>(section ?? "declaration");
  // Sync internal tab state when route-driven section prop changes
  // (component instance is reused across /green-mfg/ent and /green-mfg/ent/dynamic)
  useEffect(() => {
    if (section) setTab(section);
  }, [section]);

  // 假设当前企业 = MOCK_DECLARATIONS[0]
  const myDeclaration = MOCK_DECLARATIONS[0];
  const myDynamics = MOCK_DYNAMIC.filter((_, i) => i < 2);
  // 动态管理页演示企业 = 申能电力设备股份有限公司
  const entCreditCode = section === "dynamic" ? "913100007896543210" : myDeclaration.creditCode;
  const entRiskOpen = MOCK_RISKS.filter((r) => r.creditCode === entCreditCode && r.status !== "已关闭").length;

  return (
    <AppLayout
      title={
        section === "dynamic"
          ? "绿色工厂动态管理 · 申能电力设备股份有限公司"
          : "绿色工厂自我评价（模拟）-上海宝武特种合金有限公司"
      }
      subtitle={
        section === "dynamic"
          ? "市级绿色工厂年度动态管理表填报"
          : "自我评价（模拟）、AI 智能打分"
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        {!section && (
          <TabsList>
            <TabsTrigger value="declaration">绿色工厂自评价</TabsTrigger>
            <TabsTrigger value="dynamic">动态管理表（年度）</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="declaration" className="mt-4 space-y-4">
          {/* 自评价状态卡 */}
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">本年度自我评价</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">2025第二批 · 提交于 {myDeclaration.submitDate}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={stageBadgeClass(myDeclaration.stage)}>{myDeclaration.stage}</Badge>
                  <Button size="sm" className="h-8 bg-gradient-primary text-primary-foreground" onClick={() => navigate("/green-mfg/ent/declaration/new")}>
                    <Plus className="mr-1 h-4 w-4" />新增自我评价
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <Field label="AI 智能预审得分" value={`${myDeclaration.score}`} accent="primary" />
              <Field label="专家打分" value={myDeclaration.manualScore != null ? `${myDeclaration.manualScore}` : "—"} accent="success" />
              <Field label="所属区" value={myDeclaration.district} />
              <Field label="当前等级" value={myDeclaration.level} />
            </CardContent>
          </Card>

          {/* 历年自评价记录 */}
          <Card className="panel">
            <CardHeader className="pb-3"><CardTitle className="text-base"><ClipboardList className="mr-1 inline h-4 w-4" />历史自我评价记录</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>自我评价批次</TableHead>
                    <TableHead className="text-center px-[3px]">AI 智能打分</TableHead>
                    <TableHead className="text-center">专家打分</TableHead>
                    <TableHead className="text-center">状态</TableHead>
                    <TableHead className="text-center">结果</TableHead>
                    <TableHead>提交日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DECLARATIONS.slice(0, 3).map((r) => (
                    <TableRow key={r.id} className="h-12 border-border/40">
                      <TableCell className="font-mono text-xs">{r.batch}</TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-mono text-xs text-center px-0"><Sparkles className="mr-1 inline h-3 w-3 text-secondary" />{r.score}</TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-mono text-xs px-[9px] text-center">{r.manualScore ?? "—"}</TableCell>
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

        <TabsContent value="dynamic" className="mt-4 space-y-4">
          <Tabs defaultValue="report">
            <TabsList>
              <TabsTrigger value="report">动态管理表</TabsTrigger>
              <TabsTrigger value="archive">绿色档案</TabsTrigger>
              <TabsTrigger value="risk">
                风险预警
                {entRiskOpen > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {entRiskOpen}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="mt-4">
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

            <TabsContent value="archive" className="mt-4">
              <GreenArchivePanel mode="ent" creditCode={entCreditCode} />
            </TabsContent>

            <TabsContent value="risk" className="mt-4">
              <RiskWarningPanel mode="ent" creditCode={entCreditCode} />
            </TabsContent>
          </Tabs>
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
