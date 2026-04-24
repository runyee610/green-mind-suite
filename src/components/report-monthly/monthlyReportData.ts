import type { LucideIcon } from "lucide-react";
import { Calculator, Factory, Flame, Fuel, Info, Leaf, PlugZap, ThermometerSun, TrendingUp, Wind } from "lucide-react";

export type ReportStatus = "未填报" | "待审核" | "已驳回" | "已通过";
export type FieldKind = "input" | "computed";

export type EnergyItem = {
  name: string;
  unit: string;
  inputValue: number;
  equivalent: number;
  standard: number;
  yoy: number;
};

export type MonthlyReport = {
  name: string;
  code: string;
  month: string;
  industry: string;
  district: string;
  status: ReportStatus;
  updatedAt: string;
  deadline: string;
  contact: string;
  address: string;
  annualQuota: number;
  outputValue: number;
  outputValueLast: number;
  outputValueGrowth: number;
  addedValue: number;
  addedValueLast: number;
  addedValueGrowth: number;
  productOutput: number;
  productUnit: string;
  energy: EnergyItem[];
  totalEquivalent: number;
  totalStandard: number;
  totalLast: number;
  unitOutputEnergy: number;
  unitOutputEnergyLast: number;
  totalYoy: number;
  totalMom: number;
  savingMeasure: string;
};

export const energyIcons: Record<string, LucideIcon> = {
  电力: PlugZap,
  原煤: Flame,
  天然气: Wind,
  成品油: Fuel,
  热力: ThermometerSun,
};

export const sectionAnchors = [
  { id: "basic", label: "基础信息", icon: Info },
  { id: "output", label: "工业产值", icon: Factory },
  { id: "energy", label: "能源消费", icon: PlugZap },
  { id: "summary", label: "综合能耗", icon: Calculator },
  { id: "measures", label: "节能措施", icon: Leaf },
];

export const exportFields = ["基础字段", "工业产值字段", "电力明细", "原煤明细", "天然气明细", "成品油明细", "热力明细", "全量计算字段", "同比环比字段", "节能措施"];

