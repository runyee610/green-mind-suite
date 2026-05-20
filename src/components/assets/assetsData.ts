export type LinkStatus = "已关联" | "待关联" | "待确认";
export type ProjectType = "新建" | "改建" | "扩建" | "迁建";
export type UnitNature = "央企" | "地方国企" | "民营企业" | "外资企业" | "其他";

export interface Contact {
  name: string;
  phone: string;
  email: string;
}

export interface ProjectAttachment {
  name: string;
  size: string; // 显示用，例：2.3 MB
  uploadedAt: string; // YYYY-MM-DD
  type: "pdf" | "doc" | "docx";
}

export interface InvestmentProject {
  // 重点
  id: string;
  name: string;
  contact: string; // 中心对口人
  linkStatus: LinkStatus;
  linkedEnterpriseName?: string;
  linkedCreditCode?: string;
  // 现场检查
  onSiteCheck: boolean;
  onSiteCheckYear?: string;
  hasIssue: boolean;
  issueDetail?: string;
  // 附件
  attachments: ProjectAttachment[];
  // 能耗
  approvedEnergy: number; // 批复年综合能耗（等价值，吨标煤）
  collectedEnergy: number; // 采集综合能耗（等价值）
  collectedUpdatedAt: string; // 采集综合能耗更新时间（YYYY-MM-DD）
  lastYearCollectedEnergy: number; // 上一年度采集综合能耗（等价值，吨标煤）
  actualSavingTce: number; // 2025 实际节能量（万吨标煤）
  actualSavingKwh: number; // 2025 实际节电量（万千瓦时）
  remainingSaving: number; // 剩余可用节能量（万吨标煤）
  // 项目次要
  district: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
  investment: number; // 投资总额（万元）
  projectContact: Contact;
  projectType: ProjectType;
  buildingContent: string;
  energyReviewDoc: string;
  eiaReviewDoc: string;
  remark: string;
  // 单位
  unitName: string;
  creditCode: string;
  industry: string;
  industryCode: string;
  unitNature: UnitNature;
  unitContact: Contact;
}

export const districts = ["浦东新区", "黄浦区", "徐汇区", "宝山区", "嘉定区", "闵行区"];
export const contacts = ["叶倩萌", "王志远", "陈晓琳", "李建国", "周慧敏"];

