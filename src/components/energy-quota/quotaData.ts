// 能源消耗限额管理 - 类型定义与 mock 数据

export type StandardStatus = "启用" | "禁用";
export type StandardPrefix = "GB" | "DB";

export interface QuotaStandard {
  id: string;
  code: string;             // 标准号 GB/DB 开头
  name: string;             // 标准名称
  parentId?: string;        // 上级标准
  years: number[];          // 适用年份
  isEnergyOutput: boolean;  // 是否能源输出
  status: StandardStatus;
}

export type CycleStatus = "进行中" | "已完成";

export interface QuotaCycle {
  id: string;
  period: string;           // 例 202601-202612
  startMonth: string;
  endMonth: string;
  deadline: string;         // 截止日期 YYYY-MM-DD
  status: CycleStatus;
  reported: number;         // 已填报
  audited: number;          // 已审核
  total: number;            // 所有需填报
}

export type EnterpriseStatus =
  | "未填报"
  | "填报中"
  | "待审核"
  | "已驳回"
  | "已完成";

export interface QuotaEnterprise {
  id: string;
  cycleId: string;
  creditCode: string;
  name: string;
  industry: string;
  standardCodes: string[]; // 适用标准号
  status: EnterpriseStatus;
  hasData: boolean;        // 是否已填报数据
}

export interface AuditRecord {
  operator: string;
  account: string;
  time: string;
  action: "提交" | "驳回" | "通过" | "撤回" | "保存草稿";
  comment?: string;
}

export interface EnergyDataRow {
  product: string;
  unit: string;
  output: number;       // 产量
  energy: number;       // 综合能耗（吨标煤）
  unitEnergy: number;   // 单位产品能耗
  limit: number;        // 限额值
  exceed: boolean;      // 是否超限
}

export interface MaterialFile {
  name: string;
  type: "image" | "pdf" | "excel";
  size: string;
}

export interface QuotaDetail {
  enterpriseId: string;
  enterpriseName: string;
  creditCode: string;
  industry: string;
  cyclePeriod: string;
  standardCode: string;
  standardName: string;
  records: AuditRecord[];
  energyData: EnergyDataRow[];
  materials: MaterialFile[];
}

// ===== Mock Data =====

export const standards: QuotaStandard[] = [
  { id: "s1", code: "GB 21258-2024", name: "燃煤发电机组单位产品能源消耗限额-热电联产", years: [2024, 2025, 2026], isEnergyOutput: true, status: "启用" },
  { id: "s2", code: "GB 21340-2019", name: "平板玻璃单位产品能源消耗限额", years: [2023, 2024, 2025, 2026], isEnergyOutput: false, status: "启用" },
  { id: "s3", code: "GB 17167-2022", name: "用能单位能源计量器具配备和管理通则", years: [2025, 2026], isEnergyOutput: false, status: "启用" },
  { id: "s4", code: "DB31/T 638-2024", name: "上海市数据中心能源消耗限额", years: [2024, 2025, 2026], isEnergyOutput: false, status: "启用" },
  { id: "s5", code: "DB31/T 555-2022", name: "上海市钢铁行业能耗限额", years: [2022, 2023, 2024], isEnergyOutput: false, status: "启用" },
  { id: "s6", code: "GB 16780-2012", name: "水泥单位产品能源消耗限额（已废止）", years: [2021, 2022], isEnergyOutput: false, status: "禁用" },
  { id: "s7", code: "DB31/T 401-2018", name: "上海市印染行业能耗限额（旧版）", years: [2021], isEnergyOutput: false, status: "禁用" },
];

export const cycles: QuotaCycle[] = [
  { id: "c1", period: "202601-202612", startMonth: "2026-01", endMonth: "2026-12", deadline: "2026-03-31", status: "进行中", reported: 5, audited: 20, total: 98 },
  { id: "c2", period: "202501-202512", startMonth: "2025-01", endMonth: "2025-12", deadline: "2025-03-31", status: "进行中", reported: 78, audited: 60, total: 95 },
  { id: "c3", period: "202401-202412", startMonth: "2024-01", endMonth: "2024-12", deadline: "2024-03-31", status: "已完成", reported: 92, audited: 92, total: 92 },
  { id: "c4", period: "202301-202312", startMonth: "2023-01", endMonth: "2023-12", deadline: "2023-03-31", status: "已完成", reported: 88, audited: 88, total: 88 },
];

