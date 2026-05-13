import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Search,
  Sprout,
  Filter,
  Building2,
  MapPin,
  Flame,
  TrendingUp,
  Recycle,
  ArrowRight,
  CheckCircle2,
  Activity,
  Target,
  RefreshCcw,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_INDUSTRIES } from "@/components/green-mfg/data";
import { cn } from "@/lib/utils";

// ========== 培育库丰富 Mock 数据 ==========
type IncubateLevel = "市级" | "区级";
type IncubateStage = "入库登记" | "诊断评估" | "整改提升" | "复评预审" | "晋级出库" | "退库";
type EnergyTag = "重点用能单位" | "10亿+非重点规上";

interface IncubateRecord {
  id: string;
  name: string;
  creditCode: string;
  district: string;
  industry: string;
  subIndustry?: string;
  level: IncubateLevel;
  energyTag: EnergyTag;
  outputValue: number; // 万元
  energyConsumption: number; // 吨标煤
  carbonIntensity: number; // tCO2/万元
  score: number;
  prevScore: number;
  stage: IncubateStage;
  enterDate: string;
  reviewer: string;
  nextAction: string;
  improvement: number; // 较上次评估提升百分点
}

const INCUBATE_DATA: IncubateRecord[] = [
  {
    id: "INC-2025-001",
    name: "上海石化化工新材料分公司",
    creditCode: "91310116MA1H23ABC4",
    district: "金山区",
    industry: "石化化工行业",
    subIndustry: "煤制烯烃",
    level: "市级",
    energyTag: "重点用能单位",
    outputValue: 89500,
    energyConsumption: 36800,
    carbonIntensity: 1.42,
    score: 64,
    prevScore: 58,
    stage: "整改提升",
    enterDate: "2025-08-15",
    reviewer: "金山区生态局",
    nextAction: "11 月底前完成余热回收改造",
    improvement: 6,
  },
  {
    id: "INC-2025-002",
    name: "宝钢轧辊（上海）有限公司",
    creditCode: "91310113MA1H23BC02",
    district: "宝山区",
    industry: "钢铁行业",
    subIndustry: "短流程钢铁企业",
    level: "市级",
    energyTag: "重点用能单位",
    outputValue: 156200,
    energyConsumption: 52400,
    carbonIntensity: 1.18,
    score: 71,
    prevScore: 62,
    stage: "复评预审",
    enterDate: "2025-06-20",
    reviewer: "市经信委",
    nextAction: "等待 12 月专家组复评打分",
    improvement: 9,
  },
  {
    id: "INC-2025-003",
    name: "中微半导体设备(上海)股份有限公司",
    creditCode: "91310115MA1K0DEF56",
    district: "浦东新区",
    industry: "电子行业",
    subIndustry: "集成电路",
    level: "市级",
    energyTag: "10亿+非重点规上",
    outputValue: 134000,
    energyConsumption: 8900,
    carbonIntensity: 0.32,
    score: 76,
    prevScore: 68,
    stage: "复评预审",
    enterDate: "2025-05-10",
    reviewer: "浦东经委",
    nextAction: "AI 预审已通过，进入晋级公示",
    improvement: 8,
  },
  {
    id: "INC-2025-004",
    name: "上海延锋汽车饰件系统有限公司",
    creditCode: "91310115MA1K38AUTO2",
    district: "嘉定区",
    industry: "机械行业",
    subIndustry: "汽车整车",
    level: "区级",
    energyTag: "10亿+非重点规上",
    outputValue: 218000,
    energyConsumption: 6200,
    carbonIntensity: 0.18,
    score: 68,
    prevScore: 60,
    stage: "诊断评估",
    enterDate: "2025-09-02",
    reviewer: "嘉定区经委",
    nextAction: "AI 智能体出具诊断报告中",
    improvement: 8,
  },
  {
    id: "INC-2025-005",
    name: "上海华谊新材料有限公司",
    creditCode: "91310116MA1H23HUAYI",
    district: "金山区",
    industry: "石化化工行业",
    subIndustry: "涂料",
    level: "区级",
    energyTag: "重点用能单位",
    outputValue: 67800,
    energyConsumption: 21300,
    carbonIntensity: 0.96,
    score: 59,
    prevScore: 55,
    stage: "整改提升",
    enterDate: "2025-07-28",
    reviewer: "金山区经委",
    nextAction: "VOCs 治理方案待审定",
    improvement: 4,
  },
  {
    id: "INC-2025-006",
    name: "上海联影医疗科技股份有限公司",
    creditCode: "91310115MA1K38UIH01",
    district: "嘉定区",
    industry: "电子行业",
    subIndustry: "显示器件",
    level: "市级",
    energyTag: "10亿+非重点规上",
    outputValue: 312000,
    energyConsumption: 5800,
    carbonIntensity: 0.12,
    score: 82,
    prevScore: 73,
    stage: "晋级出库",
    enterDate: "2024-11-12",
    reviewer: "市经信委",
    nextAction: "已颁发市级绿色工厂证书",
    improvement: 9,
  },
  {
    id: "INC-2025-007",
    name: "上海三菱电梯有限公司",
    creditCode: "91310112MA1H23MITS1",
    district: "闵行区",
    industry: "机械行业",
    subIndustry: "电机",
    level: "市级",
    energyTag: "10亿+非重点规上",
    outputValue: 187600,
    energyConsumption: 7400,
    carbonIntensity: 0.22,
    score: 78,
    prevScore: 70,
    stage: "复评预审",
    enterDate: "2025-04-18",
    reviewer: "闵行区生态局",
    nextAction: "等待 12 月市级评审",
    improvement: 8,
  },
  {
    id: "INC-2025-008",
    name: "上海某印染织造有限公司",
    creditCode: "91310118MA1J23DYE01",
    district: "青浦区",
    industry: "纺织行业",
    subIndustry: "印染",
    level: "区级",
    energyTag: "重点用能单位",
    outputValue: 42300,
    energyConsumption: 14600,
    carbonIntensity: 1.58,
    score: 48,
    prevScore: 50,
    stage: "退库",
    enterDate: "2024-09-10",
    reviewer: "青浦区生态局",
    nextAction: "改进无成效，已退库下年度重新申报",
    improvement: -2,
  },
  {
    id: "INC-2025-009",
    name: "上海某轻工日化股份有限公司",
    creditCode: "91310120MA1A23QG001",
    district: "奉贤区",
    industry: "轻工行业",
    subIndustry: "家用电器",
    level: "区级",
    energyTag: "10亿+非重点规上",
    outputValue: 108200,
    energyConsumption: 4800,
    carbonIntensity: 0.16,
    score: 66,
    prevScore: 58,
    stage: "入库登记",
    enterDate: "2025-10-08",
    reviewer: "奉贤区经委",
    nextAction: "完成入库材料归档，待诊断",
    improvement: 8,
  },
];