export const projects: InvestmentProject[] = [
  {
    id: "GTZ-2025-001",
    name: "宝钢电炉短流程炼钢节能改造项目",
    contact: "叶倩萌",
    linkStatus: "已关联",
    linkedEnterpriseName: "宝山钢铁股份有限公司",
    linkedCreditCode: "913100006072120631",
    approvedEnergy: 128000,
    collectedEnergy: 121580,
    collectedUpdatedAt: "2026-06-30",
    lastYearCollectedEnergy: 119580,
    actualSavingTce: 0.86,
    actualSavingKwh: 4520.5,
    remainingSaving: 0.64,
onSiteCheck: true,
    onSiteCheckYear: "2025",
    hasIssue: true,
    issueDetail: "电炉除尘设施部分时段未达标排放，已责令限期整改。",
    attachments: [
      { name: "节能审查批复文件.pdf", size: "2.4 MB", uploadedAt: "2024-02-20", type: "pdf" },
      { name: "能源管控平台方案.docx", size: "1.1 MB", uploadedAt: "2024-05-10", type: "docx" },
      { name: "现场检查记录.pdf", size: "860 KB", uploadedAt: "2025-08-15", type: "pdf" },
    ],
    district: "宝山区",
    startDate: "2024-03",
    endDate: "2025-12",
    investment: 186500,
    projectContact: { name: "孙立军", phone: "13901234567", email: "sunlj@baosteel.com" },
    projectType: "改建",
    buildingContent: "新建 150t 电炉 1 座，配套二次除尘、连铸连轧机组及智能能源管控平台。",
    energyReviewDoc: "沪发改环资节〔2024〕38 号 / 2024-02-18",
    eiaReviewDoc: "沪环保许字〔2024〕021 号 / 2024-01-26",
    remark: "纳入市级重点节能项目库，季度跟踪。",
    unitName: "宝山钢铁股份有限公司",
    creditCode: "913100006072120631",
    industry: "黑色金属冶炼及压延加工业",
    industryCode: "C31",
    unitNature: "央企",
    unitContact: { name: "韩雪松", phone: "021-26649999", email: "contact@baosteel.com" },
  },
  {
    id: "GTZ-2025-002",
    name: "上海石化乙烯装置余热回收技改",
    contact: "王志远",
    linkStatus: "已关联",
    linkedEnterpriseName: "中国石化上海石油化工股份有限公司",
    linkedCreditCode: "91310000132211457X",
    approvedEnergy: 96000,
    collectedEnergy: 102350,
    collectedUpdatedAt: "2026-06-30",
    lastYearCollectedEnergy: 100350,
    actualSavingTce: 1.12,
    actualSavingKwh: 6120.0,
    remainingSaving: -0.18,
onSiteCheck: true,
    onSiteCheckYear: "2024",
    hasIssue: false,
    issueDetail: "",
    attachments: [
      { name: "余热回收技改方案.pdf", size: "3.2 MB", uploadedAt: "2023-07-10", type: "pdf" },
      { name: "节能审查批复.pdf", size: "1.8 MB", uploadedAt: "2023-07-04", type: "pdf" },
    ],
    district: "金山区",
    startDate: "2023-09",
    endDate: "2025-06",
    investment: 92000,
    projectContact: { name: "黄启明", phone: "13701112233", email: "huangqm@sinopec.com" },
    projectType: "改建",
    buildingContent: "对乙烯裂解炉烟气余热进行梯级回收，新增 4 台 SHA 余热锅炉。",
    energyReviewDoc: "沪发改环资节〔2023〕112 号 / 2023-07-04",
    eiaReviewDoc: "沪环保许字〔2023〕086 号 / 2023-06-12",
    remark: "采集能耗已超批复，需要发起复核流程。",
    unitName: "中国石化上海石油化工股份有限公司",
    creditCode: "91310000132211457X",
    industry: "石油加工、炼焦及核燃料加工业",
    industryCode: "C25",
    unitNature: "央企",
    unitContact: { name: "陆芳", phone: "021-57943000", email: "office@spc.sinopec.com" },
  },
  {
    id: "GTZ-2025-003",
    name: "华谊精细化工低碳工艺示范线",
    contact: "陈晓琳",
    linkStatus: "待关联",
    approvedEnergy: 45000,
    collectedEnergy: 0,
    collectedUpdatedAt: "2026-06-30",
    lastYearCollectedEnergy: 0,
    actualSavingTce: 0,
    actualSavingKwh: 0,
    remainingSaving: 0.42,
onSiteCheck: false,
    onSiteCheckYear: undefined,
    hasIssue: false,
    issueDetail: "",
    attachments: [
      { name: "低碳示范线建设方案.docx", size: "2.0 MB", uploadedAt: "2025-03-12", type: "docx" },
    ],
    district: "浦东新区",
    startDate: "2025-04",
    endDate: "2026-12",
    investment: 58600,
    projectContact: { name: "汪建宇", phone: "13601239988", email: "wangjy@huayi.com" },
    projectType: "新建",
    buildingContent: "新建年产 5 万吨甲基丙烯酸甲酯（MMA）低碳示范线，配套蒸汽自给及绿电直供。",
    energyReviewDoc: "沪发改环资节〔2025〕014 号 / 2025-03-09",
    eiaReviewDoc: "沪环保许字〔2025〕007 号 / 2025-02-22",
    remark: "信用代码在能碳平台无记录，需手动确认。",
    unitName: "上海华谊新材料有限公司",
    creditCode: "91310115MA1H8GBC2D",
    industry: "化学原料和化学制品制造业",
    industryCode: "C26",
    unitNature: "地方国企",
    unitContact: { name: "周敏", phone: "021-50313888", email: "info@huayi-nm.com" },
  },
  {
    id: "GTZ-2025-004",
    name: "上汽乘用车临港新能源整车扩能项目",
    contact: "叶倩萌",
    linkStatus: "已关联",
    linkedEnterpriseName: "上海汽车集团股份有限公司乘用车分公司",
    linkedCreditCode: "913101157776100068",
    approvedEnergy: 62000,
    collectedEnergy: 58420,
    collectedUpdatedAt: "2026-06-30",
    lastYearCollectedEnergy: 56420,
    actualSavingTce: 0.55,
    actualSavingKwh: 2980.7,
    remainingSaving: 0.36,
onSiteCheck: true,
    onSiteCheckYear: "2025",
    hasIssue: false,
    issueDetail: "",
    attachments: [
      { name: "整车扩能项目可研.pdf", size: "4.5 MB", uploadedAt: "2024-05-15", type: "pdf" },
      { name: "节能评估报告.pdf", size: "3.1 MB", uploadedAt: "2024-04-20", type: "pdf" },
    ],
    district: "浦东新区",
    startDate: "2024-06",
    endDate: "2026-03",
    investment: 246000,
    projectContact: { name: "罗振宇", phone: "13816667788", email: "luozy@saicmotor.com" },
    projectType: "扩建",
    buildingContent: "扩建临港工厂三期冲焊涂总四大工艺，年增 25 万辆纯电整车产能。",
    energyReviewDoc: "沪发改环资节〔2024〕073 号 / 2024-05-11",
    eiaReviewDoc: "沪环保许字〔2024〕045 号 / 2024-04-18",
    remark: "",
    unitName: "上海汽车集团股份有限公司乘用车分公司",
    creditCode: "913101157776100068",
    industry: "汽车制造业",
    industryCode: "C36",
    unitNature: "地方国企",
    unitContact: { name: "范琦", phone: "021-22011666", email: "service@saicmotor.com" },
  },
  {
    id: "GTZ-2025-005",
    name: "嘉定数据中心 PUE 优化与绿电直供项目",
    contact: "李建国",
    linkStatus: "待确认",
    approvedEnergy: 38000,
    collectedEnergy: 41200,
    collectedUpdatedAt: "2026-06-30",
    lastYearCollectedEnergy: 39200,
    actualSavingTce: 0.21,
    actualSavingKwh: 1860.4,
    remainingSaving: -0.05,
onSiteCheck: true,
    onSiteCheckYear: "2025",
    hasIssue: true,
    issueDetail: "PUE 实测值高于批复目标 0.07，需补充优化措施。",
    attachments: [
      { name: "PUE 优化方案.pdf", size: "1.6 MB", uploadedAt: "2024-10-10", type: "pdf" },
      { name: "液冷系统说明.docx", size: "920 KB", uploadedAt: "2024-10-12", type: "docx" },
    ],
    district: "嘉定区",
    startDate: "2024-11",
    endDate: "2025-10",
    investment: 73500,
    projectContact: { name: "崔思远", phone: "13509990012", email: "cuisy@idc-jd.cn" },
    projectType: "改建",
    buildingContent: "对 8MW 机房群采用液冷+间接蒸发冷却方案，PUE 从 1.45 降至 1.18。",
    energyReviewDoc: "沪发改环资节〔2024〕158 号 / 2024-10-08",
    eiaReviewDoc: "沪环保许字〔2024〕112 号 / 2024-09-20",
    remark: "信用代码匹配到 2 个企业，需手工选择。",
    unitName: "上海嘉云智算科技有限公司",
    creditCode: "91310114MA7K0Q3X1L",
    industry: "互联网和相关服务",
    industryCode: "I64",
    unitNature: "民营企业",
    unitContact: { name: "潘雨欣", phone: "021-69999000", email: "biz@jiayun-idc.cn" },
  },
  {
    id: "GTZ-2025-006",
    name: "光明乳业冷链物流中心节能扩建",
    contact: "周慧敏",
    linkStatus: "已关联",
    linkedEnterpriseName: "光明乳业股份有限公司",
    linkedCreditCode: "91310000132206289P",
    approvedEnergy: 18500,
    collectedEnergy: 16980,
    collectedUpdatedAt: "2026-06-30",
    lastYearCollectedEnergy: 14980,
    actualSavingTce: 0.12,
    actualSavingKwh: 980.5,
    remainingSaving: 0.15,
onSiteCheck: false,
    onSiteCheckYear: undefined,
    hasIssue: false,
    issueDetail: "",
    attachments: [
      { name: "冷库扩建可研报告.pdf", size: "2.7 MB", uploadedAt: "2024-07-20", type: "pdf" },
    ],
    district: "徐汇区",
    startDate: "2024-08",
    endDate: "2025-09",
    investment: 21800,
    projectContact: { name: "蒋丽萍", phone: "13002224455", email: "jianglp@brightdairy.com" },
    projectType: "扩建",
    buildingContent: "新建 1.2 万平方米全自动冷库，采用 CO₂ 跨临界制冷与光储直柔系统。",
    energyReviewDoc: "沪发改环资节〔2024〕101 号 / 2024-07-15",
    eiaReviewDoc: "沪环保许字〔2024〕067 号 / 2024-06-30",
    remark: "",
    unitName: "光明乳业股份有限公司",
    creditCode: "91310000132206289P",
    industry: "食品制造业",
    industryCode: "C14",
    unitNature: "地方国企",
    unitContact: { name: "邓建华", phone: "021-54591958", email: "info@brightdairy.com" },
  },
  {
    id: "GTZ-2025-007",
    name: "外高桥造船绿色船坞迁建项目",
    contact: "王志远",
    linkStatus: "待关联",
    approvedEnergy: 71000,
    collectedEnergy: 0,
    collectedUpdatedAt: "2026-06-30",
    lastYearCollectedEnergy: 0,
    actualSavingTce: 0,
    actualSavingKwh: 0,
    remainingSaving: 0.55,
onSiteCheck: false,
    onSiteCheckYear: undefined,
    hasIssue: false,
    issueDetail: "",
    attachments: [
      { name: "船坞迁建立项报告.pdf", size: "5.1 MB", uploadedAt: "2025-04-22", type: "pdf" },
      { name: "岸电与光伏方案.docx", size: "1.4 MB", uploadedAt: "2025-04-25", type: "docx" },
    ],
    district: "浦东新区",
    startDate: "2025-05",
    endDate: "2027-08",
    investment: 312000,
    projectContact: { name: "钱伟", phone: "13218876655", email: "qianwei@waigaoqiao.com" },
    projectType: "迁建",
    buildingContent: "迁建 30 万吨级船坞，配套岸电、太阳能光伏 20MW 及智慧能源平台。",
    energyReviewDoc: "沪发改环资节〔2025〕022 号 / 2025-04-18",
    eiaReviewDoc: "沪环保许字〔2025〕015 号 / 2025-04-02",
    remark: "新企业首次申报，待手工关联。",
    unitName: "上海外高桥造船有限公司",
    creditCode: "91310115607217088G",
    industry: "金属船舶制造",
    industryCode: "C3731",
    unitNature: "央企",
    unitContact: { name: "胡敏", phone: "021-58682211", email: "office@chinasws.com" },
  },
  {
    id: "GTZ-2025-008",
    name: "闵行区分布式光伏整县推进示范",
    contact: "陈晓琳",
    linkStatus: "已关联",
    linkedEnterpriseName: "上海闵新能源科技有限公司",
    linkedCreditCode: "91310112MA1G2YH75T",
    approvedEnergy: 6500,
    collectedEnergy: 5840,
    collectedUpdatedAt: "2026-06-30",
    lastYearCollectedEnergy: 3840,
    actualSavingTce: 0.32,
    actualSavingKwh: 2210.6,
    remainingSaving: 0.08,
onSiteCheck: true,
    onSiteCheckYear: "2024",
    hasIssue: false,
    issueDetail: "",
    attachments: [
      { name: "光伏整县推进方案.pdf", size: "2.2 MB", uploadedAt: "2024-01-25", type: "pdf" },
    ],
    district: "闵行区",
    startDate: "2024-02",
    endDate: "2025-04",
    investment: 18900,
    projectContact: { name: "施梦琪", phone: "13755669988", email: "shimq@minxin-energy.com" },
    projectType: "新建",
    buildingContent: "全区工商业屋顶分布式光伏 85MW，配套 12MWh 储能。",
    energyReviewDoc: "沪发改环资节〔2024〕045 号 / 2024-01-22",
    eiaReviewDoc: "沪环保许字〔2024〕012 号 / 2024-01-08",
    remark: "",
    unitName: "上海闵新能源科技有限公司",
    creditCode: "91310112MA1G2YH75T",
    industry: "电力、热力生产和供应业",
    industryCode: "D44",
    unitNature: "民营企业",
    unitContact: { name: "卫子轩", phone: "021-64886688", email: "biz@minxin-energy.com" },
  },
];