export const enterprises: QuotaEnterprise[] = [
  { id: "e1", cycleId: "c1", creditCode: "900023893459294E", name: "国网上海分公司", industry: "电力、热力生产和供应业", standardCodes: ["GB 21258-2024"], status: "已完成", hasData: true },
  { id: "e2", cycleId: "c1", creditCode: "913100007050125XXY", name: "上海宝山钢铁股份有限公司", industry: "黑色金属冶炼", standardCodes: ["DB31/T 555-2022"], status: "待审核", hasData: true },
  { id: "e3", cycleId: "c1", creditCode: "91310000132201347P", name: "上海耀皮玻璃集团", industry: "非金属矿物制品业", standardCodes: ["GB 21340-2019"], status: "已驳回", hasData: true },
  { id: "e4", cycleId: "c1", creditCode: "91310000631696302L", name: "上海数据港股份有限公司", industry: "互联网与数据服务", standardCodes: ["DB31/T 638-2024"], status: "填报中", hasData: true },
  { id: "e5", cycleId: "c1", creditCode: "91310115607284430Y", name: "中芯国际集成电路", industry: "计算机、通信和其他电子设备", standardCodes: ["DB31/T 638-2024", "GB 17167-2022"], status: "未填报", hasData: false },
  { id: "e6", cycleId: "c1", creditCode: "91310000132198354K", name: "上海石化股份有限公司", industry: "石油加工", standardCodes: ["GB 17167-2022"], status: "待审核", hasData: true },
  { id: "e7", cycleId: "c1", creditCode: "913100001321987XX2", name: "上海华谊集团", industry: "化学原料制造", standardCodes: ["GB 17167-2022"], status: "未填报", hasData: false },
  { id: "e8", cycleId: "c2", creditCode: "913100007050125XXX", name: "上汽集团", industry: "汽车制造业", standardCodes: ["GB 17167-2022"], status: "已完成", hasData: true },
];

export const sampleDetail: QuotaDetail = {
  enterpriseId: "e2",
  enterpriseName: "上海宝山钢铁股份有限公司",
  creditCode: "913100007050125XXY",
  industry: "黑色金属冶炼",
  cyclePeriod: "202601-202612",
  standardCode: "DB31/T 555-2022",
  standardName: "上海市钢铁行业能耗限额",
  records: [
    { operator: "李芳", account: "lifang_baogang", time: "2026-03-25 10:12:33", action: "保存草稿" },
    { operator: "李芳", account: "lifang_baogang", time: "2026-03-28 14:05:21", action: "提交", comment: "已按照 DB31/T 555-2022 完成 2025 年度全部填报。" },
    { operator: "王伟", account: "wangwei_gov", time: "2026-03-29 09:30:11", action: "驳回", comment: "热轧工序单位产品能耗高于限额值，请补充说明并附能源审计报告。" },
    { operator: "李芳", account: "lifang_baogang", time: "2026-03-30 12:41:07", action: "提交", comment: "已补充能源审计报告及节能措施说明。" },
  ],
  energyData: [
    { product: "粗钢", unit: "吨", output: 1280000, energy: 712000, unitEnergy: 0.556, limit: 0.58, exceed: false },
    { product: "热轧板带", unit: "吨", output: 980000, energy: 78400, unitEnergy: 0.080, limit: 0.075, exceed: true },
    { product: "冷轧板带", unit: "吨", output: 520000, energy: 41600, unitEnergy: 0.080, limit: 0.085, exceed: false },
    { product: "焦炭", unit: "吨", output: 350000, energy: 38500, unitEnergy: 0.110, limit: 0.115, exceed: false },
  ],
  materials: [
    { name: "2025年能源审计报告.pdf", type: "pdf", size: "3.2 MB" },
    { name: "热轧工序节能措施说明.pdf", type: "pdf", size: "1.1 MB" },
    { name: "电费单据-2025Q4.xlsx", type: "excel", size: "256 KB" },
    { name: "厂区能源计量器具照片.jpg", type: "image", size: "1.8 MB" },
  ],
};

export const allYears = Array.from({ length: 15 }, (_, i) => 2021 + i);
export const allIndustries = Array.from(new Set(enterprises.map((e) => e.industry)));

export const enterpriseStatusStyle: Record<EnterpriseStatus, { dot: string; badge: string }> = {
  未填报: { dot: "bg-muted-foreground", badge: "border-muted-foreground/40 bg-muted/40 text-muted-foreground" },
  填报中: { dot: "bg-secondary", badge: "border-secondary/40 bg-secondary/10 text-secondary" },
  待审核: { dot: "bg-warning", badge: "border-warning/40 bg-warning/10 text-warning" },
  已驳回: { dot: "bg-destructive", badge: "border-destructive/40 bg-destructive/10 text-destructive" },
  已完成: { dot: "bg-success", badge: "border-success/40 bg-success/10 text-success" },
};

// 排序：启用GB > 启用DB > 禁用GB > 禁用DB；同组按标准号升序
export function sortStandards(list: QuotaStandard[]): QuotaStandard[] {
  const rank = (s: QuotaStandard) => {
    const enabled = s.status === "启用" ? 0 : 2;
    const prefix = s.code.startsWith("GB") ? 0 : 1;
    return enabled + prefix;
  };
  return [...list].sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r !== 0) return r;
    return a.code.localeCompare(b.code);
  });
}