const STAGE_PIPELINE: { key: IncubateStage; label: string; icon: typeof Sprout; color: string }[] = [
  { key: "入库登记", label: "入库登记", icon: Sprout, color: "hsl(200 75% 50%)" },
  { key: "诊断评估", label: "诊断评估", icon: Activity, color: "hsl(220 70% 55%)" },
  { key: "整改提升", label: "整改提升", icon: TrendingUp, color: "hsl(35 90% 55%)" },
  { key: "复评预审", label: "复评预审", icon: Target, color: "hsl(265 65% 60%)" },
  { key: "晋级出库", label: "晋级出库", icon: CheckCircle2, color: "hsl(150 70% 42%)" },
];

const stageBadge = (s: IncubateStage) => {
  switch (s) {
    case "入库登记": return "border-sky-400/40 bg-sky-400/10 text-sky-600 dark:text-sky-300";
    case "诊断评估": return "border-blue-400/40 bg-blue-400/10 text-blue-600 dark:text-blue-300";
    case "整改提升": return "border-warning/40 bg-warning/10 text-warning";
    case "复评预审": return "border-violet-400/40 bg-violet-400/10 text-violet-600 dark:text-violet-300";
    case "晋级出库": return "border-success/40 bg-success/10 text-success";
    case "退库": return "border-destructive/40 bg-destructive/10 text-destructive";
  }
};

const energyTagBadge = (t: EnergyTag) =>
  t === "重点用能单位"
    ? "border-orange-400/40 bg-orange-400/10 text-orange-600 dark:text-orange-300"
    : "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300";