export const reports: MonthlyReport[] = [
  {
    name: "华东精密制造有限公司",
    code: "91320100MA1Q8E2X7A",
    month: "2026-03",
    industry: "装备制造",
    district: "高新区",
    status: "待审核",
    updatedAt: "2026-04-12 16:42",
    deadline: "2026-04-15",
    contact: "周立新 / 025-8816 2048",
    address: "高新区智造大道 88 号",
    annualQuota: 128000,
    outputValue: 18520,
    outputValueLast: 16880,
    outputValueGrowth: 9.7,
    addedValue: 5240,
    addedValueLast: 4820,
    addedValueGrowth: 8.7,
    productOutput: 42100,
    productUnit: "台套",
    energy: [
      { name: "电力", unit: "万kWh", inputValue: 836.5, equivalent: 2570.1, standard: 1028.2, yoy: 7.2 },
      { name: "原煤", unit: "吨", inputValue: 2860, equivalent: 2043.6, standard: 2043.6, yoy: 12.6 },
      { name: "天然气", unit: "万m³", inputValue: 142.8, equivalent: 1849.1, standard: 1849.1, yoy: 5.1 },
      { name: "成品油", unit: "吨", inputValue: 286, equivalent: 417.6, standard: 417.6, yoy: -3.4 },
      { name: "热力", unit: "百万千焦", inputValue: 3890, equivalent: 92.9, standard: 92.9, yoy: 15.4 },
    ],
    totalEquivalent: 12860.4,
    totalStandard: 10234.8,
    totalLast: 9086,
    unitOutputEnergy: 0.552,
    unitOutputEnergyLast: 0.491,
    totalYoy: 12.6,
    totalMom: 4.8,
    savingMeasure: "完成空压站余热回收改造，变频电机替换 18 台；本月预计节约电量 12.4 万kWh，折合节约标准煤 38.1 tce。",
  },
  {
    name: "江北新材料集团",
    code: "91320191MA2B6F1L9C",
    month: "2026-03",
    industry: "化工新材料",
    district: "江北新区",
    status: "已通过",
    updatedAt: "2026-04-10 09:18",
    deadline: "2026-04-15",
    contact: "王敏 / 025-5821 7790",
    address: "江北新区新材料园 16 号",
    annualQuota: 286000,
    outputValue: 40280,
    outputValueLast: 37520,
    outputValueGrowth: 7.4,
    addedValue: 11860,
    addedValueLast: 10940,
    addedValueGrowth: 8.4,
    productOutput: 96000,
    productUnit: "吨",
    energy: [
      { name: "电力", unit: "万kWh", inputValue: 1492.7, equivalent: 4586.9, standard: 1834.8, yoy: -4.2 },
      { name: "原煤", unit: "吨", inputValue: 7120, equivalent: 5086.5, standard: 5086.5, yoy: -8.4 },
      { name: "天然气", unit: "万m³", inputValue: 318.2, equivalent: 4119.9, standard: 4119.9, yoy: -6.9 },
      { name: "成品油", unit: "吨", inputValue: 468, equivalent: 683.3, standard: 683.3, yoy: 2.1 },
      { name: "热力", unit: "百万千焦", inputValue: 10280, equivalent: 245.5, standard: 245.5, yoy: -11.2 },
    ],
    totalEquivalent: 28640.2,
    totalStandard: 24118.6,
    totalLast: 26342.9,
    unitOutputEnergy: 0.599,
    unitOutputEnergyLast: 0.702,
    totalYoy: -8.4,
    totalMom: -2.7,
    savingMeasure: "完成裂解炉燃烧优化和蒸汽管网保温修复，减少热力损耗。",
  },
  {
    name: "金陵电子材料股份有限公司",
    code: "91320115MA7C3N8K2D",
    month: "2026-03",
    industry: "电子信息",
    district: "雨花台区",
    status: "已驳回",
    updatedAt: "2026-04-11 14:03",
    deadline: "2026-04-15",
    contact: "陈静 / 025-5246 9811",
    address: "雨花台区软件谷南园 9 号",
    annualQuota: 96000,
    outputValue: 22160,
    outputValueLast: 19860,
    outputValueGrowth: 11.6,
    addedValue: 8760,
    addedValueLast: 7240,
    addedValueGrowth: 21,
    productOutput: 18300,
    productUnit: "万片",
    energy: [
      { name: "电力", unit: "万kWh", inputValue: 1190.2, equivalent: 3657.3, standard: 1462.9, yoy: 18.9 },
      { name: "原煤", unit: "吨", inputValue: 940, equivalent: 671.5, standard: 671.5, yoy: 0.8 },
      { name: "天然气", unit: "万m³", inputValue: 86.1, equivalent: 1115.1, standard: 1115.1, yoy: 12.2 },
      { name: "成品油", unit: "吨", inputValue: 110, equivalent: 160.6, standard: 160.6, yoy: 6.5 },
      { name: "热力", unit: "百万千焦", inputValue: 2260, equivalent: 54, standard: 54, yoy: 9.1 },
    ],
    totalEquivalent: 8940.7,
    totalStandard: 7012.5,
    totalLast: 5897.8,
    unitOutputEnergy: 0.316,
    unitOutputEnergyLast: 0.297,
    totalYoy: 18.9,
    totalMom: 6.2,
    savingMeasure: "部分高耗能清洗线尚未完成待机功率治理，需补充整改计划和佐证材料。",
  },
  {
    name: "浦口智能装备产业园",
    code: "91320111MA3E5R6T0P",
    month: "2026-03",
    industry: "装备制造",
    district: "浦口区",
    status: "未填报",
    updatedAt: "—",
    deadline: "2026-04-15",
    contact: "园区管委会 / 025-5880 1001",
    address: "浦口区桥林智能制造基地",
    annualQuota: 72000,
    outputValue: 0,
    outputValueLast: 14320,
    outputValueGrowth: -100,
    addedValue: 0,
    addedValueLast: 3860,
    addedValueGrowth: -100,
    productOutput: 0,
    productUnit: "台套",
    energy: ["电力", "原煤", "天然气", "成品油", "热力"].map((name) => ({ name, unit: name === "电力" ? "万kWh" : name === "天然气" ? "万m³" : name === "热力" ? "百万千焦" : "吨", inputValue: 0, equivalent: 0, standard: 0, yoy: 0 })),
    totalEquivalent: 0,
    totalStandard: 0,
    totalLast: 6120.4,
    unitOutputEnergy: 0,
    unitOutputEnergyLast: 0.427,
    totalYoy: -100,
    totalMom: -100,
    savingMeasure: "本月尚未提交节能措施。",
  },
];

export const statusStyle: Record<ReportStatus, string> = {
  未填报: "bg-muted text-muted-foreground border-border",
  待审核: "bg-warning/15 text-warning border-warning/40",
  已驳回: "bg-destructive/15 text-destructive border-destructive/40",
  已通过: "bg-success/15 text-success border-success/40",
};

export const statusDot: Record<ReportStatus, string> = {
  未填报: "bg-muted-foreground",
  待审核: "bg-warning",
  已驳回: "bg-destructive",
  已通过: "bg-success",
};

export const fieldLegend: Array<{ kind: FieldKind; label: string; className: string }> = [
  { kind: "input", label: "企业填报项", className: "border-success/40 bg-success/10 text-success" },
  { kind: "computed", label: "系统计算项", className: "border-primary/40 bg-primary/10 text-primary" },
];

export const trendIcon = TrendingUp;