// 绿色工厂（梯度培育）模块共享数据 / 类型

export type DeclarationStage = "填写中" | "待审核" | "已驳回" | "培育中" | "已完成";
export type DeclarationLevel = "市级绿色工厂" | "区级培育" | "审核推荐中";

export interface DeclarationRecord {
  id: string;
  enterpriseName: string;
  creditCode: string;
  district: string;
  industry: string;
  subIndustry?: string;
  industryType: "重点行业" | "非重点行业/通则";
  outputValue: number; // 产值（万元）
  batch: string; // 审核推荐批次
  submitDate: string;
  stage: DeclarationStage;
  score: number; // 系统智能打分 0-100
  manualScore?: number; // 专家审核
  level: DeclarationLevel;
  reviewer?: string;
  comment?: string;
}

// 8 大重点行业及细分行业 + 非重点行业（通则）
export const INDUSTRY_TREE: Array<{ name: string; type: "重点行业" | "非重点行业/通则"; children: string[] }> = [
  { name: "钢铁行业", type: "重点行业", children: ["长流程钢铁企业", "短流程钢铁企业", "铁合金", "焦化"] },
  { name: "石化化工行业", type: "重点行业", children: ["石油化工一体化企业", "精对苯二甲酸", "煤制烯烃", "烧碱", "纯碱", "钛白粉", "磷铵", "尿素", "黄磷", "电石", "涂料", "聚氯乙烯", "轮胎"] },
  { name: "有色行业", type: "重点行业", children: ["铜冶炼", "锌冶炼", "铅冶炼", "电解铝", "氧化铝", "工业硅"] },
  { name: "建材行业", type: "重点行业", children: ["水泥", "平板玻璃及制品", "建筑陶瓷", "卫生陶瓷"] },
  { name: "机械行业", type: "重点行业", children: ["汽车整车", "船舶", "铸造", "锅炉", "内燃机", "压缩机", "电机", "变压器", "电线电缆", "风电装备"] },
  { name: "轻工行业", type: "重点行业", children: ["家用电器", "日用陶瓷", "造纸", "皮革", "制糖"] },
  { name: "纺织行业", type: "重点行业", children: ["印染", "棉纺织", "色纺纱", "化学纤维"] },
  { name: "电子行业", type: "重点行业", children: ["光伏", "锂离子电池", "计算机", "印制电路板", "集成电路", "显示器件", "移动通信终端"] },
  { name: "非重点行业", type: "非重点行业/通则", children: ["通则"] },
];

export const KEY_INDUSTRIES = INDUSTRY_TREE.filter((i) => i.type === "重点行业").map((i) => i.name);
export const ALL_INDUSTRIES = INDUSTRY_TREE.map((i) => i.name);
export const ALL_SUB_INDUSTRIES = INDUSTRY_TREE.flatMap((i) => i.children);
export const getIndustryType = (industry: string): "重点行业" | "非重点行业/通则" =>
  INDUSTRY_TREE.find((i) => i.name === industry)?.type ?? "非重点行业/通则";
export const getSubIndustries = (industry: string): string[] =>
  INDUSTRY_TREE.find((i) => i.name === industry)?.children ?? [];

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
  score?: number; // 该环节最终评分（0-100）
  round?: number; // 第几轮（支持企业修改后再提交的循环）
  kind?: "submit" | "ai" | "expert" | "revise" | "incubate" | "done"; // 节点类别
}

