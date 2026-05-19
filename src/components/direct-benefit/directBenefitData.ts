// 免审即享 - mock 数据层
// 每条 AI 产出物均附 source / generatedAt / confidence，便于 UI 透明化展示

export type SupportDomain = "工业节能技术改造" | "既有建筑节能改造" | "能耗在线监测建设";

export const domainStyle: Record<SupportDomain, { badge: string; dot: string }> = {
  "工业节能技术改造": { badge: "border-primary/40 bg-primary/10 text-primary", dot: "bg-primary" },
  "既有建筑节能改造": { badge: "border-info/40 bg-info/10 text-info", dot: "bg-info" },
  "能耗在线监测建设": { badge: "border-warning/40 bg-warning/10 text-warning", dot: "bg-warning" },
};

export type PolicySourceChannel = "市发改委" | "市经信委" | "市市场监管局" | "区发改委" | "区经信委" | "国家发改委";

export interface PolicyCondition {
  key: string;
  text: string;
  /** 取数字段说明（透明：让用户知道智能体从哪个表/字段判断） */
  dataField: string;
}

export interface Policy {
  id: string;
  name: string;
  issuer: PolicySourceChannel;
  domain: SupportDomain;
  /** 文号 */
  docNo: string;
  /** 资助金额区间（万元） */
  fundingMin: number;
  fundingMax: number;
  /** 计算口径 */
  fundingFormula: string;
  deadline: string;
  /** 政策原文链接（mock） */
  sourceUrl: string;
  /** 智能体抓取时间 */
  fetchedAt: string;
  /** 智能体解析置信度 0-1 */
  parseConfidence: number;
  /** 申报条件（结构化） */
  conditions: PolicyCondition[];
  /** 申报指引步骤 */
  guideSteps: string[];
  /** 政策摘要（智能体生成） */
  summary: string;
  /** 状态 */
  status: "已公示" | "推送中" | "已下架";
}

