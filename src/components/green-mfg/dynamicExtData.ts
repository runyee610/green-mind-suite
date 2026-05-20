// 动态管理扩展数据：绿色档案 + 风险预警
// 政府侧 / 企业侧 共享，通过 creditCode 实现信息联动

export interface ArchiveTimelineNode {
  date: string;
  type: "自评价" | "评价" | "动态填报" | "整改" | "证书" | "预警";
  title: string;
  detail?: string;
  result?: "通过" | "驳回" | "整改中" | "完成" | "提交" | "颁发";
  score?: number;
  // 触发方/责任方
  source?: "企业" | "AI 系统" | "区生态局" | "市生态局" | "专家组";
}

export interface GreenArchive {
  creditCode: string;
  enterpriseName: string;
  district: string;
  industry: string;
  // 档案档案核心信息
  certifyLevel: "市级绿色工厂" | "区级培育" | "自我评价中" | "未获评";
  certifyDate?: string; // 首次获评时间
  validUntil?: string;  // 证书有效期
  declarationCount: number;     // 累计自评价次数
  dynamicReportCount: number;   // 累计动态填报次数
  rectificationCount: number;   // 累计整改次数
  riskOpenCount: number;        // 当前未关闭预警数
  latestScore?: number;         // 最近一次综合得分
  // 历年关键指标趋势（按年）
  trend: Array<{
    year: number;
    energy?: number;        // 综合能耗（吨标煤）
    carbon?: number;        // 碳排放（吨CO₂）
    wasteRecycleRate?: number; // 固废利用率 %
    score?: number;         // 综合得分
  }>;
  // 时间轴
  timeline: ArchiveTimelineNode[];
}

export type RiskLevel = "高" | "中" | "低";
export type RiskCategory = "合规风险" | "评价短板" | "数据异常" | "材料缺失" | "证书到期";
export type RiskStatus = "待处置" | "已通知企业" | "整改中" | "已关闭";

export interface RiskWarning {
  id: string;
  creditCode: string;
  enterpriseName: string;
  district: string;
  category: RiskCategory;
  level: RiskLevel;
  title: string;
  detail: string;             // 风险详情
  trigger: string;            // 触发规则 / 算法依据
  source: "AI 算法" | "标准规则" | "人工录入";
  detectedAt: string;
  status: RiskStatus;
  suggestion: string;         // AI 处置建议
  // 联动：企业是否已读、整改备注
  entAck?: boolean;
  entRemark?: string;
}

// ========== Mock：绿色档案 ==========
export const MOCK_ARCHIVES: GreenArchive[] = [
  {
    creditCode: "913100007896543210",
    enterpriseName: "申能电力设备股份有限公司",
    district: "闵行区",
    industry: "机械行业",
    certifyLevel: "市级绿色工厂",
    certifyDate: "2024-12-20",
    validUntil: "2027-12-19",
    declarationCount: 2,
    dynamicReportCount: 2,
    rectificationCount: 1,
    riskOpenCount: 1,
    latestScore: 92,
    trend: [
      { year: 2023, energy: 13800, carbon: 31200, wasteRecycleRate: 92.0, score: 84 },
      { year: 2024, energy: 12950, carbon: 29700, wasteRecycleRate: 95.2, score: 90 },
      { year: 2025, energy: 12450, carbon: 28900, wasteRecycleRate: 96.5, score: 92 },
    ],
    timeline: [
      { date: "2025-09-12", type: "预警", title: "可再生能源利用率同比下降 3.2%", source: "AI 系统", result: "整改中" },
      { date: "2025-03-22", type: "动态填报", title: "2025 年度动态管理表已审核通过", source: "市生态局", result: "通过", score: 92 },
      { date: "2024-12-20", type: "证书", title: "颁发市级绿色工厂证书", source: "市生态局", result: "颁发" },
      { date: "2024-08-15", type: "评价", title: "市级专家组现场评价", source: "专家组", result: "通过", score: 90 },
      { date: "2024-06-08", type: "自评价", title: "提交 2024 年第一批自评价", source: "企业", result: "提交" },
    ],
  },
  {
    creditCode: "91310000132198765X",
    enterpriseName: "上海宝武特种合金有限公司",
    district: "宝山区",
    industry: "钢铁行业",
    certifyLevel: "自我评价中",
    declarationCount: 1,
    dynamicReportCount: 0,
    rectificationCount: 0,
    riskOpenCount: 2,
    latestScore: 86,
    trend: [
      { year: 2024, energy: 218000, carbon: 512000, wasteRecycleRate: 88.0, score: 78 },
      { year: 2025, energy: 205000, carbon: 489000, wasteRecycleRate: 91.2, score: 86 },
    ],
    timeline: [
      { date: "2025-09-15", type: "预警", title: "碳排放强度高于行业基准 8.4%", source: "AI 系统", result: "整改中" },
      { date: "2025-09-12", type: "自评价", title: "提交 2025 年第二批自评价", source: "企业", result: "提交", score: 86 },
      { date: "2025-09-15", type: "评价", title: "专家审核通过，建议通过", source: "区生态局", result: "通过", score: 88 },
    ],
  },
  {
    creditCode: "91310116MA1H23ABC4",
    enterpriseName: "上海石化化工新材料分公司",
    district: "金山区",
    industry: "石化化工行业",
    certifyLevel: "区级培育",
    declarationCount: 1,
    dynamicReportCount: 0,
    rectificationCount: 1,
    riskOpenCount: 3,
    latestScore: 64,
    trend: [
      { year: 2024, energy: 95000, carbon: 218000, wasteRecycleRate: 76.0, score: 58 },
      { year: 2025, energy: 92500, carbon: 210000, wasteRecycleRate: 79.0, score: 64 },
    ],
    timeline: [
      { date: "2025-08-20", type: "整改", title: "下达水耗、能耗整改通知", source: "区生态局", result: "整改中" },
      { date: "2025-08-15", type: "评价", title: "进入区级培育阶段", source: "区生态局", result: "通过", score: 64 },
    ],
  },
];

