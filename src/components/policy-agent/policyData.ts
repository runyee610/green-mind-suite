// 政策智能推送智能体 - 模拟数据

export type PolicyCategory = "专项补贴" | "绿色金融" | "税收减免" | "技改奖励" | "示范认定";
export type PolicyLevel = "国家级" | "市级" | "区级";
export type PolicyUrgency = "high" | "medium" | "low";

export interface PolicyTag {
  label: string;
  type: "industry" | "indicator" | "scenario" | "scale";
}

export interface PolicyItem {
  id: string;
  title: string;
  issuer: string;
  level: PolicyLevel;
  category: PolicyCategory;
  deadline: string;
  matchScore: number; // 0-100 匹配度
  amount?: string; // 资金支持
  urgency: PolicyUrgency;
  tags: PolicyTag[];
  matchReason: string; // 匹配理由（绑定到企业整改项目）
  bindProject?: string; // 绑定的整改/技改项目
  summary: string;
  pushedAt: string;
  status: "未读" | "已查看" | "申报中" | "已申报";
}

export const MOCK_POLICIES: PolicyItem[] = [
  {
    id: "POL-2025-001",
    title: "上海市绿色低碳技术改造专项资金（2025年第二批）",
    issuer: "上海市经济和信息化委员会",
    level: "市级",
    category: "专项补贴",
    deadline: "2025-12-15",
    matchScore: 96,
    amount: "最高 800 万元",
    urgency: "high",
    tags: [
      { label: "钢铁行业", type: "industry" },
      { label: "能源消耗强度", type: "indicator" },
      { label: "余热回收", type: "scenario" },
    ],
    matchReason: "您当前『余热回收技改项目』正在执行，且能源消耗强度评分 7/8，符合本批次重点支持方向。",
    bindProject: "余热回收技改项目（动态档案 #DYN-2025-001）",
    summary: "支持工业企业实施节能、节水、减碳类技术改造，按设备投资额 20%-30% 给予补助。",
    pushedAt: "2025-05-12 09:30",
    status: "未读",
  },
  {
    id: "POL-2025-002",
    title: "绿色信贷专项额度（碳减排支持工具）",
    issuer: "中国人民银行上海总部 · 工商银行上海分行",
    level: "国家级",
    category: "绿色金融",
    deadline: "2026-06-30",
    matchScore: 91,
    amount: "授信额度 5000 万 · 利率 LPR-50bp",
    urgency: "medium",
    tags: [
      { label: "碳排放强度", type: "indicator" },
      { label: "可再生能源", type: "scenario" },
      { label: "中型企业", type: "scale" },
    ],
    matchReason: "企业近 3 年碳排放强度持续下降 12%，可作为优质碳减排项目主体获得低息授信。",
    bindProject: "厂区分布式光伏 BIPV 项目",
    summary: "针对清洁能源、节能改造、碳减排技术等领域提供低成本资金支持。",
    pushedAt: "2025-05-11 14:22",
    status: "已查看",
  },
  {
    id: "POL-2025-003",
    title: "节能节水环保企业所得税优惠（三免三减半）",
    issuer: "国家税务总局上海市税务局",
    level: "国家级",
    category: "税收减免",
    deadline: "长期有效",
    matchScore: 84,
    amount: "前 3 年免征 · 后 3 年减半",
    urgency: "low",
    tags: [
      { label: "工业用水重复利用率", type: "indicator" },
      { label: "固废综合利用", type: "scenario" },
    ],
    matchReason: "企业固废综合利用率 96.5%，水重复利用率达标，符合公共基础设施项目税收优惠条件。",
    summary: "对符合条件的节能节水、环境保护项目所得，享受企业所得税三免三减半。",
    pushedAt: "2025-05-10 10:05",
    status: "未读",
  },
  {
    id: "POL-2025-004",
    title: "闵行区绿色工厂创建奖励办法",
    issuer: "上海市闵行区人民政府",
    level: "区级",
    category: "技改奖励",
    deadline: "2025-09-30",
    matchScore: 88,
    amount: "一次性奖励 50-200 万",
    urgency: "high",
    tags: [
      { label: "市级绿色工厂", type: "indicator" },
      { label: "属地企业", type: "scale" },
    ],
    matchReason: "企业已通过市级绿色工厂自评价（92 分），可申领区级配套奖励。",
    bindProject: "市级绿色工厂证书 #GF-2025-003",
    summary: "对获得市级及以上绿色工厂称号的属地企业给予一次性资金奖励。",
    pushedAt: "2025-05-09 16:48",
    status: "申报中",
  },
  {
    id: "POL-2025-005",
    title: "工业产品绿色设计示范企业申报",
    issuer: "工业和信息化部",
    level: "国家级",
    category: "示范认定",
    deadline: "2025-08-20",
    matchScore: 72,
    urgency: "medium",
    tags: [
      { label: "绿色设计", type: "indicator" },
      { label: "产品碳足迹", type: "scenario" },
    ],
    matchReason: "建议补强『产品碳足迹』指标（当前 6/8），可冲刺国家级示范企业认定。",
    summary: "认定一批工业产品绿色设计示范企业，纳入工信部白名单。",
    pushedAt: "2025-05-08 11:11",
    status: "未读",
  },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: { policyId: string; title: string }[];
  suggestions?: string[];
}

export const SUGGESTED_QUESTIONS = [
  "我们企业目前最适合申报哪些政策？",
  "余热回收项目可以申请多少补贴？",
  "绿色信贷需要准备哪些材料？",
  "如何提升市级绿色工厂评分？",
  "帮我梳理本月需要提交的申报清单",
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "m-0",
    role: "assistant",
    content:
      "您好，我是政策智能推送助手 PolicyGPT。我已根据贵司的整改项目、自评价数据和动态档案，为您匹配到 5 项可申报政策（其中 2 项高优先级）。您可以直接点击左侧政策查看详情，或者向我提问。",
    timestamp: "刚刚",
    suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
  },
];

export const categoryColor: Record<PolicyCategory, string> = {
  专项补贴: "border-primary/40 bg-primary/10 text-primary",
  绿色金融: "border-success/40 bg-success/10 text-success",
  税收减免: "border-warning/40 bg-warning/10 text-warning",
  技改奖励: "border-accent/40 bg-accent/20 text-accent-foreground",
  示范认定: "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
};

export const urgencyColor: Record<PolicyUrgency, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/40",
  medium: "bg-warning/15 text-warning border-warning/40",
  low: "bg-muted/40 text-muted-foreground border-border",
};

export const tagColor: Record<PolicyTag["type"], string> = {
  industry: "bg-primary/10 text-primary border-primary/30",
  indicator: "bg-success/10 text-success border-success/30",
  scenario: "bg-warning/10 text-warning border-warning/30",
  scale: "bg-muted/50 text-muted-foreground border-border",
};