export const policies: Policy[] = [
  {
    id: "P-2025-001",
    name: "上海市产业绿色低碳转型专项资金（工业节能技改方向）",
    issuer: "市经信委",
    domain: "工业节能技术改造",
    docNo: "沪经信节〔2025〕12 号",
    fundingMin: 50,
    fundingMax: 500,
    fundingFormula: "按节能量 × 1000 元/吨标煤 测算，单项目最高 500 万元",
    deadline: "2025-12-31",
    sourceUrl: "https://www.sheitc.sh.gov.cn/...",
    fetchedAt: "2026-05-18 08:12",
    parseConfidence: 0.96,
    conditions: [
      { key: "energy_saving", text: "年节能量 ≥ 100 吨标准煤", dataField: "节能技改项目信息 · 节能量" },
      { key: "key_unit", text: "重点用能单位或规上工业企业", dataField: "企业基础档案 · 单位属性" },
      { key: "monthly_report", text: "近 12 个月节能月报完整填报", dataField: "经信委节能月报 · 提交记录" },
      { key: "no_violation", text: "近 3 年无重大节能违法记录", dataField: "市场监管局 · 行政处罚库" },
    ],
    guideSteps: [
      "智能体核对企业画像，自动命中条件 ✓",
      "企业登录确认企业基础信息与收款账户",
      "市经信委初审（系统自动通过）",
      "市财政局拨付至对公账户",
    ],
    summary: "聚焦工业领域节能技改项目，对完成且节能量达标的项目按节能量给予一次性补贴，无需企业撰写申报书。",
    status: "已公示",
  },
  {
    id: "P-2025-002",
    name: "既有公共建筑节能改造补贴",
    issuer: "市发改委",
    domain: "既有建筑节能改造",
    docNo: "沪发改环资〔2025〕27 号",
    fundingMin: 30,
    fundingMax: 300,
    fundingFormula: "按改造后单位面积能耗下降比例分档，最高 300 元/㎡",
    deadline: "2025-11-30",
    sourceUrl: "https://fgw.sh.gov.cn/...",
    fetchedAt: "2026-05-18 08:13",
    parseConfidence: 0.92,
    conditions: [
      { key: "area", text: "建筑面积 ≥ 5000 ㎡", dataField: "固定资产投资项目 · 建筑面积" },
      { key: "saving_rate", text: "改造后能耗下降 ≥ 15%", dataField: "能源利用报告 · 同比能耗" },
      { key: "online_meter", text: "已接入市能耗在线监测系统", dataField: "能耗监测平台 · 接入状态" },
    ],
    guideSteps: [
      "智能体核对建筑能耗下降数据",
      "企业确认基础信息及收款账户",
      "市发改委初审",
      "财政直达拨付",
    ],
    summary: "对既有公共建筑实施围护结构/机电系统改造、改造后能耗显著下降的项目给予补贴。",
    status: "已公示",
  },
  {
    id: "P-2025-003",
    name: "重点用能单位能耗在线监测建设补贴",
    issuer: "市经信委",
    domain: "能耗在线监测建设",
    docNo: "沪经信节〔2025〕18 号",
    fundingMin: 20,
    fundingMax: 80,
    fundingFormula: "按设备及实施费用 30% 补贴，单户上限 80 万元",
    deadline: "2026-06-30",
    sourceUrl: "https://www.sheitc.sh.gov.cn/...",
    fetchedAt: "2026-05-18 08:14",
    parseConfidence: 0.98,
    conditions: [
      { key: "key_unit", text: "纳入市重点用能单位名录", dataField: "企业基础档案 · 单位属性" },
      { key: "platform_connected", text: "完成市级能耗监测平台接入并稳定运行 ≥ 3 个月", dataField: "能耗监测平台 · 在线时长" },
      { key: "data_quality", text: "数据完整率 ≥ 95%", dataField: "能耗监测平台 · 数据质量分" },
    ],
    guideSteps: [
      "智能体核对接入状态与数据质量",
      "企业确认信息与收款账户",
      "市经信委初审",
      "资金拨付",
    ],
    summary: "支持重点用能单位完成市级能耗在线监测平台接入与设备建设，按实际投入分档补贴。",
    status: "推送中",
  },
  {
    id: "P-2025-004",
    name: "区级工业节能技改贴息（浦东专项）",
    issuer: "区发改委",
    domain: "工业节能技术改造",
    docNo: "浦发改〔2025〕5 号",
    fundingMin: 10,
    fundingMax: 150,
    fundingFormula: "贷款年化利率 50% 贴息，最长 2 年",
    deadline: "2025-10-15",
    sourceUrl: "https://www.pudong.gov.cn/...",
    fetchedAt: "2026-05-18 08:14",
    parseConfidence: 0.88,
    conditions: [
      { key: "district", text: "注册地在浦东新区", dataField: "企业基础档案 · 注册地址" },
      { key: "loan", text: "项目获得绿色贷款且实际放款", dataField: "金融机构数据 · 贷款合同" },
      { key: "saving", text: "年节能量 ≥ 50 吨标准煤", dataField: "节能技改项目信息 · 节能量" },
    ],
    guideSteps: ["智能体核对", "企业确认", "区发改初审", "区财政拨付"],
    summary: "对浦东新区内已获得绿色贷款的节能技改项目按贷款利息给予贴息支持。",
    status: "已公示",
  },
];

// ============ 企业画像（透明：每个维度标注来源 + 更新时间） ============

export interface ProfileFact {
  label: string;
  value: string;
  source: string;
  updatedAt: string;
}

export interface Enterprise {
  id: string;
  name: string;
  creditCode: string;
  district: string;
  industry: string;
  isKeyUnit: boolean;
  /** 画像维度 */
  profile: ProfileFact[];
  /** 收款账户 */
  bank: { name: string; account: string; verified: boolean };
}

