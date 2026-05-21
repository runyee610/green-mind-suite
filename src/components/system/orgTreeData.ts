// 组织架构：森林模型 —— 支持多个根（同级"中心"）
export type OrgLevel = "city" | "dept" | "district" | "park";

export interface OrgNode {
  id: string;
  name: string;
  level: OrgLevel;
  address?: string;
  children?: OrgNode[];
}

// 基于附件架构图初始化
const SHANGHAI_CENTER: OrgNode = {
  id: "city",
  name: "上海市节能中心",
  level: "city",
  address: "上海市黄浦区中山南路100号",
  children: [
    { id: "dept-office", name: "综合办公室", level: "dept", address: "上海市节能中心 3 楼" },
    { id: "dept-monitor", name: "能碳监测科", level: "dept", address: "上海市节能中心 4 楼" },
    { id: "dept-inspect", name: "节能监察科", level: "dept", address: "上海市节能中心 5 楼" },
    { id: "dept-manage", name: "能碳管理科", level: "dept", address: "上海市节能中心 6 楼" },
    { id: "dept-promo", name: "宣教推广科", level: "dept", address: "上海市节能中心 7 楼" },
    {
      id: "d-pudong", name: "浦东新区", level: "district", address: "浦东新区世纪大道2001号",
      children: [
        { id: "p-zhangjiang", name: "张江高科技园区", level: "park", address: "浦东新区张江路665号" },
        { id: "p-jinqiao", name: "金桥开发区", level: "park", address: "浦东新区金桥路1198号" },
        { id: "p-lingang", name: "临港新片区", level: "park", address: "浦东新区南汇新城环湖西二路" },
      ],
    },
    {
      id: "d-huangpu", name: "黄浦区", level: "district", address: "黄浦区延安东路300号",
      children: [
        { id: "p-bund", name: "外滩金融集聚区", level: "park", address: "黄浦区中山东一路" },
        { id: "p-yuyuan", name: "豫园商城片区", level: "park", address: "黄浦区福佑路" },
      ],
    },
    {
      id: "d-xuhui", name: "徐汇区", level: "district", address: "徐汇区漕溪北路336号",
      children: [
        { id: "p-caohejing", name: "漕河泾开发区", level: "park", address: "徐汇区桂平路" },
        { id: "p-xhbinjiang", name: "徐汇滨江园区", level: "park", address: "徐汇区龙腾大道" },
      ],
    },
    {
      id: "d-changning", name: "长宁区", level: "district", address: "长宁区愚园路1320号",
      children: [
        { id: "p-hongqiao", name: "虹桥临空经济园区", level: "park", address: "长宁区临空经济园" },
        { id: "p-zhongshan", name: "中山公园商圈", level: "park", address: "长宁区长宁路" },
      ],
    },
    {
      id: "d-jingan", name: "静安区", level: "district", address: "静安区常德路370号",
      children: [
        { id: "p-shibei", name: "市北高新园区", level: "park", address: "静安区共和新路" },
        { id: "p-suhewan", name: "苏河湾片区", level: "park", address: "静安区天目西路" },
      ],
    },
    {
      id: "d-putuo", name: "普陀区", level: "district", address: "普陀区大渡河路1668号",
      children: [
        { id: "p-taopu", name: "桃浦智创城", level: "park", address: "普陀区桃浦路" },
        { id: "p-changfeng", name: "长风生态商务区", level: "park", address: "普陀区云岭东路" },
      ],
    },
    {
      id: "d-chongming", name: "崇明区", level: "district", address: "崇明区城桥镇人民路",
      children: [
        { id: "p-changxing", name: "长兴岛产业园区", level: "park", address: "崇明区长兴岛" },
        { id: "p-cmindustrial", name: "崇明工业园区", level: "park", address: "崇明区港西镇" },
      ],
    },
  ],
};

// 单根（兼容旧代码）
export const INITIAL_ORG_TREE: OrgNode = SHANGHAI_CENTER;
// 森林（推荐）
export const INITIAL_ORG_FOREST: OrgNode[] = [SHANGHAI_CENTER];

export const LEVEL_LABEL: Record<OrgLevel, string> = {
  city: "市级中心",
  dept: "内设科室",
  district: "区级",
  park: "园区",
};

