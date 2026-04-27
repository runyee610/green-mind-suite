// 月报全量详情 - "其他能源加工转换或有能源回收企业" 字段清单
// 严格按需求脑图：填报项 vs 系统计算项；今年累计 vs 去年累计 双维度；变化率 > 10% 高亮

export type EnergyVariety = {
  id: string;
  name: string;
  unit: string; // 计量单位（继承自企业基本信息-能源品种）
  /** 折标系数（等价值），来源：企业信息-能源品种 */
  coefEquivalent: number;
  /** 折标系数（当量值），来源：企业信息-能源品种 */
  coefStandard: number;
  /** 是否绿电/绿证/可再生能源（用于扣除计算） */
  isGreen?: boolean;
  /** 企业消费量 - 今年累计 */
  consumptionYTD: number;
  /** 企业消费量 - 去年同期累计 */
  consumptionYTDLast: number;
  /** 用于原材料 - 今年累计 */
  materialYTD: number;
  materialYTDLast: number;
  /** 今年非工业累计消费 */
  nonIndustrialYTD: number;
  nonIndustrialYTDLast: number;
  /** 外供量 - 今年累计 */
  outputYTD: number;
  outputYTDLast: number;
};

export type DetailReport = {
  /** 企业类型（顶部副标题展示） */
  enterpriseType: string;
  /** 能源品种明细（继承企业基本信息勾选） */
  energyVarieties: EnergyVariety[];
  /** 工业生产总值（万元） */
  industrialOutputYTD: number;
  industrialOutputYTDLast: number;
  /** 综合碳排放量（吨二氧化碳，选填） */
  carbonYTD?: number;
  carbonYTDLast?: number;
  /** 蒸汽综合能耗（等价值，tce） */
  steamEnergyYTD: number;
  steamEnergyYTDLast: number;
  /** 蒸汽产量（吨） */
  steamOutputYTD: number;
  steamOutputYTDLast: number;
};

// 演示用：默认能源品种集合（继承自企业基本信息）
const defaultVarieties: EnergyVariety[] = [
  {
    id: "elec",
    name: "电力",
    unit: "万kWh",
    coefEquivalent: 3.07,
    coefStandard: 1.229,
    consumptionYTD: 8365,
    consumptionYTDLast: 7802,
    materialYTD: 0,
    materialYTDLast: 0,
    nonIndustrialYTD: 120,
    nonIndustrialYTDLast: 110,
    outputYTD: 86,
    outputYTDLast: 72,
  },
  {
    id: "coal",
    name: "原煤",
    unit: "吨",
    coefEquivalent: 0.7143,
    coefStandard: 0.7143,
    consumptionYTD: 28600,
    consumptionYTDLast: 25400,
    materialYTD: 1200,
    materialYTDLast: 980,
    nonIndustrialYTD: 0,
    nonIndustrialYTDLast: 0,
    outputYTD: 0,
    outputYTDLast: 0,
  },
  {
    id: "gas",
    name: "天然气",
    unit: "万m³",
    coefEquivalent: 12.95,
    coefStandard: 12.95,
    consumptionYTD: 1428,
    consumptionYTDLast: 1359,
    materialYTD: 0,
    materialYTDLast: 0,
    nonIndustrialYTD: 22,
    nonIndustrialYTDLast: 20,
    outputYTD: 14,
    outputYTDLast: 11,
  },
  {
    id: "oil",
    name: "成品油",
    unit: "吨",
    coefEquivalent: 1.4571,
    coefStandard: 1.4571,
    consumptionYTD: 2860,
    consumptionYTDLast: 2961,
    materialYTD: 0,
    materialYTDLast: 0,
    nonIndustrialYTD: 0,
    nonIndustrialYTDLast: 0,
    outputYTD: 0,
    outputYTDLast: 0,
  },
  {
    id: "heat",
    name: "热力",
    unit: "百万千焦",
    coefEquivalent: 0.0341,
    coefStandard: 0.0341,
    consumptionYTD: 38900,
    consumptionYTDLast: 33700,
    materialYTD: 0,
    materialYTDLast: 0,
    nonIndustrialYTD: 0,
    nonIndustrialYTDLast: 0,
    outputYTD: 1860,
    outputYTDLast: 1620,
  },
  {
    id: "green",
    name: "绿电（含绿证/可再生能源）",
    unit: "万kWh",
    coefEquivalent: 3.07,
    coefStandard: 1.229,
    isGreen: true,
    consumptionYTD: 620,
    consumptionYTDLast: 410,
    materialYTD: 0,
    materialYTDLast: 0,
    nonIndustrialYTD: 0,
    nonIndustrialYTDLast: 0,
    outputYTD: 0,
    outputYTDLast: 0,
  },
];

export function buildDetailForReport(reportName: string): DetailReport {
  // 不同企业可有差异；演示用默认集合
  return {
    enterpriseType: "其他能源加工转换或有能源回收企业",
    energyVarieties: defaultVarieties.map((v) => ({ ...v })),
    industrialOutputYTD: 1852000,
    industrialOutputYTDLast: 1688000,
    carbonYTD: 286400,
    carbonYTDLast: 268900,
    steamEnergyYTD: 12800,
    steamEnergyYTDLast: 11900,
    steamOutputYTD: 482000,
    steamOutputYTDLast: 445000,
  };
}

// ===== 计算工具 =====
export const round = (n: number, digits = 2) => {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
};

/** 变化率 % = (今年 - 去年) / 去年 * 100 */
export const changeRate = (curr: number, last: number): number | null => {
  if (!last) return null;
  return round(((curr - last) / last) * 100, 2);
};

export const isAbnormal = (rate: number | null) => rate !== null && Math.abs(rate) > 10;

/** 合计（总量等价值）= sum(消费量 × 等价值折标系数) */
export const sumEquivalent = (list: EnergyVariety[], key: "consumptionYTD" | "consumptionYTDLast" | "outputYTD" | "outputYTDLast") =>
  list.reduce((acc, v) => acc + v[key] * v.coefEquivalent, 0);

export const sumStandard = (list: EnergyVariety[], key: "consumptionYTD" | "consumptionYTDLast" | "outputYTD" | "outputYTDLast") =>
  list.reduce((acc, v) => acc + v[key] * v.coefStandard, 0);

/** 绿电/绿证/可再生能源等价值合计 */
export const sumGreenEquivalent = (list: EnergyVariety[], key: "consumptionYTD" | "consumptionYTDLast") =>
  list.filter((v) => v.isGreen).reduce((acc, v) => acc + v[key] * v.coefEquivalent, 0);

export const sumGreenStandard = (list: EnergyVariety[], key: "consumptionYTD" | "consumptionYTDLast") =>
  list.filter((v) => v.isGreen).reduce((acc, v) => acc + v[key] * v.coefStandard, 0);