export const enterpriseLibrary = [
  { name: "宝山钢铁股份有限公司", creditCode: "913100006072120631", industry: "黑色金属冶炼及压延加工业" },
  { name: "中国石化上海石油化工股份有限公司", creditCode: "91310000132211457X", industry: "石油加工业" },
  { name: "上海汽车集团股份有限公司乘用车分公司", creditCode: "913101157776100068", industry: "汽车制造业" },
  { name: "光明乳业股份有限公司", creditCode: "91310000132206289P", industry: "食品制造业" },
  { name: "上海闵新能源科技有限公司", creditCode: "91310112MA1G2YH75T", industry: "电力、热力生产和供应业" },
  { name: "上海华谊集团股份有限公司", creditCode: "91310000132206158K", industry: "化学原料和化学制品制造业" },
  { name: "上海电气集团股份有限公司", creditCode: "91310000132207820H", industry: "通用设备制造业" },
];

export const linkStatusStyle: Record<LinkStatus, { dot: string; badge: string; label: string }> = {
  已关联: { dot: "bg-success", badge: "bg-success/15 text-success border-success/30", label: "已关联" },
  待关联: { dot: "bg-warning", badge: "bg-warning/15 text-warning border-warning/30", label: "待关联" },
  待确认: { dot: "bg-yellow-500", badge: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30", label: "待确认" },
};
