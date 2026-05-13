import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Brain,
  Factory,
  Leaf,
  Zap,
  Boxes,
  Layers,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  BarChart3,
  ListChecks,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
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

/* 政务风格统一色板：深绿主色 + 信息蓝辅色 + 中性灰 + 金色仅用于「国家级」勋章 */
const PRIMARY = "hsl(168 72% 21%)";       // 深绿 主色
const PRIMARY_SOFT = "hsl(168 50% 40%)";   // 中绿 辅
const INFO = "hsl(211 70% 45%)";           // 沉稳信息蓝
const AMBER = "hsl(38 80% 48%)";           // 国家级勋章
const SLATE = "hsl(215 28% 28%)";
const MUTED = "hsl(215 16% 55%)";
const LABEL = "hsl(215 25% 30%)";
// 兼容历史命名
const CYAN = INFO;
const GREEN = PRIMARY;
const TEAL = PRIMARY_SOFT;
const BLUE = INFO;
const VIOLET = INFO;
const ROSE = PRIMARY_SOFT;

/* ============== Real data ============== */
const KPI = {
  factory: { city: 523, nation: 196 },
  supply: { city: 75, nation: 17 },
  park: { city: 29, nation: 8 },
  product: { city: 150, nation: 67 },
};

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

// 各区县国家级绿色工厂数 TOP10（依据全市 196 家国家级按区分布估算）
const DISTRICT_NATION_TOP = [
  { name: "浦东新区", value: 45 },
  { name: "嘉定区", value: 30 },
  { name: "金山区", value: 28 },
  { name: "闵行区", value: 22 },
  { name: "松江区", value: 18 },
  { name: "宝山区", value: 16 },
  { name: "青浦区", value: 12 },
  { name: "奉贤区", value: 10 },
  { name: "化工区", value: 6 },
  { name: "临港新片区", value: 4 },
];

const KEY_ENERGY = [
  { name: "重点用能单位", value: 169, fill: CYAN },
  { name: "非重点单位", value: 357, fill: GREEN },
];

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

const STAR = [
  { name: "五星", value: 48, fill: AMBER },
  { name: "四星", value: 351, fill: CYAN },
  { name: "三星", value: 82, fill: GREEN },
];

// 培育梯度漏斗 — 增加区级
const FUNNEL = [
  { name: "培育库企业", value: 1280, fill: "hsl(189 85% 55%)", glow: "hsl(189 95% 65% / 0.55)" },
  { name: "区级培育", value: 820, fill: "hsl(180 78% 45%)", glow: "hsl(180 85% 55% / 0.55)" },
  { name: "市级绿色工厂", value: 523, fill: "hsl(168 72% 38%)", glow: "hsl(168 80% 48% / 0.55)" },
  { name: "国家级绿色工厂", value: 196, fill: "hsl(150 80% 28%)", glow: "hsl(40 95% 55% / 0.6)" },
];

const ENERGY_CARBON = [
  { y: "2020", energy: 11820, carbon: 1620 },
  { y: "2021", energy: 11420, carbon: 1540 },
  { y: "2022", energy: 10980, carbon: 1450 },
  { y: "2023", energy: 10520, carbon: 1360 },
  { y: "2024", energy: 10120, carbon: 1290 },
  { y: "2025", energy: 9860, carbon: 1240 },
];

const ALERTS = [
  { site: "宝山-钢铁产线 #3", level: "high", msg: "电耗较基线 +18.6%", time: "12:42" },
  { site: "嘉定-汽车涂装车间", level: "mid", msg: "天然气波动异常", time: "11:08" },
  { site: "金山-化工装置 A", level: "high", msg: "蒸汽消耗连续 3h 偏高", time: "09:55" },
  { site: "浦东-IDC 数据中心 #2", level: "low", msg: "PUE 趋势上行", time: "08:30" },
];