// ========== Mock：风险预警 ==========
export const MOCK_RISKS: RiskWarning[] = [
  {
    id: "RW-2025-101",
    creditCode: "913100007896543210",
    enterpriseName: "申能电力设备股份有限公司",
    district: "闵行区",
    category: "评价短板",
    level: "中",
    title: "可再生能源利用率同比下降 3.2%",
    detail: "2025 年 Q3 可再生能源利用率为 18.6%，较 2024 年同期下降 3.2 个百分点，已低于市级绿色工厂年度目标值（≥ 20%）。",
    trigger: "AI 时序异常检测：连续 2 个季度低于基准",
    source: "AI 算法",
    detectedAt: "2025-09-12",
    status: "整改中",
    suggestion: "建议补充屋顶光伏 1.5MW 并接入能碳平台，预计可恢复至 21.5%。",
    entAck: true,
    entRemark: "已立项启动屋顶光伏二期改造，预计 2025-12 投运。",
  },
  {
    id: "RW-2025-102",
    creditCode: "91310000132198765X",
    enterpriseName: "上海宝武特种合金有限公司",
    district: "宝山区",
    category: "合规风险",
    level: "高",
    title: "碳排放强度高于行业基准 8.4%",
    detail: "吨钢二氧化碳排放强度 1.92 t/t，高于钢铁短流程基准值 1.77 t/t；触发 GB/T 36132 中『能源低碳化』维度扣分。",
    trigger: "标准规则：碳排放强度 > 行业基准 5%",
    source: "标准规则",
    detectedAt: "2025-09-15",
    status: "已通知企业",
    suggestion: "建议优化电炉用能配比、提高废钢比；同步自评价市级绿色低碳改造资金。",
  },
  {
    id: "RW-2025-103",
    creditCode: "91310000132198765X",
    enterpriseName: "上海宝武特种合金有限公司",
    district: "宝山区",
    category: "材料缺失",
    level: "低",
    title: "缺少近三年第三方能源审计报告",
    detail: "自评价材料附件清单缺少 2023 年度能源审计报告 PDF。",
    trigger: "标准规则：必备材料完整性校验",
    source: "标准规则",
    detectedAt: "2025-09-13",
    status: "待处置",
    suggestion: "请于 2025-09-30 前补充上传扫描件，逾期将影响市级评审。",
  },
  {
    id: "RW-2025-104",
    creditCode: "91310116MA1H23ABC4",
    enterpriseName: "上海石化化工新材料分公司",
    district: "金山区",
    category: "数据异常",
    level: "高",
    title: "新鲜水取水量异常上升 22%",
    detail: "2025-Q2 取水量 28.7 万吨，环比上升 22%，超出合理波动区间（±10%）。",
    trigger: "AI 异常检测：环比波动 > 阈值",
    source: "AI 算法",
    detectedAt: "2025-08-22",
    status: "整改中",
    suggestion: "建议核查冷却循环水补水阀门、增加中水回用模块。",
    entAck: true,
    entRemark: "已联系工艺部门排查，初步定位为冷却塔补水阀失灵。",
  },
  {
    id: "RW-2025-105",
    creditCode: "91310116MA1H23ABC4",
    enterpriseName: "上海石化化工新材料分公司",
    district: "金山区",
    category: "评价短板",
    level: "中",
    title: "固废综合利用率低于绿色工厂基准 11%",
    detail: "2025 上半年固废综合利用率 79.0%，低于市级绿色工厂基准（≥ 90%）。",
    trigger: "标准规则：与基准对比",
    source: "标准规则",
    detectedAt: "2025-08-18",
    status: "已通知企业",
    suggestion: "建议接入区固废协同处置平台，重点提升废催化剂和废溶剂回用。",
  },
  {
    id: "RW-2025-106",
    creditCode: "91310116MA1H23ABC4",
    enterpriseName: "上海石化化工新材料分公司",
    district: "金山区",
    category: "证书到期",
    level: "低",
    title: "ISO 50001 能源管理体系证书将于 90 天后到期",
    detail: "现有证书有效期 2025-12-15，距到期 < 90 天。",
    trigger: "标准规则：证书有效期监控",
    source: "标准规则",
    detectedAt: "2025-09-15",
    status: "待处置",
    suggestion: "建议提前 60 天启动复审，避免影响动态管理评价。",
  },
];

export const riskLevelClass = (l: RiskLevel) => {
  switch (l) {
    case "高": return "border-destructive/40 bg-destructive/10 text-destructive";
    case "中": return "border-warning/40 bg-warning/10 text-warning";
    default: return "border-muted-foreground/30 bg-muted/40 text-muted-foreground";
  }
};

export const riskStatusClass = (s: RiskStatus) => {
  switch (s) {
    case "已关闭": return "border-success/40 bg-success/10 text-success";
    case "整改中": return "border-primary/40 bg-primary/10 text-primary";
    case "已通知企业": return "border-secondary/40 bg-secondary/10 text-secondary-foreground";
    default: return "border-warning/40 bg-warning/10 text-warning";
  }
};

export const certifyLevelClass = (l: GreenArchive["certifyLevel"]) => {
  switch (l) {
    case "市级绿色工厂": return "border-success/40 bg-success/10 text-success";
    case "区级培育": return "border-warning/40 bg-warning/10 text-warning";
    case "自我评价中": return "border-primary/40 bg-primary/10 text-primary";
    default: return "border-muted-foreground/30 bg-muted/40 text-muted-foreground";
  }
};