export const enterprises: Enterprise[] = [
  {
    id: "E001",
    name: "上海绿能智造科技有限公司",
    creditCode: "91310115MA1H9X2A3B",
    district: "浦东新区",
    industry: "通用设备制造",
    isKeyUnit: true,
    bank: { name: "中国工商银行上海张江支行", account: "1001 2233 0900 *** 6688", verified: true },
    profile: [
      { label: "单位属性", value: "重点用能单位 / 规上工业", source: "企业基础档案", updatedAt: "2026-04-30" },
      { label: "近 12 月节能月报", value: "12/12 已完整填报", source: "经信委节能月报", updatedAt: "2026-05-10" },
      { label: "本年累计节能量", value: "186 吨标准煤", source: "节能技改项目信息", updatedAt: "2026-05-15" },
      { label: "在线监测接入", value: "已接入 · 数据完整率 98.2%", source: "能耗监测平台", updatedAt: "2026-05-18" },
      { label: "近 3 年节能违法", value: "无", source: "市场监管局处罚库", updatedAt: "2026-05-01" },
      { label: "温室气体排放", value: "1.23 万 tCO₂e（同比 -8%）", source: "温室气体排放报告", updatedAt: "2026-03-31" },
      { label: "绿色工厂自评", value: "已通过 / 87 分", source: "绿色工厂自我评价", updatedAt: "2026-02-20" },
    ],
  },
  {
    id: "E002",
    name: "上海申城节能建筑运营有限公司",
    creditCode: "91310101MA2K88B7XY",
    district: "黄浦区",
    industry: "物业管理",
    isKeyUnit: false,
    bank: { name: "上海银行人民广场支行", account: "0316 5500 1234 *** 9911", verified: true },
    profile: [
      { label: "管理建筑面积", value: "6,820 ㎡", source: "固定资产投资项目", updatedAt: "2026-01-15" },
      { label: "改造后单位面积能耗", value: "下降 18.6%", source: "能源利用报告", updatedAt: "2026-04-20" },
      { label: "在线监测接入", value: "已接入", source: "能耗监测平台", updatedAt: "2026-05-17" },
      { label: "节能月报", value: "12/12", source: "经信委节能月报", updatedAt: "2026-05-10" },
    ],
  },
  {
    id: "E003",
    name: "上海光华精密机械有限公司",
    creditCode: "91310120MA3K7P9N4C",
    district: "嘉定区",
    industry: "金属制品",
    isKeyUnit: true,
    bank: { name: "建设银行上海嘉定支行", account: "3105 0166 0801 *** 2055", verified: false },
    profile: [
      { label: "单位属性", value: "重点用能单位", source: "企业基础档案", updatedAt: "2026-04-30" },
      { label: "在线监测接入", value: "已接入 6 个月", source: "能耗监测平台", updatedAt: "2026-05-18" },
      { label: "数据完整率", value: "96.4%", source: "能耗监测平台", updatedAt: "2026-05-18" },
      { label: "节能月报", value: "11/12（4 月延迟）", source: "经信委节能月报", updatedAt: "2026-05-10" },
    ],
  },
];

// ============ 撮合记录 ============

export type MatchStatus = "待公示" | "已公示" | "已推送" | "企业已确认" | "已拨付" | "已驳回";