export const LEVEL_BADGE_CLASS: Record<OrgLevel, string> = {
  city: "border-primary/40 bg-primary/10 text-primary",
  dept: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  district: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  park: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

// ===== 单树工具（保留兼容）=====
export function visitOrg(node: OrgNode, fn: (n: OrgNode, parent?: OrgNode) => void, parent?: OrgNode) {
  fn(node, parent);
  node.children?.forEach((c) => visitOrg(c, fn, node));
}
export function findOrg(root: OrgNode, id: string): OrgNode | undefined {
  if (root.id === id) return root;
  for (const c of root.children ?? []) { const r = findOrg(c, id); if (r) return r; }
}
export function updateOrg(root: OrgNode, id: string, patch: Partial<OrgNode>): OrgNode {
  if (root.id === id) return { ...root, ...patch };
  return { ...root, children: root.children?.map((c) => updateOrg(c, id, patch)) };
}
export function addChildOrg(root: OrgNode, parentId: string, child: OrgNode): OrgNode {
  if (root.id === parentId) return { ...root, children: [...(root.children ?? []), child] };
  return { ...root, children: root.children?.map((c) => addChildOrg(c, parentId, child)) };
}
export function removeOrg(root: OrgNode, id: string): OrgNode {
  return { ...root, children: root.children?.filter((c) => c.id !== id).map((c) => removeOrg(c, id)) };
}
export function flattenOrg(root: OrgNode): OrgNode[] {
  const list: OrgNode[] = []; visitOrg(root, (n) => list.push(n)); return list;
}

// ===== 森林工具 =====
export function flattenForest(forest: OrgNode[]): OrgNode[] {
  return forest.flatMap(flattenOrg);
}
export function findInForest(forest: OrgNode[], id: string): OrgNode | undefined {
  for (const r of forest) { const f = findOrg(r, id); if (f) return f; }
}
export function updateInForest(forest: OrgNode[], id: string, patch: Partial<OrgNode>): OrgNode[] {
  return forest.map((r) => updateOrg(r, id, patch));
}
export function addChildInForest(forest: OrgNode[], parentId: string, child: OrgNode): OrgNode[] {
  return forest.map((r) => addChildOrg(r, parentId, child));
}
export function removeFromForest(forest: OrgNode[], id: string): OrgNode[] {
  return forest.filter((r) => r.id !== id).map((r) => removeOrg(r, id));
}
export function addRootToForest(forest: OrgNode[], node: OrgNode): OrgNode[] {
  return [...forest, node];
}

// ===== 集团（独立于行政架构）=====
export interface OrgGroup {
  id: string;
  name: string;
  industry: string;
  address?: string;
  remark?: string;
  enterpriseCount: number;
}
export const INITIAL_GROUPS: OrgGroup[] = [
  { id: "G001", name: "上海电气集团", industry: "高端装备", address: "上海市浦东新区世纪大道1568号", enterpriseCount: 4 },
  { id: "G002", name: "宝武钢铁集团", industry: "钢铁冶金", address: "上海市宝山区盘古路887号", enterpriseCount: 3 },
  { id: "G003", name: "上海华谊集团", industry: "化工新材料", address: "上海市浦东新区张杨路501号", enterpriseCount: 1 },
  { id: "G004", name: "光明食品集团", industry: "食品制造", address: "上海市黄浦区马当路388号", enterpriseCount: 2 },
];

// ===== 企业(行政归属 orgId + 集团归属 groupId)=====
export interface Enterprise {
  id: string;
  creditCode: string;          // 统一社会信用代码
  name: string;
  contact: string;             // 联系人
  phone: string;               // 电话
  liaison: string;             // 对口人(政府侧)
  orgId?: string;              // 行政归属(区/园区)
  groupId?: string;            // 集团归属
}

export const INITIAL_ENTERPRISES: Enterprise[] = [
  { id: "E001", creditCode: "91310000MA1FL12345", name: "上海电气智能装备有限公司", contact: "陈伟",   phone: "021-58880001", liaison: "张明远", orgId: "p-zhangjiang", groupId: "G001" },
  { id: "E002", creditCode: "91310000MA1FL12346", name: "张江生物医药科技股份",     contact: "王晓璐", phone: "021-58880002", liaison: "李静怡", orgId: "p-zhangjiang" },
  { id: "E003", creditCode: "91310000MA1FL12347", name: "华谊新材料(张江)有限公司", contact: "刘强",   phone: "021-58880003", liaison: "王思源", orgId: "p-zhangjiang", groupId: "G003" },
  { id: "E004", creditCode: "91310000MA1FL12348", name: "上海电气重工(金桥)厂",     contact: "赵建华", phone: "021-58880004", liaison: "李静怡", orgId: "p-jinqiao",   groupId: "G001" },
  { id: "E005", creditCode: "91310000MA1FL12349", name: "金桥智能制造有限公司",     contact: "孙磊",   phone: "021-58880005", liaison: "王思源", orgId: "p-jinqiao" },
  { id: "E006", creditCode: "91310000MA1FL12350", name: "临港宝武特钢厂",           contact: "周敏",   phone: "021-58880006", liaison: "张明远", orgId: "p-lingang",   groupId: "G002" },
  { id: "E007", creditCode: "91310000MA1FL12351", name: "临港新能源汽车产业园",     contact: "黄海洋", phone: "021-58880007", liaison: "陈雨涵", orgId: "p-lingang" },
  { id: "E008", creditCode: "91310000MA1FL12352", name: "光明乳业(外滩)总部",       contact: "吴丹",   phone: "021-58880008", liaison: "周建国", orgId: "p-bund",      groupId: "G004" },
  { id: "E009", creditCode: "91310000MA1FL12353", name: "外滩金融服务有限公司",     contact: "郑文",   phone: "021-58880009", liaison: "周建国", orgId: "p-bund" },
  { id: "E010", creditCode: "91310000MA1FL12354", name: "光明食品(豫园)分公司",     contact: "马琳",   phone: "021-58880010", liaison: "刘晓燕", orgId: "p-yuyuan",    groupId: "G004" },
  { id: "E011", creditCode: "91310000MA1FL12355", name: "漕河泾电子科技集团",       contact: "韩涛",   phone: "021-58880011", liaison: "张明远", orgId: "p-caohejing" },
  { id: "E012", creditCode: "91310000MA1FL12356", name: "宝武不锈钢(徐汇)研究院",   contact: "钱昊",   phone: "021-58880012", liaison: "李静怡", orgId: "p-caohejing", groupId: "G002" },
  { id: "E013", creditCode: "91310000MA1FL12357", name: "徐汇滨江数字传媒园",       contact: "高雪",   phone: "021-58880013", liaison: "陈雨涵", orgId: "p-xhbinjiang" },
  { id: "E014", creditCode: "91310000MA1FL12358", name: "上海电气(虹桥)能源服务",   contact: "梁博",   phone: "021-58880014", liaison: "王思源", orgId: "p-hongqiao",  groupId: "G001" },
  { id: "E015", creditCode: "91310000MA1FL12359", name: "市北高新数据中心",         contact: "徐颖",   phone: "021-58880015", liaison: "孙云飞", orgId: "p-shibei" },
  { id: "E016", creditCode: "91310000MA1FL12360", name: "桃浦智创城新能源公司",     contact: "夏阳",   phone: "021-58880016", liaison: "黄志勇", orgId: "p-taopu" },
  { id: "E017", creditCode: "91310000MA1FL12361", name: "长兴岛海洋装备厂",         contact: "蒋宁",   phone: "021-58880017", liaison: "张明远", orgId: "p-changxing", groupId: "G001" },
  { id: "E018", creditCode: "91310000MA1FL12362", name: "宝武特钢长兴基地",         contact: "邵华",   phone: "021-58880018", liaison: "李静怡", orgId: "p-changxing", groupId: "G002" },
];

// ===== 集团账号(独立于行政归属)=====
export interface GroupMembership {
  id: string;
  accountId: string;
  groupId: string;
  role: RoleId;
}
export const INITIAL_GROUP_MEMBERSHIPS: GroupMembership[] = [
  { id: "GM01", accountId: "A001", groupId: "G001", role: "admin" },
  { id: "GM02", accountId: "A004", groupId: "G001", role: "deputy" },
  { id: "GM03", accountId: "A008", groupId: "G001", role: "user" },
  { id: "GM04", accountId: "A002", groupId: "G002", role: "admin" },
  { id: "GM05", accountId: "A005", groupId: "G002", role: "user" },
  { id: "GM06", accountId: "A003", groupId: "G003", role: "admin" },
  { id: "GM07", accountId: "A006", groupId: "G004", role: "admin" },
  { id: "GM08", accountId: "A007", groupId: "G004", role: "user" },
];

// ===== 账号 & 组织身份（统一数据源）=====
export type RoleId = "admin" | "deputy" | "user";

export const ROLE_META: Record<RoleId, { label: string; cls: string; desc: string }> = {
  admin: {
    label: "管理员",
    cls: "border-primary/40 bg-primary/10 text-primary",
    desc: "每个组织唯一,拥有该组织全部权限",
  },
  deputy: {
    label: "副管理员",
    cls: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    desc: "协助管理员,可有多人",
  },
  user: {
    label: "普通用户",
    cls: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
    desc: "组织内日常使用者",
  },
};

export interface Account {
  id: string;
  uid: string;
  phone: string;
  name: string;
  type: "gov" | "enterprise";
  status: "启用" | "停用";
  createdAt: string;
}

export interface Membership {
  id: string;
  accountId: string;
  orgId: string;
  role: RoleId;
}

export const INITIAL_ACCOUNTS: Account[] = [
  { id: "A001", uid: "U10001", phone: "13800000001", name: "张明远", type: "gov", status: "启用", createdAt: "2024-08-12" },
  { id: "A002", uid: "U10002", phone: "13800000002", name: "李静怡", type: "gov", status: "启用", createdAt: "2024-08-14" },
  { id: "A003", uid: "U10003", phone: "13800000003", name: "王思源", type: "gov", status: "启用", createdAt: "2024-09-01" },
  { id: "A004", uid: "U10004", phone: "13800000004", name: "陈雨涵", type: "gov", status: "启用", createdAt: "2024-09-10" },
  { id: "A005", uid: "U10005", phone: "13800000005", name: "刘晓燕", type: "gov", status: "启用", createdAt: "2024-10-02" },
  { id: "A006", uid: "U10006", phone: "13800000006", name: "周建国", type: "gov", status: "启用", createdAt: "2024-10-18" },
  { id: "A007", uid: "U10007", phone: "13800000007", name: "黄志勇", type: "gov", status: "停用", createdAt: "2024-11-03" },
  { id: "A008", uid: "U10008", phone: "13800000008", name: "孙云飞", type: "gov", status: "启用", createdAt: "2024-11-12" },
  { id: "A009", uid: "U10009", phone: "13900000001", name: "钱卫国", type: "enterprise", status: "启用", createdAt: "2025-01-08" },
  { id: "A010", uid: "U10010", phone: "13900000002", name: "罗婷婷", type: "enterprise", status: "启用", createdAt: "2025-01-15" },
  { id: "A011", uid: "U10011", phone: "13900000003", name: "林峰",   type: "enterprise", status: "启用", createdAt: "2025-02-03" },
  { id: "A012", uid: "U10012", phone: "13900000004", name: "夏婉清", type: "enterprise", status: "停用", createdAt: "2025-02-21" },
];


export const INITIAL_MEMBERSHIPS: Membership[] = [
  { id: "M001", accountId: "A001", orgId: "city", role: "admin" },
  { id: "M002", accountId: "A002", orgId: "city", role: "deputy" },
  { id: "M003", accountId: "A003", orgId: "dept-monitor", role: "admin" },
  { id: "M004", accountId: "A004", orgId: "dept-monitor", role: "user" },
  { id: "M005", accountId: "A003", orgId: "dept-inspect", role: "deputy" },
  { id: "M006", accountId: "A005", orgId: "d-pudong", role: "admin" },
  { id: "M007", accountId: "A006", orgId: "d-huangpu", role: "admin" },
  { id: "M008", accountId: "A008", orgId: "p-zhangjiang", role: "admin" },
  { id: "M009", accountId: "A007", orgId: "p-zhangjiang", role: "user" },
];

// ===== 企业账号绑定（账号 ↔ 企业，多对多）=====
export interface EnterpriseMembership {
  id: string;
  accountId: string;
  enterpriseId: string;
  role: RoleId;
}

export const INITIAL_ENTERPRISE_MEMBERSHIPS: EnterpriseMembership[] = [
  { id: "EM01", accountId: "A001", enterpriseId: "E001", role: "admin" },
  { id: "EM02", accountId: "A004", enterpriseId: "E001", role: "user" },
  { id: "EM03", accountId: "A002", enterpriseId: "E002", role: "admin" },
  { id: "EM04", accountId: "A003", enterpriseId: "E003", role: "admin" },
  { id: "EM05", accountId: "A005", enterpriseId: "E004", role: "admin" },
  { id: "EM06", accountId: "A006", enterpriseId: "E008", role: "admin" },
  { id: "EM07", accountId: "A007", enterpriseId: "E010", role: "deputy" },
  { id: "EM08", accountId: "A008", enterpriseId: "E001", role: "user" },
  { id: "EM09", accountId: "A008", enterpriseId: "E005", role: "deputy" },
];