export default function GreenMfgGovIncubator() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState<"all" | IncubateLevel>("all");
  const [energyFilter, setEnergyFilter] = useState<"all" | EnergyTag>("all");
  const [stageFilter, setStageFilter] = useState<"all" | IncubateStage>("all");

  const rows = useMemo(
    () =>
      INCUBATE_DATA.filter((r) => {
        const k = keyword.trim();
        if (k && !r.name.includes(k) && !r.creditCode.includes(k)) return false;
        if (industryFilter !== "all" && r.industry !== industryFilter) return false;
        if (levelFilter !== "all" && r.level !== levelFilter) return false;
        if (energyFilter !== "all" && r.energyTag !== energyFilter) return false;
        if (stageFilter !== "all" && r.stage !== stageFilter) return false;
        return true;
      }),
    [keyword, industryFilter, levelFilter, energyFilter, stageFilter],
  );

  // 统计
  const cityLevel = INCUBATE_DATA.filter((r) => r.level === "市级");
  const districtLevel = INCUBATE_DATA.filter((r) => r.level === "区级");
  const keyEnergy = INCUBATE_DATA.filter((r) => r.energyTag === "重点用能单位");
  const bigOutput = INCUBATE_DATA.filter((r) => r.energyTag === "10亿+非重点规上");

  const stageCounts = STAGE_PIPELINE.map((s) => ({
    ...s,
    count: INCUBATE_DATA.filter((r) => r.stage === s.key).length,
  }));
  const exitedCount = INCUBATE_DATA.filter((r) => r.stage === "退库").length;
  const graduatedCount = INCUBATE_DATA.filter((r) => r.stage === "晋级出库").length;
  const totalCount = INCUBATE_DATA.length;
  const conversionRate = Math.round((graduatedCount / totalCount) * 100);

  return (
    <AppLayout title="绿色工厂梯度培育" subtitle="梯度培育库的跟踪与管理">
      {/* ========== KPI：市级 / 区级 + 标签维度 ========== */}
      <div className="grid gap-3 md:grid-cols-4 mb-4">
        <KpiCard
          title="市级培育库"
          value={cityLevel.length}
          subtitle={`本年新增 ${cityLevel.filter((r) => r.enterDate.startsWith("2025")).length}`}
          icon={Building2}
          accent="primary"
          extra={`平均得分 ${Math.round(cityLevel.reduce((s, r) => s + r.score, 0) / Math.max(cityLevel.length, 1))}`}
        />
        <KpiCard
          title="区级培育库"
          value={districtLevel.length}
          subtitle={`本年新增 ${districtLevel.filter((r) => r.enterDate.startsWith("2025")).length}`}
          icon={MapPin}
          accent="cyan"
          extra={`平均得分 ${Math.round(districtLevel.reduce((s, r) => s + r.score, 0) / Math.max(districtLevel.length, 1))}`}
        />
        <KpiCard
          title="重点用能单位"
          value={keyEnergy.length}
          subtitle="10 家企业"
          icon={Flame}
          accent="warning"
          extra={`占比 ${Math.round((keyEnergy.length / totalCount) * 100)}%`}
        />
        <KpiCard
          title="10亿+非重点规上"
          value={bigOutput.length}
          subtitle="10 家企业"
          icon={TrendingUp}
          accent="success"
          extra={`占比 ${Math.round((bigOutput.length / totalCount) * 100)}%`}
        />
      </div>

      {/* ========== 培育闭环流转图 ========== */}
      <Card className="panel mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Recycle className="h-4 w-4 text-success" />
              培育体系闭环流转
            </CardTitle>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3 w-3" />晋级 {graduatedCount} 家
              </span>
              <span className="inline-flex items-center gap-1 text-destructive">
                <RefreshCcw className="h-3 w-3" />退库 {exitedCount} 家
              </span>
              <span className="inline-flex items-center gap-1 text-primary font-semibold">
                培育转化率 {conversionRate}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col gap-3">
            {/* 流转管道 */}
            <div className="flex items-stretch gap-1 overflow-x-auto">
              {stageCounts.map((s, i) => {
                const Icon = s.icon;
                const isLast = i === stageCounts.length - 1;
                return (
                  <div key={s.key} className="flex items-stretch flex-1 min-w-[120px]">
                    <button
                      type="button"
                      onClick={() => setStageFilter(stageFilter === s.key ? "all" : s.key)}
                      className={cn(
                        "flex-1 rounded-lg border p-3 text-left transition hover:shadow-md",
                        stageFilter === s.key
                          ? "border-primary/60 bg-primary/5 shadow-sm"
                          : "border-border bg-card",
                      )}
                      style={{ borderLeftWidth: 4, borderLeftColor: s.color }}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: s.color }}>
                        <Icon className="h-3.5 w-3.5" />
                        {s.label}
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold tracking-tight" style={{ color: s.color }}>
                          {s.count}
                        </span>
                        <span className="text-[11px] text-muted-foreground">家</span>
                      </div>
                    </button>
                    {!isLast && (
                      <div className="flex items-center px-1 text-muted-foreground/50">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* 闭环回流提示 */}
            <div className="flex items-center justify-between rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <RefreshCcw className="h-3.5 w-3.5 text-destructive" />
                <strong className="text-destructive">退库回流</strong>
                ：连续两次复评未达标自动退库 → 次年重新申报入库，形成"培育—评估—整改—晋级/退库—再申报"良性闭环。
              </span>
              <span className="inline-flex items-center gap-1.5 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                晋级出库企业自动进入「绿色工厂动态管理」年度复核
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== 列表 + 多维筛选 ========== */}
      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base">培育企业列表 · 共 {rows.length} 家</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索企业名称 / 信用代码"
                  className="h-8 w-56 pl-8 text-xs"
                />
              </div>
              <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as typeof levelFilter)}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <Filter className="mr-1 h-3 w-3" />
                  <SelectValue placeholder="级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  <SelectItem value="市级">市级</SelectItem>
                  <SelectItem value="区级">区级</SelectItem>
                </SelectContent>
              </Select>
              <Select value={energyFilter} onValueChange={(v) => setEnergyFilter(v as typeof energyFilter)}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <Filter className="mr-1 h-3 w-3" />
                  <SelectValue placeholder="企业类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="重点用能单位">重点用能单位</SelectItem>
                  <SelectItem value="10亿+非重点规上">10亿+非重点规上</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as typeof stageFilter)}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <Filter className="mr-1 h-3 w-3" />
                  <SelectValue placeholder="阶段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部阶段</SelectItem>
                  {STAGE_PIPELINE.map((s) => (
                    <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                  ))}
                  <SelectItem value="退库">退库</SelectItem>
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <Filter className="mr-1 h-3 w-3" />
                  <SelectValue placeholder="行业" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部行业</SelectItem>
                  {ALL_INDUSTRIES.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>企业 / 信用代码</TableHead>
                <TableHead>所属区</TableHead>
                <TableHead>行业 / 子行业</TableHead>
                <TableHead className="text-center">级别</TableHead>
                <TableHead>企业类型标签</TableHead>
                <TableHead className="text-center">产值（万元）</TableHead>
                <TableHead className="text-center">综合能耗（吨标煤）</TableHead>
                <TableHead className="text-center">得分（环比）</TableHead>
                <TableHead className="text-center">培育阶段</TableHead>
                <TableHead>下一步行动</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="h-14 border-border/40">
                  <TableCell>
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{r.creditCode}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">入库 {r.enterDate} · {r.reviewer}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.district}</TableCell>
                  <TableCell>
                    <div className="text-xs">{r.industry}</div>
                    {r.subIndustry && <div className="mt-0.5 text-[11px] text-muted-foreground">{r.subIndustry}</div>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px]",
                        r.level === "市级"
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-cyan-400/40 bg-cyan-400/10 text-cyan-600 dark:text-cyan-300",
                      )}
                    >
                      {r.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[11px]", energyTagBadge(r.energyTag))}>
                      {r.energyTag === "重点用能单位" ? <Flame className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3" />}
                      {r.energyTag}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">{r.outputValue.toLocaleString()}</TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    <div>{r.energyConsumption.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">碳强度 {r.carbonIntensity}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-mono text-sm font-semibold">{r.score}</div>
                    <div
                      className={cn(
                        "text-[10px] font-medium",
                        r.improvement > 0 ? "text-success" : r.improvement < 0 ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {r.improvement > 0 ? "▲" : r.improvement < 0 ? "▼" : "—"} {Math.abs(r.improvement)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn("text-[11px]", stageBadge(r.stage))}>{r.stage}</Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground max-w-[200px]">{r.nextAction}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      onClick={() => navigate(`/green-mfg/gov/declaration/${r.id}`)}
                    >
                      <Eye className="mr-1 h-3 w-3" />详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center text-xs text-muted-foreground">
                    暂无符合条件的培育企业
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  extra,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: typeof Sprout;
  accent: "primary" | "cyan" | "warning" | "success";
  extra?: string;
}) {
  const map = {
    primary: { bg: "bg-primary/15", text: "text-primary", value: "text-primary" },
    cyan: { bg: "bg-cyan-500/15", text: "text-cyan-600 dark:text-cyan-300", value: "text-cyan-600 dark:text-cyan-300" },
    warning: { bg: "bg-warning/15", text: "text-warning", value: "text-warning" },
    success: { bg: "bg-success/15", text: "text-success", value: "text-success" },
  } as const;
  const c = map[accent];
  return (
    <Card className="panel">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", c.bg, c.text)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">{title}</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className={cn("text-2xl font-bold tracking-tight", c.value)}>{value}</span>
              {subtitle && <span className="text-[11px] text-muted-foreground">{subtitle}</span>}
            </div>
            {extra && <div className="mt-1 text-[11px] text-muted-foreground">{extra}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
