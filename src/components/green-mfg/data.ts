// 绿色工厂（梯度培育）模块共享数据 / 类型

export type DeclarationStage = "区审批" | "市审批" | "已通过" | "培育中" | "已驳回";
export type DeclarationLevel = "市级绿色工厂" | "区级培育" | "申报中";

export interface DeclarationRecord {
  id: string;
  enterpriseName: string;
  creditCode: string;
  district: string;
  industry: string;
  industryType: "重点行业" | "非重点行业/通则";
  outputValue: number; // 产值（万元）
  batch: string; // 申报批次
  submitDate: string;
  stage: DeclarationStage;
  score: number; // 系统智能打分 0-100
  manualScore?: number; // 人工审核打分
  level: DeclarationLevel;
  reviewer?: string;
  comment?: string;
}

// 53 个重点行业（节选示例，实际可补齐）
export const KEY_INDUSTRIES = [
  "黑色金属冶炼", "有色金属冶炼", "化学原料", "化学纤维", "石油加工",
  "煤炭加工", "建材水泥", "造纸", "纺织印染", "汽车零部件",
  "电气机械", "电子专用设备", "医药制造", "食品加工", "橡胶塑料",
];

export const ALL_INDUSTRIES = [...KEY_INDUSTRIES, "其他（非重点/通则）"];

export const DECLARATION_BATCHES = [
  "2025年第二批",
  "2025年第一批",
  "2024年第二批",
  "2024年第一批",
];

export interface DynamicRecord {
  id: string;
  enterpriseName: string;
  creditCode: string;
  district: string;
  year: number;
  status: "待填报" | "已填报" | "已审核" | "已驳回";
  submitDate?: string;
  reviewer?: string;
  // 动态管理表关键字段
  energyConsumption?: number; // 综合能耗（吨标煤）
  carbonEmission?: number; // 碳排放（吨CO2）
  waterConsumption?: number; // 取水量（万吨）
  wasteRecycleRate?: number; // 固废综合利用率 %
  greenProductRatio?: number; // 绿色产品占比 %
  rdInvestRatio?: number; // 研发投入占比 %
}

export interface AuditFlowNode {
  stage: string;
  operator: string;
  time: string;
  result: "通过" | "驳回" | "提交" | "进入培育" | "待办";
  comment?: string;
}

export const MOCK_DECLARATIONS: DeclarationRecord[] = [
  {
    id: "GF-2025-001",
    enterpriseName: "上海宝武特种合金有限公司",
    creditCode: "91310000132198765X",
    district: "宝山区",
    industry: "黑色金属冶炼",
    industryType: "重点行业",
    outputValue: 128500,
    submitDate: "2025-09-12",
    stage: "市审批",
    score: 86,
    manualScore: 88,
    level: "申报中",
    reviewer: "李审核",
  },
  {
    id: "GF-2025-002",
    enterpriseName: "华域汽车电子有限公司",
    creditCode: "91310115MA1K38XYZ1",
    district: "浦东新区",
    industry: "汽车零部件",
    industryType: "重点行业",
    outputValue: 45600,
    submitDate: "2025-09-08",
    stage: "区审批",
    score: 79,
    level: "申报中",
  },
  {
    id: "GF-2025-003",
    enterpriseName: "申能电力设备股份有限公司",
    creditCode: "913100007896543210",
    district: "闵行区",
    industry: "电气机械",
    industryType: "非重点行业/通则",
    outputValue: 32000,
    submitDate: "2025-08-21",
    stage: "已通过",
    score: 92,
    manualScore: 94,
    level: "市级绿色工厂",
    reviewer: "王主任",
    comment: "各项指标均超基准线，颁发市级绿色工厂证书。",
  },
  {
    id: "GF-2025-004",
    enterpriseName: "上海石化化工新材料分公司",
    creditCode: "91310116MA1H23ABC4",
    district: "金山区",
    industry: "化学原料",
    industryType: "重点行业",
    outputValue: 89500,
    submitDate: "2025-08-15",
    stage: "培育中",
    score: 64,
    manualScore: 65,
    level: "区级培育",
    reviewer: "区生态局",
    comment: "能耗及水耗指标未达标，进入培育阶段。",
  },
  {
    id: "GF-2025-005",
    enterpriseName: "中微半导体设备(上海)股份有限公司",
    creditCode: "91310115MA1K0DEF56",
    district: "浦东新区",
    industry: "电子专用设备",
    industryType: "非重点行业/通则",
    outputValue: 67000,
    submitDate: "2025-09-20",
    stage: "已驳回",
    score: 58,
    level: "申报中",
    reviewer: "区生态局",
    comment: "材料缺失：缺少近三年能源审计报告。",
  },
];

