import type { LucideIcon } from "lucide-react";
import { Calculator, Factory, Flame, Fuel, Info, Leaf, PlugZap, ThermometerSun, TrendingUp, Wind } from "lucide-react";

export type ReportStatus = "未填报" | "待审核" | "已驳回" | "已通过";
export type FillStatus = "已填报" | "未填报" | "填报中";
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
  /** 是否重点用能企业 */
  keyEnterprise: boolean;
  /** 温报填报状态 */
  warmStatus: FillStatus;
  /** 节能指标月报填报状态 */
  quotaStatus: FillStatus;
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

const baseReports: MonthlyReport[] = [
  {
    name: "上海宝山钢铁股份有限公司",
    code: "913100001322830140",
    month: "2026-03",
    industry: "黑色金属冶炼",
    district: "宝山区",
    status: "待审核",
    keyEnterprise: true,
    warmStatus: "已填报",
    quotaStatus: "已填报",
    updatedAt: "2026-04-12 16:42",
    deadline: "2026-04-15",
    contact: "周立新 / 021-2664 8888",
    address: "上海市宝山区富锦路 885 号",
    annualQuota: 1280000,
    outputValue: 1852000,
    outputValueLast: 1688000,
    outputValueGrowth: 9.7,
    addedValue: 524000,
    addedValueLast: 482000,
    addedValueGrowth: 8.7,
    productOutput: 421000,
    productUnit: "吨钢",
    energy: [
      { name: "电力", unit: "万kWh", inputValue: 8365, equivalent: 25701, standard: 10282, yoy: 7.2 },
      { name: "原煤", unit: "吨", inputValue: 28600, equivalent: 20436, standard: 20436, yoy: 12.6 },
      { name: "天然气", unit: "万m³", inputValue: 1428, equivalent: 18491, standard: 18491, yoy: 5.1 },
      { name: "成品油", unit: "吨", inputValue: 2860, equivalent: 4176, standard: 4176, yoy: -3.4 },
      { name: "热力", unit: "百万千焦", inputValue: 38900, equivalent: 929, standard: 929, yoy: 15.4 },
    ],
    totalEquivalent: 128604,
    totalStandard: 102348,
    totalLast: 113686,
    unitOutputEnergy: 0.069,
    unitOutputEnergyLast: 0.067,
    totalYoy: 12.6,
    totalMom: 4.8,
    savingMeasure: "完成 4 号高炉余热回收升级与电机变频改造，本月节约标煤约 380 tce。",
  },
  {
    name: "上海石化股份有限公司",
    code: "91310000132206289K",
    month: "2026-03",
    industry: "石油化工",
    district: "金山区",
    status: "已通过",
    keyEnterprise: true,
    warmStatus: "已填报",
    quotaStatus: "已填报",
    updatedAt: "2026-04-10 09:18",
    deadline: "2026-04-15",
    contact: "王敏 / 021-5794 2424",
    address: "上海市金山区金一路 48 号",
    annualQuota: 2860000,
    outputValue: 4028000,
    outputValueLast: 3752000,
    outputValueGrowth: 7.4,
    addedValue: 1186000,
    addedValueLast: 1094000,
    addedValueGrowth: 8.4,
    productOutput: 960000,
    productUnit: "吨",
    energy: [
      { name: "电力", unit: "万kWh", inputValue: 14927, equivalent: 45869, standard: 18348, yoy: -4.2 },
      { name: "原煤", unit: "吨", inputValue: 71200, equivalent: 50865, standard: 50865, yoy: -8.4 },
      { name: "天然气", unit: "万m³", inputValue: 3182, equivalent: 41199, standard: 41199, yoy: -6.9 },
      { name: "成品油", unit: "吨", inputValue: 4680, equivalent: 6833, standard: 6833, yoy: 2.1 },
      { name: "热力", unit: "百万千焦", inputValue: 102800, equivalent: 2455, standard: 2455, yoy: -11.2 },
    ],
    totalEquivalent: 286402,
    totalStandard: 241186,
    totalLast: 263429,
    unitOutputEnergy: 0.071,
    unitOutputEnergyLast: 0.078,
    totalYoy: -8.4,
    totalMom: -2.7,
    savingMeasure: "完成裂解炉燃烧优化与蒸汽管网保温修复，减少热力损耗约 11.2%。",
  },
  {
    name: "上海华虹宏力半导体制造有限公司",
    code: "91310000631696384C",
    month: "2026-03",
    industry: "电子信息",
    district: "浦东新区",
    status: "已驳回",
    keyEnterprise: true,
    warmStatus: "填报中",
    quotaStatus: "已填报",
    updatedAt: "2026-04-11 14:03",
    deadline: "2026-04-15",
    contact: "陈静 / 021-3895 0000",
    address: "上海市浦东新区祖冲之路 1399 号",
    annualQuota: 96000,
    outputValue: 221600,
    outputValueLast: 198600,
    outputValueGrowth: 11.6,
    addedValue: 87600,
    addedValueLast: 72400,
    addedValueGrowth: 21,
    productOutput: 18300,
    productUnit: "万片",
    energy: [
      { name: "电力", unit: "万kWh", inputValue: 11902, equivalent: 36573, standard: 14629, yoy: 18.9 },
      { name: "原煤", unit: "吨", inputValue: 940, equivalent: 671, standard: 671, yoy: 0.8 },
      { name: "天然气", unit: "万m³", inputValue: 861, equivalent: 11151, standard: 11151, yoy: 12.2 },
      { name: "成品油", unit: "吨", inputValue: 110, equivalent: 161, standard: 161, yoy: 6.5 },
      { name: "热力", unit: "百万千焦", inputValue: 2260, equivalent: 54, standard: 54, yoy: 9.1 },
    ],
    totalEquivalent: 89407,
    totalStandard: 70125,
    totalLast: 58978,
    unitOutputEnergy: 0.403,
    unitOutputEnergyLast: 0.297,
    totalYoy: 18.9,
    totalMom: 6.2,
    savingMeasure: "高耗能清洗线尚未完成待机功率治理，需补充整改计划及佐证材料。",
  },
  {
    name: "上海振华重工(集团)股份有限公司",
    code: "91310000132207263R",
    month: "2026-03",
    industry: "装备制造",
    district: "长兴岛",
    status: "未填报",
    keyEnterprise: false,
    warmStatus: "未填报",
    quotaStatus: "未填报",
    updatedAt: "—",
    deadline: "2026-04-15",
    contact: "园区管委会 / 021-5839 0000",
    address: "上海市崇明区长兴岛江南大道 3261 号",
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
    totalLast: 6120,
    unitOutputEnergy: 0,
    unitOutputEnergyLast: 0.427,
    totalYoy: -100,
    totalMom: -100,
    savingMeasure: "本月尚未提交节能措施。",
  },
  {
    name: "上海大众汽车有限公司",
    code: "91310000607316563H",
    month: "2026-03",
    industry: "装备制造",
    district: "嘉定区",
    status: "已通过",
    keyEnterprise: true,
    warmStatus: "已填报",
    quotaStatus: "填报中",
    updatedAt: "2026-04-09 11:20",
    deadline: "2026-04-15",
    contact: "李伟 / 021-6952 8888",
    address: "上海市嘉定区安亭曹安公路 5288 号",
    annualQuota: 320000,
    outputValue: 685000,
    outputValueLast: 642000,
    outputValueGrowth: 6.7,
    addedValue: 198000,
    addedValueLast: 186000,
    addedValueGrowth: 6.5,
    productOutput: 86000,
    productUnit: "辆",
    energy: [
      { name: "电力", unit: "万kWh", inputValue: 4280, equivalent: 13140, standard: 5256, yoy: 3.2 },
      { name: "原煤", unit: "吨", inputValue: 1860, equivalent: 1329, standard: 1329, yoy: -2.1 },
      { name: "天然气", unit: "万m³", inputValue: 642, equivalent: 8316, standard: 8316, yoy: 1.8 },
      { name: "成品油", unit: "吨", inputValue: 380, equivalent: 555, standard: 555, yoy: -4.6 },
      { name: "热力", unit: "百万千焦", inputValue: 8200, equivalent: 196, standard: 196, yoy: 0.9 },
    ],
    totalEquivalent: 32156,
    totalStandard: 24852,
    totalLast: 31020,
    unitOutputEnergy: 0.047,
    unitOutputEnergyLast: 0.048,
    totalYoy: 3.7,
    totalMom: 1.2,
    savingMeasure: "推进涂装车间废气余热再利用改造，本月节约标煤约 86 tce。",
  },
  {
    name: "上海电气电站设备有限公司",
    code: "91310000132205864X",
    month: "2026-02",
    industry: "装备制造",
    district: "闵行区",
    status: "已通过",
    keyEnterprise: true,
    warmStatus: "已填报",
    quotaStatus: "已填报",
    updatedAt: "2026-03-12 10:08",
    deadline: "2026-03-15",
    contact: "赵强 / 021-2402 5000",
    address: "上海市闵行区江川路 1800 号",
    annualQuota: 156000,
    outputValue: 312000,
    outputValueLast: 298000,
    outputValueGrowth: 4.7,
    addedValue: 102000,
    addedValueLast: 96000,
    addedValueGrowth: 6.3,
    productOutput: 1280,
    productUnit: "台套",
    energy: [
      { name: "电力", unit: "万kWh", inputValue: 2186, equivalent: 6712, standard: 2685, yoy: -1.2 },
      { name: "原煤", unit: "吨", inputValue: 720, equivalent: 514, standard: 514, yoy: -3.5 },
      { name: "天然气", unit: "万m³", inputValue: 286, equivalent: 3705, standard: 3705, yoy: 0.6 },
      { name: "成品油", unit: "吨", inputValue: 142, equivalent: 207, standard: 207, yoy: -2.3 },
      { name: "热力", unit: "百万千焦", inputValue: 4120, equivalent: 98, standard: 98, yoy: 1.4 },
    ],
    totalEquivalent: 16432,
    totalStandard: 13228,
    totalLast: 16860,
    unitOutputEnergy: 0.053,
    unitOutputEnergyLast: 0.057,
    totalYoy: -2.5,
    totalMom: -0.8,
    savingMeasure: "完成总装车间空压系统集中改造，节约电量约 38 万kWh。",
  },
  {
    name: "上海家化联合股份有限公司",
    code: "91310000132207100E",
    month: "2026-02",
    industry: "日化轻工",
    district: "青浦区",
    status: "待审核",
    keyEnterprise: false,
    warmStatus: "已填报",
    quotaStatus: "未填报",
    updatedAt: "2026-03-13 15:46",
    deadline: "2026-03-15",
    contact: "孙琳 / 021-5172 1666",
    address: "上海市青浦区华青路 1018 号",
    annualQuota: 28000,
    outputValue: 92000,
    outputValueLast: 86000,
    outputValueGrowth: 7,
    addedValue: 36000,
    addedValueLast: 33000,
    addedValueGrowth: 9.1,
    productOutput: 86000,
    productUnit: "万件",
    energy: [
      { name: "电力", unit: "万kWh", inputValue: 386, equivalent: 1186, standard: 475, yoy: 4.5 },
      { name: "原煤", unit: "吨", inputValue: 0, equivalent: 0, standard: 0, yoy: 0 },
      { name: "天然气", unit: "万m³", inputValue: 86, equivalent: 1114, standard: 1114, yoy: 2.8 },
      { name: "成品油", unit: "吨", inputValue: 22, equivalent: 32, standard: 32, yoy: -1.2 },
      { name: "热力", unit: "百万千焦", inputValue: 620, equivalent: 15, standard: 15, yoy: 3.6 },
    ],
    totalEquivalent: 2347,
    totalStandard: 1636,
    totalLast: 2256,
    unitOutputEnergy: 0.026,
    unitOutputEnergyLast: 0.026,
    totalYoy: 4,
    totalMom: 1.5,
    savingMeasure: "推行 LED 照明改造和包装线变频升级。",
  },
];