// 跨周期 — 全国绿色示范企业自评价情况（来自附件「全国绿色示范企业自评价情况」表）
const NATION_TRACK = [
  { y: "2016", 绿色工厂: 201, 绿色园区: 24, 绿色产品: 193, 绿色供应链: 15 },
  { y: "2017", 绿色工厂: 208, 绿色园区: 22, 绿色产品: 53, 绿色供应链: 4 },
  { y: "2018", 绿色工厂: 391, 绿色园区: 34, 绿色产品: 480, 绿色供应链: 21 },
  { y: "2019", 绿色工厂: 602, 绿色园区: 39, 绿色产品: 371, 绿色供应链: 50 },
  { y: "2020", 绿色工厂: 724, 绿色园区: 53, 绿色产品: 1074, 绿色供应链: 99 },
  { y: "2021", 绿色工厂: 662, 绿色园区: 52, 绿色产品: 989, 绿色供应链: 107 },
  { y: "2022", 绿色工厂: 874, 绿色园区: 47, 绿色产品: 643, 绿色供应链: 112 },
  { y: "2023", 绿色工厂: 1488, 绿色园区: 104, 绿色产品: 0, 绿色供应链: 205 },
  { y: "2024", 绿色工厂: 1382, 绿色园区: 123, 绿色产品: 0, 绿色供应链: 126 },
];

// 最近批次名单（从附件抽取）
const BATCH_LISTS = {
  city: {
    label: "市级 · 2025 年度第一批（75 家）",
    factories: [
      "上海电气电站设备有限公司上海发电机厂", "上海超硅半导体股份有限公司", "上海强生制药有限公司",
      "中微半导体（上海）有限公司", "上海安奕极企业发展股份有限公司", "上海申茂电磁线有限公司",
      "上海采日能源科技有限公司", "采埃孚汽车系统（上海）有限公司", "上海三菱电梯有限公司",
      "上海航天精密机械研究所", "上海电气燃气轮机有限公司", "上海凯赛生物技术股份有限公司",
    ],
    parks: ["浦东新区张江高科技园区", "金山第二工业区"],
    supply: ["上海复星医药产业发展有限公司", "上海普利特复合材料股份有限公司", "宝山钢铁股份有限公司"],
  },
  nation: {
    label: "国家级 · 2024 年度第九批（55 家工厂 / 5 家供应链 / 1 个园区）",
    factories: [
      "上海华谊新材料有限公司", "上海凯泉泵业（集团）有限公司", "格朗吉斯铝业（上海）有限公司",
      "上海欣峰制药有限公司", "上海申美饮料食品有限公司", "上海环云再生能源有限公司",
      "上海市建筑科学研究院科技发展有限公司", "上海晨光文具股份有限公司", "上海日立电器有限公司",
      "上海强生制药有限公司", "宝钢德盛不锈钢有限公司", "上海中船三井造船柴油机有限公司",
    ],
    parks: ["上海闵行经济技术开发区"],
    supply: ["迅达（中国）电梯有限公司", "上海电气集团上海电机厂有限公司", "正泰电气股份有限公司", "特斯拉（上海）有限公司", "上海思源高压开关有限公司"],
  },
};

