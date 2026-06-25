import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, Eye, FileEdit, Leaf, Plus, Sparkles, Target } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MOCK_DECLARATIONS,
  MOCK_DYNAMIC,
  MOCK_SELF_ASSESS,
  dynamicStatusClass,
  stageBadgeClass,
} from "@/components/green-mfg/data";
import { GreenArchivePanel } from "@/components/green-mfg/GreenArchivePanel";
import { RiskWarningPanel } from "@/components/green-mfg/RiskWarningPanel";
import { MOCK_RISKS } from "@/components/green-mfg/dynamicExtData";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DEFAULT_ENT_NAME = "上海华普电缆有限公司";
const MY_SELF_ASSESS = MOCK_SELF_ASSESS.filter((r) => r.enterpriseName === DEFAULT_ENT_NAME);


export default function GreenMfgEnt({ section }: { section?: "declaration" | "dynamic" } = {}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>(section ?? "declaration");
  useEffect(() => {
    if (section) setTab(section);
  }, [section]);

  // 当前企业 = MOCK_DECLARATIONS[0]
  const myDeclaration = MOCK_DECLARATIONS[0];
  const myDynamics = MOCK_DYNAMIC.filter((_, i) => i < 2);
  const entCreditCode = section === "dynamic" ? "913100007896543210" : myDeclaration.creditCode;
  const entRiskOpen = MOCK_RISKS.filter((r) => r.creditCode === entCreditCode && r.status !== "已关闭").length;
  const isGreenFactory = myDeclaration.stage === "已完成";

  const latestSelf = MY_SELF_ASSESS[0];


  return (
    <AppLayout
      title={
        section === "dynamic"
          ? "绿色工厂动态管理 · 申能电力设备股份有限公司"
          : "模拟自我评价"
      }
      subtitle={
        section === "dynamic"
          ? "市级绿色工厂年度动态管理表填报"
          : "\n"
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        {!section && (
          <TabsList>
            <TabsTrigger value="declaration">绿色工厂自评价</TabsTrigger>
            <TabsTrigger value="dynamic">动态管理表（年度）</TabsTrigger>
          </TabsList>
        )}

        {/* ================= 自评价 Tab ================= */}
        <TabsContent value="declaration" className="mt-4 space-y-4">
          {/* —— 模拟自我评价（本地工具，仅 AI 智能体打分，不提交） —— */}
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {"\n"}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {"\n"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="h-8 bg-gradient-primary text-primary-foreground" onClick={() => navigate("/green-mfg/ent/declaration/new?mode=self")}>
                    <Plus className="mr-1 h-4 w-4" />{"开始评价"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 历次自评价 */}
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>公司名称</TableHead>
                    <TableHead>评价批次</TableHead>
                    <TableHead className="text-center">AI 智能打分</TableHead>
                    <TableHead className="text-center">薄弱项</TableHead>
                    <TableHead>评估日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MY_SELF_ASSESS.map((r) => (
                    <TableRow key={r.id} className="h-12 border-border/40">
                      <TableCell className="text-xs">{r.enterpriseName}</TableCell>
                      <TableCell className="text-xs">{r.batch}</TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        <Sparkles className="mr-1 inline h-3 w-3 text-secondary" />{r.aiScore}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">{r.weakCount}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => navigate(`/green-mfg/ent/declaration/${myDeclaration.id}?mode=self`)}>
                            <Eye className="mr-1 h-3 w-3" />查看
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </TabsContent>

        {/* ================= 动态管理 Tab ================= */}
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

/** 零碳进阶 - 基础骨架（具体功能后续补充） */
export function ZeroCarbonPanel({ mode, eligible }: { mode: "ent" | "gov"; eligible?: boolean }) {
  return (
    <Card className="panel">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="h-4 w-4 text-success" />零碳工厂进阶
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {mode === "ent"
                ? "已评为市级/国家级绿色工厂的企业，可在此申请向「零碳工厂」进阶。"
                : "管理已获评绿色工厂企业的零碳进阶申请、过程跟踪与评定。"}
            </p>
          </div>
          {mode === "ent" && (
            <Button
              size="sm"
              className="h-8 bg-gradient-primary text-primary-foreground"
              disabled={!eligible}
              onClick={() => toast.info("零碳进阶申请已发起（演示）")}
            >
              <Target className="mr-1 h-4 w-4" />申请零碳进阶
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {mode === "ent" && !eligible ? (
          <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
            当前尚未获评市级/国家级绿色工厂，暂不具备零碳进阶资格。请先完成绿色工厂评定。
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <SkeletonStage step={1} title="碳核算基线" desc="温室气体核查、产品碳足迹基线" />
            <SkeletonStage step={2} title="减碳路径" desc="能效提升、可再生能源替代、工艺低碳化" />
            <SkeletonStage step={3} title="抵消与认证" desc="碳抵消方案、第三方认证、零碳工厂评定" />
          </div>
        )}
        <p className="mt-4 text-[11px] text-muted-foreground/80">具体指标体系与评定流程待补充。</p>
      </CardContent>
    </Card>
  );
}

function SkeletonStage({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/10 p-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-[11px] font-semibold text-success">
          {step}
        </span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
