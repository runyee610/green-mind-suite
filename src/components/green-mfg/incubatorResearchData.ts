// 培育库 AI 智能体调研：薄弱项 → 节能技术推荐
// 纯前端模拟 deepthink + deep research 过程，数据手工整理自公开权威来源

export interface WeakArea {
  /** 一级维度，如 "能源与资源投入" */
  l1: string;
  /** 二级薄弱项名称 */
  name: string;
  /** 得分缺口（满分 - 当前） */
  gap: number;
}

export interface EnergyTech {
  id: string;
  /** 技术/方案名称 */
  name: string;
  /** 所属公司 / 机构 */
  company: string;
  /** 公司所在地 */
  location: string;
  /** 技术分类 */
  category: string;
  /** 适用薄弱项关键词（与 WeakArea.name 关键字匹配） */
  appliesTo: string[];
  /** 预计节能 / 碳减排收益 */
  benefit: string;
  /** 成熟度等级 TRL 1-9 */
  trl: number;
  /** 权威来源 */
  source: string;
  sourceUrl: string;
  /** 引用日期 */
  citedAt: string;
}

export interface ResearchLog {
  time: string;
  stage: string;
  detail: string;
}

export interface IncubatorResearchResult {
  creditCode: string;
  enterpriseName: string;
  generatedAt: string;
  status: "researching" | "done";
  weakAreas: WeakArea[];
  techs: EnergyTech[];
  logs: ResearchLog[];
}

const STORAGE_KEY = "green-mfg-incubator-research";

/** 权威节能技术库（手工整理，来源公开可查） */
export const ENERGY_TECH_LIBRARY: EnergyTech[] = [
  {
    id: "T-001",
    name: "IE5 超高效永磁同步电机",
    company: "ABB（中国）有限公司",
    location: "瑞士苏黎世 / 上海",
    category: "高效电机",
    appliesTo: ["能耗", "电机", "拉丝", "单位产品能耗"],
    benefit: "较 IE3 电机节电 8%-12%，回收期 2-3 年",
    trl: 9,
    source: "工信部《国家工业和信息化领域节能技术装备推荐目录（2024）》",
    sourceUrl: "https://www.miit.gov.cn/jgsj/jns/wjfb/",
    citedAt: "2025-09",
  },
  {
    id: "T-002",
    name: "高速永磁同步拉丝机",
    company: "江苏亨通光电股份有限公司",
    location: "江苏苏州",
    category: "工艺装备升级",
    appliesTo: ["单位产品能耗", "拉丝", "电缆"],
    benefit: "线缆拉丝单位电耗下降 15%-20%",
    trl: 9,
    source: "中国电器工业协会《电线电缆行业绿色制造案例汇编》",
    sourceUrl: "https://www.ceeia.com/",
    citedAt: "2025-08",
  },
  {
    id: "T-003",
    name: "工业余热回收热泵系统",
    company: "海尔卡奥斯 COSMOPlat",
    location: "山东青岛",
    category: "余热利用",
    appliesTo: ["综合能耗", "热回收", "蒸汽"],
    benefit: "回收 60-120℃ 低品位余热，节约蒸汽 20%-30%",
    trl: 8,
    source: "国家发改委《重点节能低碳技术推广目录》",
    sourceUrl: "https://www.ndrc.gov.cn/",
    citedAt: "2025-07",
  },
  {
    id: "T-004",
    name: "分布式屋顶光伏 + 储能微网",
    company: "隆基绿能科技股份有限公司",
    location: "陕西西安",
    category: "可再生能源",
    appliesTo: ["可再生能源", "绿电", "碳排放"],
    benefit: "厂区绿电占比提升 25%-40%，年减排 CO₂ 约 1200 t",
    trl: 9,
    source: "IEA《Renewables 2024》",
    sourceUrl: "https://www.iea.org/reports/renewables-2024",
    citedAt: "2025-10",
  },
  {
    id: "T-005",
    name: "EnOS 能碳一体化管控平台",
    company: "远景智能（Envision Digital）",
    location: "上海",
    category: "能源管理系统",
    appliesTo: ["能碳管理", "平台功能", "能源管理体系"],
    benefit: "实现分钟级能耗监测，综合节能 5%-8%",
    trl: 9,
    source: "工信部《工业互联网+绿色低碳典型应用案例》",
    sourceUrl: "https://www.miit.gov.cn/",
    citedAt: "2025-09",
  },
  {
    id: "T-006",
    name: "永磁变频螺杆空压机",
    company: "Atlas Copco 阿特拉斯·科普柯",
    location: "瑞典斯德哥尔摩 / 上海",
    category: "通用动力设备",
    appliesTo: ["综合能耗", "空压", "辅助系统"],
    benefit: "较工频机节电 30%-40%",
    trl: 9,
    source: "中国节能协会《节能技术目录》",
    sourceUrl: "https://www.chinaeca.org.cn/",
    citedAt: "2025-08",
  },
  {
    id: "T-007",
    name: "LED + 物联网智能照明系统",
    company: "昕诺飞（Signify，原飞利浦照明）",
    location: "荷兰埃因霍温 / 上海",
    category: "照明节能",
    appliesTo: ["综合能耗", "照明"],
    benefit: "厂房照明能耗下降 50%-70%",
    trl: 9,
    source: "IEA《Energy Efficiency 2024》",
    sourceUrl: "https://www.iea.org/reports/energy-efficiency-2024",
    citedAt: "2025-10",
  },
  {
    id: "T-008",
    name: "低烟无卤环保绝缘料配方优化",
    company: "上海科华热磁电缆有限公司 / 中国科学院化学所",
    location: "上海",
    category: "绿色材料",
    appliesTo: ["绿色产品", "无害化", "材料"],
    benefit: "燃烧烟密度降低 60%，可回收率提升至 95%",
    trl: 8,
    source: "《中国电机工程学报》2024 年第 8 期",
    sourceUrl: "http://www.pcsee.org/",
    citedAt: "2025-06",
  },
  {
    id: "T-009",
    name: "SF6 替代环保气体绝缘开关柜",
    company: "西门子能源（Siemens Energy）",
    location: "德国慕尼黑 / 上海",
    category: "温室气体替代",
    appliesTo: ["碳排放", "温室气体", "SF6"],
    benefit: "全生命周期 GWP 降低 99%",
    trl: 8,
    source: "IEC TR 62271-4:2023",
    sourceUrl: "https://www.iec.ch/",
    citedAt: "2025-05",
  },
  {
    id: "T-010",
    name: "绿色电力交易与 I-REC 认证",
    company: "国家电网上海电力交易中心",
    location: "上海",
    category: "绿电采购",
    appliesTo: ["可再生能源", "绿电", "碳排放"],
    benefit: "通过绿证抵扣范围 2 排放，年减排 CO₂ 约 800 t",
    trl: 9,
    source: "国家能源局《2024 年绿色电力交易报告》",
    sourceUrl: "http://www.nea.gov.cn/",
    citedAt: "2025-09",
  },
];