/* ============== Components ============== */
function KpiTile({
  icon: Icon, label, value, unit, sub, nation, nationUnit, nationExtra, delta, variant = "cyan",
}: {
  icon: any; label: string; value: string; unit?: string; sub?: React.ReactNode;
  nation?: number; nationUnit?: string; nationExtra?: string;
  delta?: { v: number; label: string }; variant?: "cyan" | "green";
}) {
  return (
    <div className={`panel ${variant === "cyan" ? "panel-cyan" : "panel-green"} p-4 h-full flex flex-col`}>
      <div className="flex items-start justify-between">
        <div className="text-[13px] font-semibold text-slate-800 tracking-wide">{label}</div>
        <Icon className={`h-4 w-4 ${variant === "cyan" ? "text-primary" : "text-primary"}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-[32px] leading-none font-bold tabular-nums tracking-tight ${variant === "cyan" ? "text-primary" : "text-primary"}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-slate-600">{unit}</span>}
      </div>
      {nation !== undefined && (
        <div className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 bg-gradient-to-r from-amber-100/80 via-rose-100/70 to-amber-100/40 border border-amber-300/60 shadow-inner">
          <Trophy className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-[10px] font-semibold text-amber-800 tracking-wide border-0 whitespace-nowrap">国家级</span>
          <span className="text-[20px] font-extrabold tabular-nums text-amber-700 leading-none ml-0.5" style={{ textShadow: "0 0 10px hsl(35 95% 55% / 0.35)" }}>{nation}</span>
          <span className="text-[10px] text-amber-700/90">{nationUnit}</span>
          {nationExtra && <span className="ml-auto text-[10px] text-amber-700/80 font-medium text-right leading-tight break-words min-w-0">{nationExtra}</span>}
        </div>
      )}
      {sub && <div className="mt-auto pt-2 text-[11px] text-slate-600 leading-snug">{sub}</div>}
      {delta && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px]">
          {delta.v < 0 ? (
            <span className="inline-flex items-center gap-0.5 text-success">
              <TrendingDown className="h-3 w-3" />{Math.abs(delta.v)}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-destructive">
              <TrendingUp className="h-3 w-3" />{delta.v}%
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
      <Icon className={`h-4 w-4 ${accent === "cyan" ? "text-primary" : "text-primary"}`} />
      <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
      <div className={`flex-1 h-px ${accent === "cyan" ? "bg-gradient-to-r from-primary/30 to-transparent" : "bg-gradient-to-r from-primary/30 to-transparent"}`} />
      {right}
    </div>
  );
}

/* ============== Funnel — custom SVG, full-height, 4 stages, fully labeled ============== */
function GradientFunnel() {
  const stages = FUNNEL;
  const max = stages[0].value;
  const conv = (i: number) => i === 0 ? null : `${((stages[i].value / stages[i - 1].value) * 100).toFixed(1)}%`;
  return (
    <div className="flex-1 flex flex-col gap-2 min-h-0">
      {stages.map((s, i) => {
        const w = 30 + (s.value / max) * 70;
        const isNation = i === stages.length - 1;
        return (
          <div key={s.name} className="flex-1 flex items-center gap-2 min-h-0">
            <div className="w-[78px] flex items-center gap-1.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.fill, boxShadow: `0 0 8px ${s.fill}` }} />
              <span className="text-[11px] text-slate-700 font-medium leading-tight">{s.name}</span>
            </div>
            <div className="flex-1 relative h-full flex items-center">
              <div
                className="h-full rounded-md flex items-center justify-end pr-3 transition-all hover:brightness-110"
                style={{
                  width: `${w}%`,
                  backgroundColor: s.fill,
                  backgroundImage: `linear-gradient(90deg, hsl(0 0% 100% / 0.25), hsl(0 0% 100% / 0) 60%)`,
                  boxShadow: `0 0 16px ${s.glow}, inset 0 1px 0 hsl(0 0% 100% / 0.4)`,
                  border: isNation ? "1.5px solid hsl(40 95% 55% / 0.8)" : "none",
                }}
              >
                <span className="text-white font-bold text-[15px] tabular-nums" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}>
                  {s.value.toLocaleString()}
                </span>
              </div>
              {i > 0 && (
                <span className="ml-2 text-[10px] text-slate-500 whitespace-nowrap">↓ {((stages[i].value / stages[i - 1].value) * 100).toFixed(1)}%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============== Multi-dim distribution panel ============== */
function MultiDimPanel({ district, industry }: { district: string; industry: string }) {
  const [tab, setTab] = useState("district");
  const [showFactory, setShowFactory] = useState(true);
  const [showSupply, setShowSupply] = useState(true);
  const [showPark, setShowPark] = useState(true);
  const [batchTab, setBatchTab] = useState<"city" | "nation">("city");

  const tabsCfg = [
    { key: "district", label: "按区县" },
    { key: "industry36", label: "按 3+6 产业" },
    { key: "industry", label: "按行业" },
    { key: "group", label: "按集团" },
    { key: "energy", label: "按重点用能" },
  ];

  const filterChip = (district !== "全市" || industry !== "全部产业") && (
    <Badge className="h-5 px-2 text-[10px] bg-primary/10 text-primary border-0">
      已联动：{district !== "全市" ? district : ""}{district !== "全市" && industry !== "全部产业" ? " · " : ""}{industry !== "全部产业" ? industry : ""}
    </Badge>
  );

  const batch = BATCH_LISTS[batchTab];

  return (
    <div className="panel p-4 h-full flex flex-col gap-3">
      <SectionTitle
        icon={BarChart3}
        title="多维度分布分析 · 实时联动"
        accent="cyan"
        right={
          <div className="flex items-center gap-2">
            {filterChip}
            <Badge className="h-5 px-2 text-[10px] bg-muted text-foreground/80 border-0">523 工厂 · 75 供应链 · 29 园区</Badge>
          </div>
        }
      />
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col">
        <TabsList className="bg-white/60 backdrop-blur h-9 self-start">
          {tabsCfg.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="district" className="mt-3">
          <div className="flex items-center gap-4 mb-1 text-[11px]">
            <span className="text-slate-600 font-medium">显示：</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <Checkbox checked={showFactory} onCheckedChange={(v) => setShowFactory(!!v)} className="h-3.5 w-3.5" />
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: CYAN }} />绿色工厂</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <Checkbox checked={showSupply} onCheckedChange={(v) => setShowSupply(!!v)} className="h-3.5 w-3.5" />
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />绿色供应链</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <Checkbox checked={showPark} onCheckedChange={(v) => setShowPark(!!v)} className="h-3.5 w-3.5" />
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: AMBER }} />绿色园区</span>
            </label>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={DISTRICT_DATA} margin={{ top: 16, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: LABEL }} />
              <YAxis tick={{ fontSize: 10, fill: LABEL }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {showFactory && (
                <Bar dataKey="工厂" fill={CYAN} radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="工厂" position="top" fontSize={10} fill={LABEL} />
                </Bar>
              )}
              {showSupply && (
                <Bar dataKey="供应链" fill={GREEN} radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="供应链" position="top" fontSize={10} fill={LABEL} />
                </Bar>
              )}
              {showPark && (
                <Bar dataKey="园区" fill={AMBER} radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="园区" position="top" fontSize={10} fill={LABEL} />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="industry36" className="mt-3">
          <div className="flex items-center gap-3 mb-1 text-[11px]">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: VIOLET }} />三大先导产业</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />六大重点产业</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
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

        <TabsContent value="industry" className="mt-3">
          <ResponsiveContainer width="100%" height={260}>
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

        <TabsContent value="group" className="mt-3">
          <ResponsiveContainer width="100%" height={260}>
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

        <TabsContent value="energy" className="mt-3">
          <div className="grid grid-cols-2 gap-2 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Tooltip />
                <Pie data={KEY_ENERGY} dataKey="value" nameKey="name" innerRadius={38} outerRadius={68} paddingAngle={3}
                  label={({ name, value, percent }) => `${name} ${value} (${(percent * 100).toFixed(1)}%)`}
                  labelLine={{ stroke: SLATE }} style={{ fontSize: 10 }}>
                  {KEY_ENERGY.map((d, i) => (<Cell key={i} fill={d.fill} />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Tooltip />
                <Pie data={STAR} dataKey="value" nameKey="name" innerRadius={38} outerRadius={68} paddingAngle={3}
                  label={({ name, value, percent }) => `${name} ${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: SLATE }} style={{ fontSize: 10 }}>
                  {STAR.map((d, i) => (<Cell key={i} fill={d.fill} />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent batch lists */}
      <div className="border-t border-border pt-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <h4 className="text-[16px] font-bold text-slate-800 tracking-wide">最近批次入选名单</h4>
          <Tabs value={batchTab} onValueChange={(v) => setBatchTab(v as any)} className="ml-auto">
            <TabsList className="h-8 bg-white/60">
              <TabsTrigger value="city" className="text-[13px] h-7 px-3 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">市级</TabsTrigger>
              <TabsTrigger value="nation" className="text-[13px] h-7 px-3 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">国家级</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="text-[13px] font-semibold text-slate-700 mb-2 px-2 py-1 rounded-md bg-muted/40 border border-border">{batch.label}</div>
        <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
          {[
            { title: "绿色工厂", color: CYAN, items: batch.factories },
            { title: "绿色供应链", color: GREEN, items: batch.supply },
            { title: "绿色园区", color: AMBER, items: batch.parks },
          ].map((col) => (
            <div key={col.title} className="bg-white/60 rounded-md p-2.5 border border-border/40 flex flex-col min-h-0">
              <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-border/40">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: col.color, boxShadow: `0 0 6px ${col.color}` }} />
                <span className="text-[13px] font-bold text-slate-800">{col.title}</span>
                <span className="ml-auto text-[12px] font-semibold text-slate-600 px-1.5 rounded bg-slate-100">{col.items.length}</span>
              </div>
              <ul className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                {col.items.map((n, i) => (
                  <li key={i} className="text-[12px] text-slate-700 leading-snug flex gap-1.5">
                    <span className="text-slate-400 shrink-0">{i + 1}.</span>
                    <span className="break-all">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============== Page ============== */
const Index = () => {
  const [year, setYear] = useState("2025");
  const [district, setDistrict] = useState("全市");
  const [industry, setIndustry] = useState("全部产业");
  const navigate = useNavigate();

  const linkedSummary = useMemo(() => {
    const parts = [`年度 ${year}`];
    if (district !== "全市") parts.push(district);
    if (industry !== "全部产业") parts.push(industry);
    return parts.join(" · ");
  }, [year, district, industry]);

  return (
    <AppLayout hideHeader>
      {/* Title + filters */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-[26px] font-bold tracking-tight bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                上海市绿色制造体系能碳数智全景看板
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                数据来源：上海市绿色制造体系名单（2025.11） · AI 智能体驱动 · 一屏通览
                <span className="ml-2 inline-flex items-center gap-1 text-primary">
                  <span className="glow-dot" /> 实时联动：<span className="font-semibold">{linkedSummary}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="h-9 w-[120px] bg-white/70 backdrop-blur border-border text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{YEARS.map((y) => (<SelectItem key={y} value={y}>年度 {y}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="h-9 w-[140px] bg-white/70 backdrop-blur border-border text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{DISTRICTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="h-9 w-[160px] bg-white/70 backdrop-blur border-border text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map((i) => (<SelectItem key={i} value={i}>{i}</SelectItem>))}</SelectContent>
            </Select>
            {(district !== "全市" || industry !== "全部产业") && (
              <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => { setDistrict("全市"); setIndustry("全部产业"); }}>
                重置
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <KpiTile icon={Factory} label="绿色工厂" value="523" unit="家" nation={KPI.factory.nation} nationUnit="家" nationExtra="十四五完成率 104.6%" variant="green" />
        <KpiTile icon={Layers} label="绿色供应链管理企业" value="75" unit="家" nation={KPI.supply.nation} nationUnit="家" nationExtra="较上年 +12" variant="cyan" />
        <KpiTile icon={Boxes} label="绿色园区" value="29" unit="个" nation={KPI.park.nation} nationUnit="个" nationExtra="完成率 96.7%" variant="green" />
        <KpiTile icon={Leaf} label="绿色设计产品" value="150" unit="项" nation={KPI.product.nation} nationUnit="项" nationExtra="12 家示范企业" variant="cyan" />
        <KpiTile icon={Zap} label="单位 GDP 能耗" value="0.232" unit="tce/万元" delta={{ v: -4.2, label: "同比" }} sub="脱钩指数 0.83 · 持续强脱钩" variant="green" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Left col */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="panel p-4 flex flex-col" style={{ minHeight: 360 }}>
            <SectionTitle icon={Layers} title="梯度培育漏斗" accent="cyan" />
            <GradientFunnel />
            <div className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-border/40 leading-relaxed">
              培育→区级 <span className="text-primary font-semibold">64.1%</span> · 区级→市级 <span className="text-primary font-semibold">63.8%</span> · 市级→国家级 <span className="text-primary font-semibold">37.5%</span>
            </div>
          </div>

          <div className="panel p-4 flex-1">
            <SectionTitle icon={Trophy} title="重点集团绿色工厂数 TOP10" accent="green" />
            <div className="space-y-1.5">
              {GROUP_RANK.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2 text-xs">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${i < 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-slate-700">{g.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(g.value / 17) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono font-semibold text-primary">{g.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4 flex-1">
            <SectionTitle icon={Trophy} title="各区县国家级绿色工厂数 TOP10" accent="green" />
            <div className="space-y-1.5">
              {DISTRICT_NATION_TOP.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2 text-xs">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${i < 3 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-slate-700">{g.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${(g.value / 45) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono font-semibold text-amber-700">{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: multi-dim */}
        <div className="lg:col-span-6">
          <MultiDimPanel district={district} industry={industry} />
        </div>

        {/* Right col */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="panel p-4 flex-1">
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

          <div className="panel p-4 flex-1">
            <SectionTitle icon={Activity} title="国家级绿色工厂 · 历年新增" accent="cyan" />
            <div className="h-[200px]">
              <ResponsiveContainer>
                <BarChart data={[
                  { y: "2017", v: 4 }, { y: "2018", v: 8 }, { y: "2019", v: 16 }, { y: "2020", v: 28 },
                  { y: "2021", v: 23 }, { y: "2022", v: 29 }, { y: "2023", v: 37 }, { y: "2024", v: 55 },
                ]} margin={{ top: 18, left: -20, right: 6, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(180 30% 80% / 0.3)" vertical={false} />
                  <XAxis dataKey="y" tick={{ fontSize: 10, fill: LABEL }} />
                  <YAxis tick={{ fontSize: 10, fill: LABEL }} />
                  <Tooltip />
                  <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                    {[4,8,16,28,23,29,37,55].map((_, i) => (
                      <Cell key={i} fill={`hsl(${189 - i * 5} 80% ${55 - i * 2}%)`} />
                    ))}
                    <LabelList dataKey="v" position="top" fontSize={11} fontWeight={700} fill={LABEL} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              累计 <span className="text-primary font-semibold">196 家</span> · 2024 年单年新增 <span className="text-primary font-semibold">55 家</span> 创历史新高
            </div>
          </div>

          <div className="panel p-4 flex-1">
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
        <div className="lg:col-span-2 panel p-4">
          <SectionTitle
            icon={Activity}
            title="跨周期目标追踪 · 全国绿色示范企业历年自评价情况（2016-2024）"
            accent="cyan"
            right={
              <div className="flex items-center gap-3 text-[10px] text-slate-600">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: CYAN }} />绿色工厂</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: ROSE }} />绿色园区</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: GREEN }} />绿色产品</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: VIOLET }} />绿色供应链</span>
              </div>
            }
          />
          <div className="h-[280px]">
            <ResponsiveContainer>
              <LineChart data={NATION_TRACK} margin={{ top: 22, left: -10, right: 16, bottom: 0 }}>
                <CartesianGrid stroke="hsl(180 30% 80% / 0.35)" strokeDasharray="3 3" />
                <XAxis dataKey="y" tick={{ fontSize: 11, fill: LABEL, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10, fill: LABEL }} domain={[0, 1600]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="绿色工厂" stroke={CYAN} strokeWidth={2.5} dot={{ r: 5, fill: CYAN, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }}>
                  <LabelList dataKey="绿色工厂" position="top" fontSize={10} fontWeight={700} fill={CYAN} />
                </Line>
                <Line type="monotone" dataKey="绿色园区" stroke={ROSE} strokeWidth={2.5} dot={{ r: 5, fill: ROSE, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }}>
                  <LabelList dataKey="绿色园区" position="bottom" fontSize={10} fontWeight={600} fill={ROSE} />
                </Line>
                <Line type="monotone" dataKey="绿色产品" stroke={GREEN} strokeWidth={2.5} dot={{ r: 5, fill: GREEN, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} connectNulls={false}>
                  <LabelList dataKey="绿色产品" position="top" fontSize={10} fontWeight={600} fill={GREEN} formatter={(v: number) => v > 0 ? v : ""} />
                </Line>
                <Line type="monotone" dataKey="绿色供应链" stroke={VIOLET} strokeWidth={2.5} dot={{ r: 5, fill: VIOLET, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }}>
                  <LabelList dataKey="绿色供应链" position="bottom" fontSize={10} fontWeight={600} fill={VIOLET} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            数据源：附件「全国绿色示范企业自评价情况」表 · 累计：工厂 6,532，园区 498，产品 3,803，供应链 739
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/green-mfg-agent")}
          className="group relative overflow-hidden rounded-xl p-5 text-left flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 text-white shadow-xl ring-1 ring-cyan-400/20 hover:ring-cyan-400/60 transition"
        >
          <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-cyan-300" />
              </div>
              <span className="text-[11px] tracking-widest uppercase text-cyan-300/80">AI Agent</span>
            </div>
            <h3 className="mt-3 text-xl font-bold leading-tight flex items-center gap-2">
              绿色制造数字智能体
              <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            </h3>
            <p className="mt-2 text-[12px] text-slate-300 leading-relaxed">
              基于全市绿色制造体系数据，提供 <span className="text-cyan-300">企业潜力识别</span>、
              <span className="text-emerald-300">晋级路径分析</span> 与 <span className="text-amber-300">政策匹配</span>。
            </p>
          </div>

          <div className="relative mt-4 space-y-1.5">
            {[
              "嘉定区培育潜力 TOP10？",
              "汽车产业绿色化率？",
              "对比浦东与金山的体系完成度",
            ].map((q) => (
              <div key={q} className="flex items-center gap-2 text-[12px] text-slate-200/90 px-2.5 py-1.5 rounded-md bg-white/5 ring-1 ring-white/10">
                <MessageSquare className="h-3 w-3 text-cyan-300/80 shrink-0" />
                <span className="truncate">{q}</span>
              </div>
            ))}
          </div>

          <div className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 group-hover:gap-2.5 transition-all">
            进入 AI 对话
            <ArrowRight className="h-4 w-4" />
          </div>
        </button>
      </div>
    </AppLayout>
  );
};

export default Index;
