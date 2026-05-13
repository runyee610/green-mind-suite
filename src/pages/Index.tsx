import { useMemo, useState } from "react";
import {
  Activity,
  Brain,
  Factory,
  Leaf,
  Zap,
  Boxes,
  Layers,
  Send,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Building2,
  PieChart as PieIcon,
  BarChart3,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const YEARS = ["2020", "2021", "2022", "2023", "2024", "2025"];
const DISTRICTS = [
  "全市", "浦东新区", "黄浦区", "徐汇区", "长宁区", "静安区", "普陀区", "虹口区",
  "杨浦区", "闵行区", "宝山区", "嘉定区", "金山区", "松江区", "青浦区", "奉贤区", "崇明区",
  "上海化工区", "临港新片区",
];
const INDUSTRIES = [
  "全部产业", "集成电路", "生物医药", "人工智能", "电子信息", "生命健康",
  "汽车", "高端装备", "先进材料", "时尚消费品",
];

const CYAN = "hsl(189 90% 45%)";
const GREEN = "hsl(155 70% 38%)";
const AMBER = "hsl(38 92% 50%)";
const SLATE = "hsl(215 28% 28%)";
const VIOLET = "hsl(265 70% 55%)";
const ROSE = "hsl(340 75% 55%)";
const LABEL = "hsl(215 30% 22%)";

/* ============== Real data digested from Excel ============== */
// 上海市 + 国家级累计（截至 2025.11）
const KPI = {
  factory: { city: 523, nation: 196 },
  supply: { city: 75, nation: 17 },
  park: { city: 29, nation: 8 },
  product: { city: 150, nation: 67 },
  designEnt: { city: 12, nation: 12 },
};

// 区县分布（绿色工厂 / 供应链 / 园区）
const DISTRICT_DATA = [
  { d: "浦东新区", 工厂: 118, 供应链: 20, 园区: 6 },
  { d: "金山区", 工厂: 81, 供应链: 10, 园区: 3 },
  { d: "嘉定区", 工厂: 72, 供应链: 12, 园区: 3 },
  { d: "闵行区", 工厂: 57, 供应链: 13, 园区: 3 },
  { d: "松江区", 工厂: 51, 供应链: 4, 园区: 2 },
  { d: "宝山区", 工厂: 42, 供应链: 4, 园区: 5 },
  { d: "青浦区", 工厂: 36, 供应链: 5, 园区: 1 },
  { d: "奉贤区", 工厂: 33, 供应链: 5, 园区: 3 },
  { d: "化工区", 工厂: 14, 供应链: 1, 园区: 1 },
  { d: "临港", 工厂: 7, 供应链: 0, 园区: 1 },
  { d: "崇明区", 工厂: 7, 供应链: 0, 园区: 2 },
  { d: "其他", 工厂: 8, 供应链: 2, 园区: 0 },
];

// "3+6" 9 大产业（绿色工厂 + 供应链合并）
const INDUSTRY_36 = [
  { name: "集成电路", group: "三大先导", value: 6 },
  { name: "生物医药", group: "三大先导", value: 37 },
  { name: "人工智能", group: "三大先导", value: 4 },
  { name: "电子信息", group: "六大重点", value: 16 },
  { name: "生命健康", group: "六大重点", value: 2 },
  { name: "汽车", group: "六大重点", value: 62 },
  { name: "高端装备", group: "六大重点", value: 25 },
  { name: "先进材料", group: "六大重点", value: 27 },
  { name: "时尚消费品", group: "六大重点", value: 34 },
];

// 集团排行
const GROUP_RANK = [
  { name: "上汽集团", value: 17 },
  { name: "上海电气集团", value: 15 },
  { name: "上药集团", value: 11 },
  { name: "宝武集团", value: 8 },
  { name: "华虹集团", value: 4 },
  { name: "华谊集团", value: 3 },
  { name: "光明集团", value: 2 },
  { name: "烟草集团", value: 2 },
  { name: "申能集团", value: 2 },
  { name: "城投集团", value: 2 },
];

// 重点用能单位 vs 非重点
const KEY_ENERGY = [
  { name: "重点用能单位", value: 169, fill: CYAN },
  { name: "非重点单位", value: 357, fill: GREEN },
];

// 行业 TOP 12
const INDUSTRY_TOP = [
  { name: "通用设备", value: 40 },
  { name: "机械", value: 35 },
  { name: "汽车零部件", value: 33 },
  { name: "医药", value: 28 },
  { name: "电子电器", value: 27 },
  { name: "食品", value: 24 },
  { name: "塑料制品", value: 18 },
  { name: "化工", value: 16 },
  { name: "金属制品", value: 16 },
  { name: "电气机械", value: 14 },
  { name: "电线电缆", value: 11 },
  { name: "集成电路", value: 10 },
];

// 国家级绿色工厂 历年新增
const NATION_YEAR = [
  { y: "2017", v: 4 },
  { y: "2018", v: 8 },
  { y: "2019", v: 16 },
  { y: "2020", v: 28 },
  { y: "2021", v: 23 },
  { y: "2022", v: 29 },
  { y: "2023", v: 37 },
  { y: "2024", v: 55 },
];

// 星级
const STAR = [
  { name: "五星", value: 48, fill: AMBER },
  { name: "四星", value: 351, fill: CYAN },
  { name: "三星", value: 82, fill: GREEN },
];

// 培育梯度漏斗
const FUNNEL = [
  { name: "培育库企业", value: 1280, fill: "hsl(189 85% 60%)" },
  { name: "市级绿色工厂", value: 523, fill: "hsl(168 70% 40%)" },
  { name: "国家级绿色工厂", value: 196, fill: "hsl(155 75% 30%)" },
];

// 能耗 / 碳排
const ENERGY_CARBON = [
  { y: "2020", energy: 11820, carbon: 1620 },
  { y: "2021", energy: 11420, carbon: 1540 },
  { y: "2022", energy: 10980, carbon: 1450 },
  { y: "2023", energy: 10520, carbon: 1360 },
  { y: "2024", energy: 10120, carbon: 1290 },
  { y: "2025", energy: 9860, carbon: 1240 },
];

// AI 预警
const ALERTS = [
  { site: "宝山-钢铁产线 #3", level: "high", msg: "电耗较基线 +18.6%", time: "12:42" },
  { site: "嘉定-汽车涂装车间", level: "mid", msg: "天然气波动异常", time: "11:08" },
  { site: "金山-化工装置 A", level: "high", msg: "蒸汽消耗连续 3h 偏高", time: "09:55" },
  { site: "浦东-IDC 数据中心 #2", level: "low", msg: "PUE 趋势上行", time: "08:30" },
];

// 跨周期目标追踪
const PLAN_TRACK = [
  { phase: "十三五·2018", 工厂: 120, 园区: 8, 供应链: 18, 设计产品: 42 },
  { phase: "十三五·2020", 工厂: 220, 园区: 14, 供应链: 32, 设计产品: 78 },
  { phase: "十四五·2022", 工厂: 360, 园区: 21, 供应链: 52, 设计产品: 110 },
  { phase: "十四五·2024", 工厂: 480, 园区: 27, 供应链: 70, 设计产品: 142 },
  { phase: "十四五·2025", 工厂: 523, 园区: 29, 供应链: 75, 设计产品: 150 },
  { phase: "十五五·2027(预)", 工厂: 720, 园区: 42, 供应链: 110, 设计产品: 220 },
  { phase: "十五五·2030(预)", 工厂: 1000, 园区: 60, 供应链: 160, 设计产品: 320 },
];

/* ============== Components ============== */
function KpiTile({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  delta,
  variant = "cyan",
}: {
  icon: any;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  delta?: { v: number; label: string };
  variant?: "cyan" | "green";
}) {
  return (
    <div className={`glass-card ${variant === "cyan" ? "glass-card-cyan" : "glass-card-green"} p-4 h-full flex flex-col`}>
      <div className="flex items-start justify-between">
        <div className="text-[13px] font-semibold text-slate-800 tracking-wide">{label}</div>
        <Icon className={`h-4 w-4 ${variant === "cyan" ? "neon-text-cyan" : "neon-text-green"}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-[32px] leading-none font-bold tabular-nums tracking-tight ${variant === "cyan" ? "neon-text-cyan" : "neon-text-green"}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-slate-600">{unit}</span>}
      </div>
      {sub && <div className="mt-auto pt-2 text-[11px] text-slate-600 leading-snug">{sub}</div>}
      {delta && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px]">
          {delta.v < 0 ? (
            <span className="inline-flex items-center gap-0.5 text-success">
              <TrendingDown className="h-3 w-3" />
              {Math.abs(delta.v)}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-destructive">
              <TrendingUp className="h-3 w-3" />
              {delta.v}%
            </span>
          )}
          <span className="text-slate-600">{delta.label}</span>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, accent, right }: { icon: any; title: string; accent: "cyan" | "green"; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`h-4 w-4 ${accent === "cyan" ? "neon-text-cyan" : "neon-text-green"}`} />
      <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
      <div className={`flex-1 h-px ${accent === "cyan" ? "bg-gradient-to-r from-cyan-400/50 to-transparent" : "bg-gradient-to-r from-emerald-400/50 to-transparent"}`} />
      {right}
    </div>
  );
}

/* ============== Multi-dim distribution panel ============== */
function MultiDimPanel() {
  const [tab, setTab] = useState("district");
  const tabsCfg = [
    { key: "district", label: "按区县", data: DISTRICT_DATA, xKey: "d", multi: true, height: 320 },
    { key: "industry36", label: "按 3+6 产业", data: INDUSTRY_36, xKey: "name", multi: false, height: 320 },
    { key: "industry", label: "按行业", data: INDUSTRY_TOP, xKey: "name", multi: false, height: 320 },
    { key: "group", label: "按集团", data: GROUP_RANK, xKey: "name", multi: false, height: 320 },
    { key: "energy", label: "按重点用能", data: KEY_ENERGY, xKey: "name", multi: false, height: 320, pie: true },
  ] as const;

  return (
    <div className="glass-card glass-card-cyan p-4 h-full flex flex-col">
      <SectionTitle
        icon={BarChart3}
        title="多维度分布分析 · 实时联动"
        accent="cyan"
        right={
          <Badge className="h-5 px-2 text-[10px] bg-cyan-100 text-cyan-700 border-0">总计 523 家工厂 · 75 家供应链 · 29 个园区</Badge>
        }
      />
      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
        <TabsList className="bg-white/60 backdrop-blur h-9">
          {tabsCfg.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="district" className="flex-1 mt-3">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={DISTRICT_DATA} margin={{ top: 16, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: LABEL }} />
              <YAxis tick={{ fontSize: 10, fill: LABEL }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="工厂" fill={CYAN} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="工厂" position="top" fontSize={10} fill={LABEL} />
              </Bar>
              <Bar dataKey="供应链" fill={GREEN} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="供应链" position="top" fontSize={10} fill={LABEL} />
              </Bar>
              <Bar dataKey="园区" fill={AMBER} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="园区" position="top" fontSize={10} fill={LABEL} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="industry36" className="flex-1 mt-3">
          <div className="flex items-center gap-3 mb-1 text-[11px]">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: VIOLET }} />三大先导产业</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />六大重点产业</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={INDUSTRY_36} margin={{ top: 18, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: LABEL }} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: LABEL }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {INDUSTRY_36.map((d, i) => (
                  <Cell key={i} fill={d.group === "三大先导" ? VIOLET : GREEN} />
                ))}
                <LabelList dataKey="value" position="top" fontSize={11} fontWeight={700} fill={LABEL} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="industry" className="flex-1 mt-3">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={INDUSTRY_TOP} layout="vertical" margin={{ top: 6, right: 36, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: LABEL }} />
              <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10, fill: LABEL }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {INDUSTRY_TOP.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? CYAN : GREEN} />
                ))}
                <LabelList dataKey="value" position="right" fontSize={10} fontWeight={600} fill={LABEL} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="group" className="flex-1 mt-3">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={GROUP_RANK} layout="vertical" margin={{ top: 6, right: 36, left: 16, bottom: 0 }}>
              <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: LABEL }} />
              <YAxis dataKey="name" type="category" width={92} tick={{ fontSize: 10, fill: LABEL }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} fill={CYAN}>
                <LabelList dataKey="value" position="right" fontSize={11} fontWeight={700} fill={LABEL} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="energy" className="flex-1 mt-3">
          <div className="grid grid-cols-2 gap-4 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={KEY_ENERGY}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={3}
                  label={({ name, value, percent }) => `${name} ${value} (${(percent * 100).toFixed(1)}%)`}
                  labelLine={{ stroke: SLATE }}
                >
                  {KEY_ENERGY.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={STAR}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={3}
                  label={({ name, value, percent }) => `${name} ${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: SLATE }}
                >
                  {STAR.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-600 text-center mt-1">
            左：重点用能单位占比 <span className="neon-text-cyan font-semibold">32.1%</span> · 右：市级绿色工厂星级分布
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ============== Page ============== */
const Index = () => {
  const [year, setYear] = useState("2025");
  const [district, setDistrict] = useState("全市");
  const [industry, setIndustry] = useState("全部产业");
  const [aiInput, setAiInput] = useState("");

  return (
    <AppLayout hideHeader>
      {/* Title + filters */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-cyan-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-[26px] font-bold tracking-tight bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                上海市绿色制造体系能碳数智全景看板
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                数据来源：上海市绿色制造体系名单（2025.11） · AI 智能体驱动 · 一屏通览
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-600">
                  <span className="glow-dot" /> 数据流实时同步
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="h-9 w-[120px] bg-white/70 backdrop-blur border-cyan-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (<SelectItem key={y} value={y}>年度 {y}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="h-9 w-[140px] bg-white/70 backdrop-blur border-cyan-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISTRICTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="h-9 w-[160px] bg-white/70 backdrop-blur border-emerald-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (<SelectItem key={i} value={i}>{i}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <KpiTile icon={Factory} label="绿色工厂" value="523" unit="家" sub={`国家级 ${KPI.factory.nation} 家 · 十四五完成率 104.6%`} variant="green" />
        <KpiTile icon={Layers} label="绿色供应链管理企业" value="75" unit="家" sub={`国家级 ${KPI.supply.nation} 家 · 较上年 +12`} variant="cyan" />
        <KpiTile icon={Boxes} label="绿色园区" value="29" unit="个" sub={`国家级 ${KPI.park.nation} 个 · 完成率 96.7%`} variant="green" />
        <KpiTile icon={Leaf} label="绿色设计产品" value="150" unit="项" sub={`国家级 ${KPI.product.nation} 项 · 12 家示范企业`} variant="cyan" />
        <KpiTile icon={Zap} label="单位 GDP 能耗" value="0.232" unit="tce/万元" delta={{ v: -4.2, label: "同比" }} sub="脱钩指数 0.83 · 持续强脱钩" variant="green" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Left col */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass-card p-4 flex-1">
            <SectionTitle icon={Layers} title="梯度培育漏斗" accent="cyan" />
            <div className="h-[210px]">
              <ResponsiveContainer>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={FUNNEL} isAnimationActive>
                    <LabelList position="right" fill={LABEL} stroke="none" dataKey="name" fontSize={11} fontWeight={600} />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={14} fontWeight={700} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              培育→市级转化 <span className="neon-text-cyan font-semibold">40.9%</span> · 市级→国家级 <span className="neon-text-green font-semibold">37.5%</span>
            </div>
          </div>

          <div className="glass-card p-4 flex-1">
            <SectionTitle icon={Trophy} title="重点集团绿色工厂数 TOP10" accent="green" />
            <div className="space-y-1.5">
              {GROUP_RANK.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2 text-xs">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${i < 3 ? "bg-gradient-to-br from-cyan-500 to-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-slate-700">{g.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-500" style={{ width: `${(g.value / 17) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono font-semibold neon-text-cyan">{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: multi-dim */}
        <div className="lg:col-span-6">
          <MultiDimPanel />
        </div>

        {/* Right col */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass-card p-4 flex-1">
            <SectionTitle icon={Zap} title="能耗与碳排双控趋势" accent="green" />
            <div className="h-[200px]">
              <ResponsiveContainer>
                <LineChart data={ENERGY_CARBON} margin={{ top: 16, left: -10, right: 10, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" />
                  <XAxis dataKey="y" tick={{ fontSize: 10, fill: LABEL }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 10, fill: CYAN }} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: GREEN }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line yAxisId="l" type="monotone" dataKey="energy" name="能耗(万tce)" stroke={CYAN} strokeWidth={2} dot={{ r: 3 }}>
                    <LabelList dataKey="energy" position="top" fontSize={9} fill={CYAN} fontWeight={600} />
                  </Line>
                  <Line yAxisId="r" type="monotone" dataKey="carbon" name="碳排(万tCO₂e)" stroke={GREEN} strokeWidth={2} dot={{ r: 3 }}>
                    <LabelList dataKey="carbon" position="bottom" fontSize={9} fill={GREEN} fontWeight={600} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-4 flex-1">
            <SectionTitle icon={Activity} title="国家级绿色工厂 · 历年新增" accent="cyan" />
            <div className="h-[200px]">
              <ResponsiveContainer>
                <BarChart data={NATION_YEAR} margin={{ top: 18, left: -20, right: 6, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" vertical={false} />
                  <XAxis dataKey="y" tick={{ fontSize: 10, fill: LABEL }} />
                  <YAxis tick={{ fontSize: 10, fill: LABEL }} />
                  <Tooltip />
                  <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                    {NATION_YEAR.map((_, i) => (
                      <Cell key={i} fill={`hsl(${189 - i * 5} 80% ${55 - i * 2}%)`} />
                    ))}
                    <LabelList dataKey="v" position="top" fontSize={11} fontWeight={700} fill={LABEL} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              累计 <span className="neon-text-cyan font-semibold">196 家</span> · 2024 年单年新增 <span className="neon-text-green font-semibold">55 家</span> 创历史新高
            </div>
          </div>

          <div className="glass-card p-4 flex-1">
            <SectionTitle icon={AlertTriangle} title="AI 异常预警" accent="green" />
            <div className="space-y-2">
              {ALERTS.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-white/50 border border-border/50">
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${a.level === "high" ? "bg-destructive" : a.level === "mid" ? "bg-warning" : "bg-info"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate text-slate-700">{a.site}</div>
                    <div className="text-[10px] text-slate-600">{a.msg}</div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-4">
          <SectionTitle icon={Activity} title="跨周期目标追踪 · 十三五 → 十四五 → 十五五" accent="cyan" />
          <div className="h-[260px]">
            <ResponsiveContainer>
              <AreaChart data={PLAN_TRACK} margin={{ top: 18, left: -10, right: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={GREEN} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={GREEN} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={CYAN} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={CYAN} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={VIOLET} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={VIOLET} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="g4" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={AMBER} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={AMBER} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" />
                <XAxis dataKey="phase" tick={{ fontSize: 10, fill: LABEL }} />
                <YAxis tick={{ fontSize: 10, fill: LABEL }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="工厂" stackId="1" stroke={GREEN} fill="url(#g1)">
                  <LabelList dataKey="工厂" position="top" fontSize={9} fill={LABEL} />
                </Area>
                <Area type="monotone" dataKey="供应链" stackId="1" stroke={CYAN} fill="url(#g2)" />
                <Area type="monotone" dataKey="设计产品" stackId="1" stroke={VIOLET} fill="url(#g3)" />
                <Area type="monotone" dataKey="园区" stackId="1" stroke={AMBER} fill="url(#g4)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            十五五区段为 AI 预测值（基于 2018–2025 时间序列 + 政策因子建模）
          </div>
        </div>

        <div className="glass-card glass-card-green p-4 flex flex-col">
          <SectionTitle icon={Brain} title="AI Agent 对话交互" accent="green" />
          <div className="flex-1 space-y-2 overflow-y-auto text-xs mb-2 min-h-[180px]">
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex-shrink-0 flex items-center justify-center">
                <Brain className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-white/60 rounded-lg p-2 leading-relaxed text-slate-700">
                您好，我是 <span className="font-semibold neon-text-green">能碳智能体</span>。当前覆盖 16 区 · 523 家市级绿色工厂 · 196 家国家级。试试问："汽车产业绿色化率？"
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <div className="bg-cyan-100/70 rounded-lg p-2 max-w-[80%] text-slate-700">
                嘉定区培育潜力 TOP10？
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex-shrink-0 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-white/60 rounded-lg p-2 leading-relaxed text-slate-700">
                嘉定区已有 72 家市级绿色工厂（汽车占比 38%）。AI 识别 10 家高潜：上汽乘用车、采埃孚、舍弗勒、博世汽车…评分 ≥ 78，建议优先纳入 2026 年市级培育库。
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="问问 AI Agent：如何优化本市绿色供应链协同效率？"
              className="h-9 text-xs bg-white/70 border-emerald-200"
            />
            <Button size="icon" className="h-9 w-9 bg-gradient-to-br from-cyan-500 to-emerald-500 hover:opacity-90">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