export const MOCK_DYNAMIC: DynamicRecord[] = [
  {
    id: "DYN-2025-001",
    enterpriseName: "申能电力设备股份有限公司",
    creditCode: "913100007896543210",
    district: "闵行区",
    year: 2025,
    status: "已审核",
    submitDate: "2025-03-22",
    reviewer: "王主任",
    energyConsumption: 12450,
    carbonEmission: 28900,
    waterConsumption: 18.6,
    wasteRecycleRate: 96.5,
    greenProductRatio: 42.0,
    rdInvestRatio: 5.8,
  },
  {
    id: "DYN-2025-002",
    enterpriseName: "上海某绿色制造示范企业",
    creditCode: "91310115MA1AAAA001",
    district: "浦东新区",
    year: 2025,
    status: "已填报",
    submitDate: "2025-04-10",
    energyConsumption: 8230,
    carbonEmission: 19200,
    waterConsumption: 11.2,
    wasteRecycleRate: 91.0,
    greenProductRatio: 35.0,
    rdInvestRatio: 4.2,
  },
  {
    id: "DYN-2025-003",
    enterpriseName: "宝山区某市级绿色工厂",
    creditCode: "91310113MA1BBBB002",
    district: "宝山区",
    year: 2025,
    status: "待填报",
  },
  {
    id: "DYN-2025-004",
    enterpriseName: "金山区某市级绿色工厂",
    creditCode: "91310116MA1CCCC003",
    district: "金山区",
    year: 2025,
    status: "已驳回",
    submitDate: "2025-04-05",
    reviewer: "李审核",
    energyConsumption: 15600,
    carbonEmission: 35400,
    waterConsumption: 22.4,
    wasteRecycleRate: 78.0,
    greenProductRatio: 18.0,
    rdInvestRatio: 2.1,
  },
];

export const MOCK_AUDIT_FLOW: AuditFlowNode[] = [
  { stage: "企业提交", operator: "张工/企业填报员", time: "2025-09-12 10:24", result: "提交", comment: "已上传申报书及附件 12 份" },
  { stage: "系统智能打分", operator: "系统", time: "2025-09-12 10:25", result: "通过", comment: "综合得分 86 分，达到推荐线" },
  { stage: "区级审批", operator: "李审核/宝山区生态局", time: "2025-09-15 14:08", result: "通过", comment: "能耗、碳排、固废等核心指标达标，建议上报市级。" },
  { stage: "市级审批", operator: "—", time: "—", result: "待办" },
];

export const SCORE_DIMENSIONS = [
  { name: "能源管理", weight: 25, score: 22 },
  { name: "资源利用", weight: 20, score: 17 },
  { name: "环境排放", weight: 20, score: 18 },
  { name: "绿色产品", weight: 15, score: 12 },
  { name: "基础管理", weight: 10, score: 9 },
  { name: "技术创新", weight: 10, score: 8 },
];

export const DYNAMIC_FIELD_DEFS: Array<{
  key: keyof DynamicRecord;
  label: string;
  unit: string;
  baseline?: number;
  hint?: string;
}> = [
  { key: "energyConsumption", label: "综合能源消费量", unit: "吨标煤", baseline: 13000, hint: "年度全口径能源消费量（折标煤）" },
  { key: "carbonEmission", label: "二氧化碳排放总量", unit: "吨 CO₂", baseline: 30000 },
  { key: "waterConsumption", label: "新鲜水取水量", unit: "万吨", baseline: 20 },
  { key: "wasteRecycleRate", label: "工业固废综合利用率", unit: "%", baseline: 90, hint: "≥ 90% 视为达标" },
  { key: "greenProductRatio", label: "绿色产品产值占比", unit: "%", baseline: 30 },
  { key: "rdInvestRatio", label: "研发投入占营收比例", unit: "%", baseline: 3 },
];

export const stageBadgeClass = (stage: DeclarationStage) => {
  switch (stage) {
    case "已通过": return "border-success/40 bg-success/10 text-success";
    case "已驳回": return "border-destructive/40 bg-destructive/10 text-destructive";
    case "培育中": return "border-warning/40 bg-warning/10 text-warning";
    case "市审批":
    case "区审批": return "border-primary/40 bg-primary/10 text-primary";
    default: return "border-border";
  }
};

export const dynamicStatusClass = (s: DynamicRecord["status"]) => {
  switch (s) {
    case "已审核": return "border-success/40 bg-success/10 text-success";
    case "已驳回": return "border-destructive/40 bg-destructive/10 text-destructive";
    case "已填报": return "border-primary/40 bg-primary/10 text-primary";
    default: return "border-warning/40 bg-warning/10 text-warning";
  }
};
