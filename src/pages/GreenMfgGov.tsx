import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, Eye, FileBarChart, Filter, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ALL_INDUSTRIES,
  DECLARATION_BATCHES,
  MOCK_DECLARATIONS,
  MOCK_DYNAMIC,
  dynamicStatusClass,
  stageBadgeClass,
} from "@/components/green-mfg/data";

export default function GreenMfgGov() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("declaration");
  const [keyword, setKeyword] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");

  const declarations = MOCK_DECLARATIONS.filter((r) => {
    const k = keyword.trim();
    if (k && !r.enterpriseName.includes(k) && !r.creditCode.includes(k)) return false;
    if (stageFilter !== "all" && r.stage !== stageFilter) return false;
    if (industryFilter !== "all" && r.industry !== industryFilter) return false;
    if (batchFilter !== "all" && r.batch !== batchFilter) return false;
    return true;
  });

  const dynamicRows = MOCK_DYNAMIC.filter((r) => {
    const k = keyword.trim();
    if (k && !r.enterpriseName.includes(k) && !r.creditCode.includes(k)) return false;
    return true;
  });

  return (
    <AppLayout
      title="绿色工厂（梯度培育）· 政府侧"
      subtitle="申报监管、智能预审、人工审批、动态管理表年度复核"
    >
      {/* 概览指标 */}
      <div className="grid gap-3 md:grid-cols-4 mb-4">
        <KpiTile icon={ClipboardList} label="待审申报" value={declarations.filter((d) => d.stage === "区审批" || d.stage === "市审批").length} accent="primary" />
        <KpiTile icon={CheckCircle2} label="本年已通过" value={MOCK_DECLARATIONS.filter((d) => d.stage === "已通过").length} accent="success" />
        <KpiTile icon={FileBarChart} label="培育中企业" value={MOCK_DECLARATIONS.filter((d) => d.stage === "培育中").length} accent="warning" />
        <KpiTile icon={ClipboardList} label="动态管理待审" value={MOCK_DYNAMIC.filter((d) => d.status === "已填报").length} accent="primary" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="declaration">绿色工厂申报管理</TabsTrigger>
          <TabsTrigger value="dynamic">动态管理表（年度）</TabsTrigger>
        </TabsList>

        {/* 申报管理 */}
        <TabsContent value="declaration" className="mt-4">
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="text-base">申报列表</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="搜索企业名称 / 信用代码"
                      className="h-8 w-64 pl-8 text-xs"
                    />
                  </div>
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <Filter className="mr-1 h-3 w-3" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="区审批">区审批</SelectItem>
                      <SelectItem value="市审批">市审批</SelectItem>
                      <SelectItem value="已通过">已通过</SelectItem>
                      <SelectItem value="培育中">培育中</SelectItem>
                      <SelectItem value="已驳回">已驳回</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>企业名称 / 统一社会信用代码</TableHead>
                    <TableHead>所属区</TableHead>
                    <TableHead>行业</TableHead>
                    <TableHead className="text-right">系统打分 / 人工打分</TableHead>
                    <TableHead className="text-right">产值（万元）</TableHead>
                    <TableHead className="text-center">流转状态</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declarations.map((r) => (
                    <TableRow key={r.id} className="h-12 border-border/40">
                      <TableCell>
                        <div className="text-sm">{r.enterpriseName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{r.creditCode}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.district}</TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">{r.industry}</div>
                        <Badge variant="outline" className={r.industryType === "重点行业" ? "border-warning/40 bg-warning/10 text-warning mt-0.5" : "border-primary/40 bg-primary/10 text-primary mt-0.5"}>
                          {r.industryType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-mono text-xs">{r.score} / {r.manualScore ?? "—"}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.outputValue.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={stageBadgeClass(r.stage)}>{r.stage}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.submitDate}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => navigate(`/green-mfg/gov/declaration/${r.id}`)}>
                          <Eye className="mr-1 h-3 w-3" />详情/审批
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {declarations.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="h-24 text-center text-xs text-muted-foreground">暂无符合条件的申报</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 动态管理 */}
        <TabsContent value="dynamic" className="mt-4">
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">动态管理表 · {new Date().getFullYear()} 年度</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">仅市级绿色工厂需逐年填报；填报后由市级生态主管部门复核。</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索企业名称 / 信用代码" className="h-8 w-64 pl-8 text-xs" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>编号</TableHead>
                    <TableHead>企业名称</TableHead>
                    <TableHead>所属区</TableHead>
                    <TableHead className="text-center">年度</TableHead>
                    <TableHead className="text-right">综合能耗</TableHead>
                    <TableHead className="text-right">碳排放</TableHead>
                    <TableHead className="text-right">固废利用率</TableHead>
                    <TableHead className="text-center">状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dynamicRows.map((r) => (
                    <TableRow key={r.id} className="h-12 border-border/40">
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="text-sm">{r.enterpriseName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.district}</TableCell>
                      <TableCell className="text-center font-mono text-xs">{r.year}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.energyConsumption?.toLocaleString() ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.carbonEmission?.toLocaleString() ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.wasteRecycleRate != null ? `${r.wasteRecycleRate}%` : "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={dynamicStatusClass(r.status)}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => navigate(`/green-mfg/gov/dynamic/${r.id}`)}>
                          <Eye className="mr-1 h-3 w-3" />查看/审核
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

function KpiTile({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: "primary" | "success" | "warning" }) {
  const cls = accent === "success" ? "text-success bg-success/10" : accent === "warning" ? "text-warning bg-warning/10" : "text-primary bg-primary/10";
  return (
    <Card className="panel">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${cls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
