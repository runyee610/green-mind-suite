import { useState } from "react";
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
  MapPin,
  Trophy,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
];
const INDUSTRIES = [
  "全部产业", "集成电路", "生物医药", "人工智能", "电子信息", "生命健康",
  "汽车", "高端装备", "先进材料", "时尚消费品", "数字创意",
];

const CYAN = "hsl(189 90% 45%)";
const GREEN = "hsl(155 70% 38%)";
const AMBER = "hsl(38 92% 50%)";
const SLATE = "hsl(215 28% 35%)";
const VIOLET = "hsl(265 70% 55%)";

/* ----------------- KPI ----------------- */
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
    <div className={`glass-card ${variant === "cyan" ? "glass-card-cyan" : "glass-card-green"} p-4`}>
      <div className="flex items-start justify-between">
        <div className="text-xs text-muted-foreground tracking-wider">{label}</div>
        <Icon className={`h-4 w-4 ${variant === "cyan" ? "neon-text-cyan" : "neon-text-green"}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-3xl font-bold tabular-nums tracking-tight ${variant === "cyan" ? "neon-text-cyan" : "neon-text-green"}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {sub && <div className="mt-1.5 text-[11px] text-muted-foreground">{sub}</div>}
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
          <span className="text-muted-foreground">{delta.label}</span>
        </div>
      )}
    </div>
  );
}

/* ----------------- Section title ----------------- */
function SectionTitle({ icon: Icon, title, accent }: { icon: any; title: string; accent: "cyan" | "green" }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`h-4 w-4 ${accent === "cyan" ? "neon-text-cyan" : "neon-text-green"}`} />
      <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
      <div className={`flex-1 h-px ${accent === "cyan" ? "bg-gradient-to-r from-cyan-400/50 to-transparent" : "bg-gradient-to-r from-emerald-400/50 to-transparent"}`} />
    </div>
  );
}

/* ----------------- Data ----------------- */
const funnelData = [
  { name: "培育库企业", value: 1280, fill: "hsl(189 85% 60%)" },
  { name: "市级绿色工厂", value: 523, fill: "hsl(168 70% 40%)" },
  { name: "国家级绿色工厂", value: 186, fill: "hsl(155 75% 30%)" },
];

const industryData = [
  { name: "集成电路", value: 92 },
  { name: "生物医药", value: 78 },
  { name: "人工智能", value: 64 },
  { name: "汽车", value: 118 },
  { name: "高端装备", value: 86 },
  { name: "先进材料", value: 54 },
  { name: "电子信息", value: 31 },
];

const keyUserData = [
  { name: "重点用能单位", value: 312, fill: CYAN },
  { name: "非重点单位", value: 211, fill: GREEN },
];

const energyCarbonData = [
  { y: "2020", energy: 11820, carbon: 1620 },
  { y: "2021", energy: 11420, carbon: 1540 },
  { y: "2022", energy: 10980, carbon: 1450 },
  { y: "2023", energy: 10520, carbon: 1360 },
  { y: "2024", energy: 10120, carbon: 1290 },
  { y: "2025", energy: 9860, carbon: 1240 },
];

const groupRank = [
  { name: "上汽集团", score: 96 },
  { name: "上海电气", score: 91 },
  { name: "宝武钢铁", score: 88 },
  { name: "华谊集团", score: 84 },
  { name: "中国商飞", score: 80 },
  { name: "光明食品", score: 75 },
];

const aiAlerts = [
  { site: "宝山-钢铁产线 #3", level: "high", msg: "电耗较基线 +18.6%", time: "12:42" },
  { site: "嘉定-汽车涂装车间", level: "mid", msg: "天然气波动异常", time: "11:08" },
  { site: "金山-化工装置 A", level: "high", msg: "蒸汽消耗连续 3h 偏高", time: "09:55" },
  { site: "浦东-数据中心 IDC-2", level: "low", msg: "PUE 趋势上行", time: "08:30" },
];

const planTrack = [
  { phase: "十三五·2018", 工厂: 120, 园区: 8, 供应链: 18, 设计产品: 42 },
  { phase: "十三五·2020", 工厂: 220, 园区: 14, 供应链: 32, 设计产品: 78 },
  { phase: "十四五·2022", 工厂: 360, 园区: 21, 供应链: 52, 设计产品: 110 },
  { phase: "十四五·2024", 工厂: 480, 园区: 27, 供应链: 70, 设计产品: 142 },
  { phase: "十四五·2025", 工厂: 523, 园区: 29, 供应链: 75, 设计产品: 150 },
  { phase: "十五五·2027(预)", 工厂: 720, 园区: 42, 供应链: 110, 设计产品: 220 },
  { phase: "十五五·2030(预)", 工厂: 1000, 园区: 60, 供应链: 160, 设计产品: 320 },
];

/* ----------------- Page ----------------- */
const Index = () => {
  const [year, setYear] = useState("2025");
  const [district, setDistrict] = useState("全市");
  const [industry, setIndustry] = useState("全部产业");
  const [aiInput, setAiInput] = useState("");

  return (
    <AppLayout hideHeader>
      {/* Title + filters */}
      <div className="mb-5">
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
              <p className="text-xs text-muted-foreground mt-1">
                AI 智能体驱动 · 一屏通览 · 决策支持平台 ·
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
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>年度 {y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="h-9 w-[140px] bg-white/70 backdrop-blur border-cyan-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISTRICTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="h-9 w-[160px] bg-white/70 backdrop-blur border-emerald-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">
        <KpiTile
          icon={Factory}
          label="绿色工厂"
          value="523"
          unit="家"
          sub="十四五完成率 104.6% · 十五五目标 1000 家"
          variant="green"
        />
        <KpiTile
          icon={Layers}
          label="绿色供应链管理企业"
          value="75"
          unit="家"
          sub="较上年 +12 家 · 国家级 28 家"
          variant="cyan"
        />
        <KpiTile
          icon={Boxes}
          label="绿色园区"
          value="29"
          unit="个"
          sub="十四五目标 30 · 完成率 96.7%"
          variant="green"
        />
        <KpiTile
          icon={Leaf}
          label="绿色设计产品"
          value="150"
          unit="项"
          sub="覆盖 12 个细分行业"
          variant="cyan"
        />
        <KpiTile
          icon={Zap}
          label="单位 GDP 能耗"
          value="0.232"
          unit="tce/万元"
          delta={{ v: -4.2, label: "同比" }}
          variant="green"
        />
      </div>

      {/* Three column main */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
        {/* Left */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-4">
            <SectionTitle icon={Layers} title="梯度培育趋势" accent="cyan" />
            <div className="h-[180px]">
              <ResponsiveContainer>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill={SLATE} stroke="none" dataKey="name" fontSize={11} />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={13} fontWeight={700} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              培育转化率 <span className="neon-text-cyan font-semibold">40.9%</span> · 国家级晋升率 <span className="neon-text-green font-semibold">35.6%</span>
            </div>
          </div>

          <div className="glass-card p-4">
            <SectionTitle icon={Factory} title='"3+6" 产业分布' accent="green" />
            <div className="h-[200px]">
              <ResponsiveContainer>
                <BarChart data={industryData} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: SLATE }} />
                  <YAxis dataKey="name" type="category" width={64} tick={{ fontSize: 10, fill: SLATE }} />
                  <Tooltip cursor={{ fill: "hsl(189 90% 90% / 0.4)" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {industryData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? CYAN : GREEN} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-4">
            <SectionTitle icon={Activity} title="重点用能单位画像" accent="cyan" />
            <div className="h-[170px]">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={keyUserData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {keyUserData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-muted-foreground text-center">
              重点用能单位占比 <span className="neon-text-cyan font-semibold">59.7%</span>
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-card glass-card-cyan p-4 relative overflow-hidden">
            <SectionTitle icon={MapPin} title="数字化空间地图 · 绿色工厂分布热力" accent="cyan" />
            <div className="relative h-[420px] rounded-lg overflow-hidden bg-gradient-to-br from-cyan-50/60 via-white/40 to-emerald-50/60 border border-cyan-200/40">
              {/* Stylized Shanghai map */}
              <svg viewBox="0 0 600 420" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="mapFill" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(189 85% 70%)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="hsl(155 70% 60%)" stopOpacity="0.25" />
                  </linearGradient>
                  <radialGradient id="hot" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(38 95% 55%)" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="hsl(38 95% 55%)" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="hotG" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(155 80% 50%)" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="hsl(155 80% 50%)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Outline (stylized Shanghai) */}
                <path
                  d="M180,70 C260,40 360,55 430,90 C490,120 520,170 510,230 C500,290 470,340 410,370 C340,400 260,395 200,370 C140,345 100,300 95,240 C90,170 120,100 180,70 Z"
                  fill="url(#mapFill)"
                  stroke="hsl(189 85% 50%)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* District lines */}
                <g stroke="hsl(189 50% 55% / 0.4)" strokeWidth="0.8" fill="none">
                  <path d="M180,70 L300,200 L410,370" />
                  <path d="M95,240 L300,200 L510,230" />
                  <path d="M260,55 L300,200 L260,395" />
                </g>
                {/* Heat zones */}
                <circle cx="380" cy="180" r="80" fill="url(#hotG)" />
                <circle cx="240" cy="160" r="65" fill="url(#hot)" />
                <circle cx="320" cy="300" r="55" fill="url(#hotG)" />
                <circle cx="180" cy="280" r="45" fill="url(#hot)" />
                {/* Plant dots */}
                {[
                  { x: 380, y: 180, n: "浦东", c: 142 },
                  { x: 240, y: 160, n: "嘉定", c: 96 },
                  { x: 180, y: 280, n: "松江", c: 78 },
                  { x: 320, y: 300, n: "闵行", c: 64 },
                  { x: 200, y: 200, n: "宝山", c: 58 },
                  { x: 290, y: 350, n: "金山", c: 42 },
                  { x: 430, y: 240, n: "奉贤", c: 35 },
                  { x: 280, y: 90, n: "崇明", c: 8 },
                ].map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="6" fill={CYAN} opacity="0.9">
                      <animate attributeName="r" values="5;9;5" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                    </circle>
                    <circle cx={p.x} cy={p.y} r="3" fill="white" />
                    <text x={p.x + 8} y={p.y - 6} fontSize="10" fill={SLATE} fontWeight="600">
                      {p.n} · {p.c}
                    </text>
                  </g>
                ))}
              </svg>

              {/* AI floating panel */}
              <div className="absolute right-3 bottom-3 max-w-[280px] glass-card glass-card-green p-3 text-xs">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Brain className="h-3.5 w-3.5 neon-text-green" />
                  <span className="font-semibold text-emerald-700">AI 智能解析</span>
                  <Badge className="ml-auto h-4 px-1.5 text-[9px] bg-emerald-100 text-emerald-700 border-0">实时</Badge>
                </div>
                <p className="text-[11px] leading-relaxed text-foreground/80">
                  当前 <span className="font-semibold text-emerald-700">嘉定区</span> 汽车产业绿色化率达 <span className="font-semibold neon-text-green">85%</span>，建议加大对高端装备领域 <span className="font-semibold">小巨人企业</span> 的培育力度；浦东 IC 产业链梯度成熟度领先全市。
                </p>
              </div>

              {/* Legend */}
              <div className="absolute left-3 top-3 glass-card p-2 text-[10px] flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: CYAN }} />绿色工厂</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />绿色园区</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: AMBER }} />热力浓度</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-4">
            <SectionTitle icon={Zap} title="能耗与碳排双控趋势" accent="green" />
            <div className="h-[200px]">
              <ResponsiveContainer>
                <LineChart data={energyCarbonData} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" />
                  <XAxis dataKey="y" tick={{ fontSize: 10, fill: SLATE }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 10, fill: CYAN }} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: GREEN }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line yAxisId="l" type="monotone" dataKey="energy" name="能耗(万tce)" stroke={CYAN} strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="r" type="monotone" dataKey="carbon" name="碳排(万tCO₂e)" stroke={GREEN} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-muted-foreground">
              脱钩指数 <span className="font-semibold neon-text-green">0.83</span> · 持续强脱钩
            </div>
          </div>

          <div className="glass-card p-4">
            <SectionTitle icon={Trophy} title="集团绿色指数排行" accent="cyan" />
            <div className="space-y-1.5">
              {groupRank.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2 text-xs">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${i < 3 ? "bg-gradient-to-br from-cyan-500 to-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{g.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-500"
                      style={{ width: `${g.score}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono font-semibold neon-text-cyan">{g.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <SectionTitle icon={AlertTriangle} title="AI 异常预警" accent="green" />
            <div className="space-y-2">
              {aiAlerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-white/50 border border-border/50">
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${a.level === "high" ? "bg-destructive" : a.level === "mid" ? "bg-warning" : "bg-info"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{a.site}</div>
                    <div className="text-[10px] text-muted-foreground">{a.msg}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{a.time}</span>
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
          <div className="h-[240px]">
            <ResponsiveContainer>
              <AreaChart data={planTrack} margin={{ left: -10, right: 10 }}>
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
                <XAxis dataKey="phase" tick={{ fontSize: 10, fill: SLATE }} />
                <YAxis tick={{ fontSize: 10, fill: SLATE }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="工厂" stackId="1" stroke={GREEN} fill="url(#g1)" />
                <Area type="monotone" dataKey="供应链" stackId="1" stroke={CYAN} fill="url(#g2)" />
                <Area type="monotone" dataKey="设计产品" stackId="1" stroke={VIOLET} fill="url(#g3)" />
                <Area type="monotone" dataKey="园区" stackId="1" stroke={AMBER} fill="url(#g4)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            虚线区段为 <span className="font-semibold neon-text-cyan">十五五</span> AI 预测值（基于 2018–2025 时间序列 + 政策因子建模）
          </div>
        </div>

        <div className="glass-card glass-card-green p-4 flex flex-col">
          <SectionTitle icon={Brain} title="AI Agent 对话交互" accent="green" />
          <div className="flex-1 space-y-2 overflow-y-auto text-xs mb-2 min-h-[150px]">
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex-shrink-0 flex items-center justify-center">
                <Brain className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-white/60 rounded-lg p-2 leading-relaxed text-foreground/85">
                您好，我是 <span className="font-semibold neon-text-green">能碳智能体</span>。当前看板覆盖 16 个行政区、523 家绿色工厂数据。试试问我："本市绿色供应链协同优化路径？"
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <div className="bg-cyan-100/70 rounded-lg p-2 max-w-[80%] text-foreground/85">
                嘉定区培育潜力 TOP10？
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex-shrink-0 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-white/60 rounded-lg p-2 leading-relaxed text-foreground/85">
                已识别 10 家：上汽乘用车、采埃孚转向、舍弗勒、博世汽车... 综合评分均 ≥ 78 分，建议优先纳入 2026 年市级培育库。
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