export const matchStatusStyle: Record<MatchStatus, { badge: string; dot: string }> = {
  "待公示": { badge: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", dot: "bg-muted-foreground" },
  "已公示": { badge: "border-info/40 bg-info/10 text-info", dot: "bg-info" },
  "已推送": { badge: "border-primary/40 bg-primary/10 text-primary", dot: "bg-primary" },
  "企业已确认": { badge: "border-warning/40 bg-warning/10 text-warning", dot: "bg-warning" },
  "已拨付": { badge: "border-success/40 bg-success/10 text-success", dot: "bg-success" },
  "已驳回": { badge: "border-destructive/40 bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

export interface ConditionMatch {
  conditionKey: string;
  hit: boolean;
  evidence: string;
}

export interface MatchRecord {
  id: string;
  enterpriseId: string;
  policyId: string;
  confidence: number;
  hits: ConditionMatch[];
  estimatedFunding: number;
  status: MatchStatus;
  generatedAt: string;
  /** 智能体的匹配理由（自然语言） */
  rationale: string;
}

export const matches: MatchRecord[] = [
  {
    id: "M001",
    enterpriseId: "E001",
    policyId: "P-2025-001",
    confidence: 0.95,
    estimatedFunding: 186,
    generatedAt: "2026-05-18 09:02",
    status: "已推送",
    rationale: "企业为重点用能单位且本年累计节能量达 186 吨标准煤，远超 100 吨门槛；节能月报完整、无违法记录，四项条件全部命中。",
    hits: [
      { conditionKey: "energy_saving", hit: true, evidence: "节能技改项目信息 · 186 吨标准煤 ≥ 100" },
      { conditionKey: "key_unit", hit: true, evidence: "企业基础档案 · 重点用能单位" },
      { conditionKey: "monthly_report", hit: true, evidence: "节能月报 · 12/12 已提交" },
      { conditionKey: "no_violation", hit: true, evidence: "市场监管局 · 无记录" },
    ],
  },
  {
    id: "M002",
    enterpriseId: "E002",
    policyId: "P-2025-002",
    confidence: 0.91,
    estimatedFunding: 122,
    generatedAt: "2026-05-18 09:03",
    status: "企业已确认",
    rationale: "建筑面积 6820㎡ 满足条件，能耗下降 18.6% 超过 15% 阈值，已接入市级在线监测系统。",
    hits: [
      { conditionKey: "area", hit: true, evidence: "固定资产投资项目 · 6820㎡" },
      { conditionKey: "saving_rate", hit: true, evidence: "能源利用报告 · -18.6%" },
      { conditionKey: "online_meter", hit: true, evidence: "能耗监测平台 · 已接入" },
    ],
  },
  {
    id: "M003",
    enterpriseId: "E003",
    policyId: "P-2025-003",
    confidence: 0.78,
    estimatedFunding: 48,
    generatedAt: "2026-05-18 09:04",
    status: "待公示",
    rationale: "在线监测已稳定运行 6 个月、数据完整率 96.4% 超过阈值；但节能月报 4 月延迟提交，建议人工复核后再公示。",
    hits: [
      { conditionKey: "key_unit", hit: true, evidence: "企业基础档案 · 重点用能单位" },
      { conditionKey: "platform_connected", hit: true, evidence: "在线监测 · 6 个月" },
      { conditionKey: "data_quality", hit: true, evidence: "数据完整率 · 96.4%" },
    ],
  },
  {
    id: "M004",
    enterpriseId: "E001",
    policyId: "P-2025-004",
    confidence: 0.62,
    estimatedFunding: 35,
    generatedAt: "2026-05-18 09:05",
    status: "待公示",
    rationale: "节能量满足条件、注册地在浦东，但暂未匹配到对应绿色贷款记录，置信度偏低。",
    hits: [
      { conditionKey: "district", hit: true, evidence: "企业基础档案 · 浦东新区" },
      { conditionKey: "loan", hit: false, evidence: "未匹配到绿色贷款合同" },
      { conditionKey: "saving", hit: true, evidence: "节能量 186 吨" },
    ],
  },
  {
    id: "M005",
    enterpriseId: "E001",
    policyId: "P-2025-003",
    confidence: 0.93,
    estimatedFunding: 62,
    generatedAt: "2026-05-18 09:05",
    status: "已拨付",
    rationale: "三项条件全部命中，企业已确认收款账户，资金已于 2026-05-16 拨付。",
    hits: [
      { conditionKey: "key_unit", hit: true, evidence: "重点用能单位" },
      { conditionKey: "platform_connected", hit: true, evidence: "稳定运行 14 个月" },
      { conditionKey: "data_quality", hit: true, evidence: "数据完整率 98.2%" },
    ],
  },
];

// ============ 资金拨付 ============

export type DisburseStage = "已核准" | "财政划拨中" | "已到账";

export interface Disbursement {
  id: string;
  matchId: string;
  enterpriseId: string;
  policyId: string;
  amount: number;
  stage: DisburseStage;
  /** 各阶段时间 */
  timeline: { stage: DisburseStage; time: string; operator: string }[];
  /** 凭证 PDF（mock） */
  voucherNo?: string;
}

export const disbursements: Disbursement[] = [
  {
    id: "D001",
    matchId: "M005",
    enterpriseId: "E001",
    policyId: "P-2025-003",
    amount: 62,
    stage: "已到账",
    voucherNo: "SH-CZ-2026-05-001138",
    timeline: [
      { stage: "已核准", time: "2026-05-14 14:20", operator: "免审即享智能体（系统初审）" },
      { stage: "财政划拨中", time: "2026-05-15 10:08", operator: "市财政局" },
      { stage: "已到账", time: "2026-05-16 09:32", operator: "工商银行上海张江支行" },
    ],
  },
  {
    id: "D002",
    matchId: "M002",
    enterpriseId: "E002",
    policyId: "P-2025-002",
    amount: 122,
    stage: "财政划拨中",
    timeline: [
      { stage: "已核准", time: "2026-05-17 11:00", operator: "免审即享智能体（系统初审）" },
      { stage: "财政划拨中", time: "2026-05-18 08:30", operator: "市财政局" },
    ],
  },
];

// ============ 智能体活动 Feed ============

export type AgentEventKind = "policy" | "profile" | "match" | "push" | "disburse";

export interface AgentEvent {
  id: string;
  kind: AgentEventKind;
  time: string;
  title: string;
  detail: string;
}

export const agentEvents: AgentEvent[] = [
  { id: "A1", kind: "policy", time: "2026-05-18 08:14", title: "识别 3 项新政策", detail: "来源：市经信委 / 市发改委 / 浦东发改委。已完成结构化解析，置信度 88%-98%。" },
  { id: "A2", kind: "profile", time: "2026-05-18 08:30", title: "更新 1,284 家企业画像", detail: "拉取节能月报、能耗限额、温室气体、绿色工厂等 7 类数据，刷新画像维度。" },
  { id: "A3", kind: "match", time: "2026-05-18 09:05", title: "新增 47 条政企匹配", detail: "其中高置信度（≥0.9）35 条，建议人工复核 12 条。" },
  { id: "A4", kind: "push", time: "2026-05-18 09:30", title: "点对点推送 23 家企业", detail: "通过站内信 + 短信触达，平均阅读时长 47s。" },
  { id: "A5", kind: "disburse", time: "2026-05-16 09:32", title: "资金到账 62 万元", detail: "上海绿能智造科技有限公司 - 能耗在线监测建设补贴。" },
];

// ============ 工作流步骤元数据（顶部状态条 / 工作台展开） ============

export interface WorkflowStep {
  key: "collect" | "profile" | "match" | "disburse";
  name: string;
  description: string;
  /** 数据来源 */
  sources: string[];
  /** 产出物 */
  outputs: string[];
  /** 可信度（0-1） */
  confidence: number;
  lastRunAt: string;
}

export const workflowSteps: WorkflowStep[] = [
  {
    key: "collect",
    name: "政策采集",
    description: "从市/区发改委、经信委、市场监管局等官方发布渠道抓取最新政策原文，并结构化解析申报条件、资助额度、计算口径。",
    sources: ["市经信委政策库", "市发改委公告", "市场监管局", "区级政府门户"],
    outputs: ["政策结构化条目", "申报条件清单", "资助额度计算公式"],
    confidence: 0.94,
    lastRunAt: "2026-05-18 08:14",
  },
  {
    key: "profile",
    name: "企业画像",
    description: "基于企业在本平台填报的节能月报、能源利用报告、温室气体排放报告、能耗限额、碳排放考核、绿色工厂自评、节能技改项目等 7 类数据，生成多维度画像。",
    sources: ["经信委节能月报", "能源利用报告", "温室气体排放报告", "能耗限额申报", "碳排放考核", "绿色工厂自评", "节能技改项目"],
    outputs: ["企业基础画像", "能源消耗画像", "合规画像"],
    confidence: 0.97,
    lastRunAt: "2026-05-18 08:30",
  },
  {
    key: "match",
    name: "智能匹配",
    description: "将政策申报条件与企业画像逐项比对，给出条件命中情况、资助额度估算与置信度评分；低置信度结果自动转人工复核。",
    sources: ["政策结构化条目", "企业画像"],
    outputs: ["政企匹配记录", "命中条件 ↔ 数据 对照表", "置信度评分"],
    confidence: 0.89,
    lastRunAt: "2026-05-18 09:05",
  },
  {
    key: "disburse",
    name: "确认与拨付",
    description: "企业仅需登录平台核对信息并确认收款账户，主管部门审核通过后由财政局直达拨付，全程留痕可追溯。",
    sources: ["企业确认结果", "财政拨付接口"],
    outputs: ["拨付指令", "资金到账凭证"],
    confidence: 1.0,
    lastRunAt: "2026-05-16 09:32",
  },
];

// ============ helpers ============

export const findPolicy = (id: string) => policies.find((p) => p.id === id);
export const findEnterprise = (id: string) => enterprises.find((e) => e.id === id);
export const findMatch = (id: string) => matches.find((m) => m.id === id);

/** 当前企业侧默认登录企业 */
export const CURRENT_ENTERPRISE_ID = "E001";

export const getEntMatches = (entId: string) => matches.filter((m) => m.enterpriseId === entId);
export const getEntDisbursements = (entId: string) => disbursements.filter((d) => d.enterpriseId === entId);