// 为首家企业（宝山钢铁）补充更多月份的历史填报记录
const baoBase = baseReports[0];
const baoHistory: MonthlyReport[] = [
  { month: "2026-02", status: "已通过", warmStatus: "已填报", quotaStatus: "已填报", updatedAt: "2026-03-10 14:20", deadline: "2026-03-15", totalYoy: 8.4, totalMom: -2.1 },
  { month: "2026-01", status: "已通过", warmStatus: "已填报", quotaStatus: "已填报", updatedAt: "2026-02-09 11:05", deadline: "2026-02-15", totalYoy: 6.1, totalMom: 1.3 },
  { month: "2025-12", status: "已通过", warmStatus: "已填报", quotaStatus: "已填报", updatedAt: "2026-01-12 09:48", deadline: "2026-01-15", totalYoy: 5.5, totalMom: 3.6 },
  { month: "2025-11", status: "已驳回", warmStatus: "已填报", quotaStatus: "填报中", updatedAt: "2025-12-13 17:22", deadline: "2025-12-15", totalYoy: 4.2, totalMom: -1.8 },
  { month: "2025-10", status: "已通过", warmStatus: "已填报", quotaStatus: "已填报", updatedAt: "2025-11-11 10:33", deadline: "2025-11-15", totalYoy: 3.7, totalMom: 0.9 },
  { month: "2025-09", status: "未填报", warmStatus: "未填报", quotaStatus: "未填报", updatedAt: "—", deadline: "2025-10-15", totalYoy: 0, totalMom: 0 },
].map((p) => ({ ...baoBase, ...p }));

export const reports: MonthlyReport[] = [...baseReports, ...baoHistory];

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

export const fillStatusStyle: Record<FillStatus, string> = {
  已填报: "bg-success/15 text-success border-success/40",
  填报中: "bg-secondary/60 text-primary border-primary/30",
  未填报: "bg-muted text-muted-foreground border-border",
};

export const fillStatusDot: Record<FillStatus, string> = {
  已填报: "bg-success",
  填报中: "bg-primary",
  未填报: "bg-muted-foreground",
};

export const fieldLegend: Array<{ kind: FieldKind; label: string; className: string }> = [
  { kind: "input", label: "企业填报项", className: "border-success/40 bg-success/10 text-success" },
  { kind: "computed", label: "系统计算项", className: "border-primary/40 bg-primary/10 text-primary" },
];

export const trendIcon = TrendingUp;