export const MOCK_DECLARATIONS: DeclarationRecord[] = [
  {
    id: "GF-2025-001",
    enterpriseName: "上海宝武特种合金有限公司",
    creditCode: "91310000132198765X",
    district: "宝山区",
    industry: "钢铁行业",
    subIndustry: "短流程钢铁企业",
    industryType: "重点行业",
    outputValue: 128500,
    batch: "2025年第二批",
    submitDate: "2025-09-12",
    stage: "待审核",
    score: 86,
    manualScore: 88,
    level: "审核推荐中",
    reviewer: "李审核",
  },
  {
    id: "GF-2025-002",
    enterpriseName: "华域汽车电子有限公司",
    creditCode: "91310115MA1K38XYZ1",
    district: "浦东新区",
    industry: "机械行业",
    subIndustry: "汽车整车",
    industryType: "重点行业",
    outputValue: 45600,
    batch: "2025年第二批",
    submitDate: "2025-09-08",
    stage: "待审核",
    score: 79,
    level: "审核推荐中",
  },
  {
    id: "GF-2025-003",
    enterpriseName: "申能电力设备股份有限公司",
    creditCode: "913100007896543210",
    district: "闵行区",
    industry: "机械行业",
    subIndustry: "电机",
    industryType: "重点行业",
    outputValue: 32000,
    batch: "2025年第一批",
    submitDate: "2025-08-21",
    stage: "已完成",
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
    industry: "石化化工行业",
    subIndustry: "煤制烯烃",
    industryType: "重点行业",
    outputValue: 89500,
    batch: "2025年第一批",
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
    industry: "电子行业",
    subIndustry: "集成电路",
    industryType: "重点行业",
    outputValue: 67000,
    batch: "2025年第二批",
    submitDate: "2025-09-20",
    stage: "已驳回",
    score: 58,
    level: "审核推荐中",
    reviewer: "区生态局",
    comment: "材料缺失：缺少近三年能源审计报告。",
  },
  {
    id: "GF-2025-006",
    enterpriseName: "上海申华实业股份有限公司",
    creditCode: "91310115MA1K0DEF57",
    district: "普东新区",
    industry: "机械行业",
    subIndustry: "内燃机",
    industryType: "重点行业",
    outputValue: 42000,
    batch: "2025年第二批",
    submitDate: "2025-09-18",
    stage: "培育中",
    score: 62,
    level: "区级培育",
  },
  {
    id: "GF-2025-007",
    enterpriseName: "上海金联实业有限公司",
    creditCode: "91310115MA1K0DEF58",
    district: "金山区",
    industry: "石化化工行业",
    subIndustry: "涂料",
    industryType: "重点行业",
    outputValue: 38000,
    batch: "2025年第一批",
    submitDate: "2025-09-15",
    stage: "培育中",
    score: 60,
    level: "区级培育",
  },
  {
    id: "GF-2025-008",
    enterpriseName: "上海华测导航技术股份有限公司",
    creditCode: "91310115MA1K0DEF59",
    district: "青浦区",
    industry: "电子行业",
    subIndustry: "移动通信终端",
    industryType: "重点行业",
    outputValue: 51000,
    batch: "2025年第二批",
    submitDate: "2025-09-14",
    stage: "培育中",
    score: 65,
    level: "区级培育",
  },
  {
    id: "GF-2025-009",
    enterpriseName: "上海家化联合股份有限公司",
    creditCode: "91310115MA1K0DEF60",
    district: "青浦区",
    industry: "轻工行业",
    subIndustry: "日用陶瓷",
    industryType: "重点行业",
    outputValue: 46000,
    batch: "2025年第一批",
    submitDate: "2025-09-12",
    stage: "培育中",
    score: 61,
    level: "区级培育",
  },
  {
    id: "GF-2025-010",
    enterpriseName: "上海锦江国际(集团)有限公司",
    creditCode: "91310115MA1K0DEF61",
    district: "黄浦区",
    industry: "非重点行业",
    subIndustry: "通则",
    industryType: "非重点行业/通则",
    outputValue: 72000,
    batch: "2025年第二批",
    submitDate: "2025-09-10",
    stage: "培育中",
    score: 63,
    level: "区级培育",
  },
  {
    id: "GF-2025-011",
    enterpriseName: "上海百联集团股份有限公司",
    creditCode: "91310115MA1K0DEF62",
    district: "静安区",
    industry: "非重点行业",
    subIndustry: "通则",
    industryType: "非重点行业/通则",
    outputValue: 85000,
    batch: "2025年第一批",
    submitDate: "2025-09-08",
    stage: "培育中",
    score: 59,
    level: "区级培育",
  },
  {
    id: "GF-2025-012",
    enterpriseName: "上海建工集团股份有限公司",
    creditCode: "91310115MA1K0DEF63",
    district: "杨浦区",
    industry: "非重点行业",
    subIndustry: "通则",
    industryType: "非重点行业/通则",
    outputValue: 120000,
    batch: "2025年第二批",
    submitDate: "2025-09-05",
    stage: "培育中",
    score: 64,
    level: "区级培育",
  },
  {
    id: "GF-2025-013",
    enterpriseName: "上海城投(集团)有限公司",
    creditCode: "91310115MA1K0DEF64",
    district: "虹口区",
    industry: "非重点行业",
    subIndustry: "通则",
    industryType: "非重点行业/通则",
    outputValue: 98000,
    batch: "2025年第一批",
    submitDate: "2025-09-02",
    stage: "培育中",
    score: 62,
    level: "区级培育",
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
  // 第一轮：企业首次填写 → 智能打分 → 专家驳回
  { round: 1, kind: "submit", stage: "企业填写 · 提交", operator: "张工 / 企业填报员", time: "2025-09-12 10:24", result: "提交", comment: "已上传审核推荐书及附件 12 份。" },
  { round: 1, kind: "ai", stage: "系统智能打分", operator: "AI 评分引擎", time: "2025-09-12 10:25", result: "通过", score: 78, comment: "综合得分 78 分，达到推荐线；建议人工复核能耗与碳排数据。" },
  { round: 1, kind: "expert", stage: "专家审核", operator: "李审核 / 宝山区生态局", time: "2025-09-13 16:20", result: "驳回", score: 72, comment: "能源消耗强度证明材料缺失，碳排放强度核算口径存疑，请补充并修订后重新提交。" },
  // 第二轮：企业修改后再次提交 → 智能打分 → 专家通过 → 完成
  { round: 2, kind: "revise", stage: "企业修改 · 重新提交", operator: "张工 / 企业填报员", time: "2025-09-14 11:08", result: "提交", comment: "已按驳回意见补充近三年能源审计报告及碳排核算说明。" },
  { round: 2, kind: "ai", stage: "系统智能打分", operator: "AI 评分引擎", time: "2025-09-14 11:09", result: "通过", score: 86, comment: "综合得分 86 分，较上轮提升 8 分。" },
  { round: 2, kind: "expert", stage: "专家审核", operator: "李审核 / 宝山区生态局", time: "2025-09-15 14:08", result: "通过", score: 88, comment: "能耗、碳排、固废等核心指标达标，建议通过。" },
  { round: 2, kind: "done", stage: "完成 · 颁发证书", operator: "—", time: "—", result: "待办" },
];

// 打分维度：按一级指标（汇总二级指标分数）+ 二级指标名称组织
export interface ScoreL2Dim { name: string; weight: number; score: number; }
export interface ScoreL1Dim { name: string; weight: number; score: number; children: ScoreL2Dim[]; }

export const SCORE_DIMENSIONS: ScoreL1Dim[] = [
  {
    name: "能源低碳化", weight: 30, score: 26,
    children: [
      { name: "能源消耗强度", weight: 8, score: 7 },
      { name: "碳排放强度", weight: 8, score: 7 },
      { name: "可再生能源利用率", weight: 8, score: 7 },
      { name: "能碳管理系统平台功能符合数量", weight: 6, score: 5 },
    ],
  },
  {
    name: "资源高效化", weight: 22, score: 19,
    children: [
      { name: "节约原材料", weight: 0, score: 0 },
      { name: "取水强度", weight: 8, score: 7 },
      { name: "工业用水重复利用率", weight: 8, score: 7 },
      { name: "一般工业固体废物综合利用率", weight: 6, score: 5 },
    ],
  },
  {
    name: "生产洁净化", weight: 16, score: 14,
    children: [
      { name: "生产工艺设备先进性", weight: 6, score: 5 },
      { name: "绿色低碳改造升级", weight: 4, score: 3 },
      { name: "主要污染物年均排放浓度", weight: 6, score: 6 },
    ],
  },
  {
    name: "产品绿色化", weight: 16, score: 13,
    children: [
      { name: "绿色设计", weight: 8, score: 7 },
      { name: "产品碳足迹", weight: 8, score: 6 },
      { name: "绿色产品", weight: 0, score: 0 },
    ],
  },
  {
    name: "用地集约化", weight: 8, score: 7,
    children: [
      { name: "土地产出率", weight: 8, score: 7 },
    ],
  },
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
    case "已完成": return "border-success/40 bg-success/10 text-success";
    case "培育中": return "border-warning/40 bg-warning/10 text-warning";
    case "待审核": return "border-primary/40 bg-primary/10 text-primary";
    case "已驳回": return "border-destructive/40 bg-destructive/10 text-destructive";
    case "填写中": return "border-muted-foreground/40 bg-muted/40 text-muted-foreground";
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