/** 根据薄弱项关键词匹配技术 */
function matchTechs(weakAreas: WeakArea[]): EnergyTech[] {
  const keywords = weakAreas.flatMap((w) => [w.name, w.l1]);
  const scored = ENERGY_TECH_LIBRARY.map((t) => {
    const score = t.appliesTo.reduce(
      (s, kw) => s + (keywords.some((k) => k.includes(kw) || kw.includes(k)) ? 1 : 0),
      0,
    );
    return { t, score };
  });
  const matched = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  // 至少 6 条，不足则补充库中靠前的
  const picked = matched.slice(0, 8).map((x) => x.t);
  if (picked.length < 6) {
    ENERGY_TECH_LIBRARY.forEach((t) => {
      if (picked.length < 6 && !picked.includes(t)) picked.push(t);
    });
  }
  return picked;
}

/** 默认薄弱项（电缆行业典型） */
export const DEFAULT_WEAK_AREAS: WeakArea[] = [
  { l1: "能源与资源投入", name: "单位产品综合能耗", gap: 12 },
  { l1: "产品", name: "绿色产品设计与材料无害化", gap: 9 },
  { l1: "环境排放", name: "温室气体（含 SF6）排放", gap: 8 },
];

export function loadResearch(creditCode: string): IncubatorResearchResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, IncubatorResearchResult>;
    return all[creditCode] ?? null;
  } catch {
    return null;
  }
}

function saveResearch(result: IncubatorResearchResult) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, IncubatorResearchResult>) : {};
    all[result.creditCode] = result;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("incubator-research-updated", { detail: result.creditCode }));
  } catch {
    /* noop */
  }
}

const now = () => new Date().toLocaleTimeString("zh-CN", { hour12: false });

/** 启动智能体调研：多阶段日志推进，最终落库 */
export async function runIncubatorResearch(input: {
  creditCode: string;
  enterpriseName: string;
  weakAreas?: WeakArea[];
  onUpdate?: (r: IncubatorResearchResult) => void;
}): Promise<IncubatorResearchResult> {
  const weakAreas = input.weakAreas ?? DEFAULT_WEAK_AREAS;
  const base: IncubatorResearchResult = {
    creditCode: input.creditCode,
    enterpriseName: input.enterpriseName,
    generatedAt: new Date().toISOString(),
    status: "researching",
    weakAreas,
    techs: [],
    logs: [
      { time: now(), stage: "解析薄弱项", detail: `识别 ${weakAreas.length} 项薄弱指标：${weakAreas.map((w) => w.name).join("、")}` },
    ],
  };
  saveResearch(base);
  input.onUpdate?.(base);

  const stages: { delay: number; stage: string; detail: string }[] = [
    { delay: 800, stage: "deepthink", detail: "推理薄弱项背后的工艺/管理瓶颈，拆解为可检索的技术问题…" },
    { delay: 900, stage: "全网检索", detail: "调用 deep research：检索工信部、IEA、IEC、CNKI 与头部企业公开案例…" },
    { delay: 800, stage: "权威性筛选", detail: "按 TRL ≥ 8、来源权威性、行业匹配度三维度过滤候选方案…" },
    { delay: 700, stage: "收益估算", detail: "对每条候选方案估算节能/减排收益与投资回收期…" },
  ];

  let acc = { ...base };
  for (const s of stages) {
    await new Promise((r) => setTimeout(r, s.delay));
    acc = {
      ...acc,
      logs: [...acc.logs, { time: now(), stage: s.stage, detail: s.detail }],
    };
    saveResearch(acc);
    input.onUpdate?.(acc);
  }

  const techs = matchTechs(weakAreas);
  const finalResult: IncubatorResearchResult = {
    ...acc,
    status: "done",
    techs,
    logs: [
      ...acc.logs,
      { time: now(), stage: "完成", detail: `已完成全网检索，共推荐 ${techs.length} 项成熟权威技术` },
    ],
  };
  saveResearch(finalResult);
  input.onUpdate?.(finalResult);
  return finalResult;
}
