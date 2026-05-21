// 组织架构树模型 —— 一级(市)/科室 + 二级(区) + 三级(园区)
export type OrgLevel = "city" | "dept" | "district" | "park";

export interface OrgNode {
  id: string;
  name: string;
  level: OrgLevel;
  address?: string;
  children?: OrgNode[];
}

// 基于附件架构图初始化
export const INITIAL_ORG_TREE: OrgNode = {
  id: "city",
  name: "上海市节能中心",
  level: "city",
  address: "上海市黄浦区中山南路100号",
  children: [
    {
      id: "dept-office",
      name: "综合办公室",
      level: "dept",
      address: "上海市节能中心 3 楼",
    },
    {
      id: "dept-monitor",
      name: "能碳监测科",
      level: "dept",
      address: "上海市节能中心 4 楼",
    },
    {
      id: "dept-inspect",
      name: "节能监察科",
      level: "dept",
      address: "上海市节能中心 5 楼",
    },
    {
      id: "dept-manage",
      name: "能碳管理科",
      level: "dept",
      address: "上海市节能中心 6 楼",
    },
    {
      id: "dept-promo",
      name: "宣教推广科",
      level: "dept",
      address: "上海市节能中心 7 楼",
    },
    {
      id: "d-pudong",
      name: "浦东新区",
      level: "district",
      address: "浦东新区世纪大道2001号",
      children: [
        { id: "p-zhangjiang", name: "张江高科技园区", level: "park", address: "浦东新区张江路665号" },
        { id: "p-jinqiao", name: "金桥开发区", level: "park", address: "浦东新区金桥路1198号" },
        { id: "p-lingang", name: "临港新片区", level: "park", address: "浦东新区南汇新城环湖西二路" },
      ],
    },
    {
      id: "d-huangpu",
      name: "黄浦区",
      level: "district",
      address: "黄浦区延安东路300号",
      children: [
        { id: "p-bund", name: "外滩金融集聚区", level: "park", address: "黄浦区中山东一路" },
        { id: "p-yuyuan", name: "豫园商城片区", level: "park", address: "黄浦区福佑路" },
      ],
    },
    {
      id: "d-xuhui",
      name: "徐汇区",
      level: "district",
      address: "徐汇区漕溪北路336号",
      children: [
        { id: "p-caohejing", name: "漕河泾开发区", level: "park", address: "徐汇区桂平路" },
        { id: "p-xhbinjiang", name: "徐汇滨江园区", level: "park", address: "徐汇区龙腾大道" },
      ],
    },
    {
      id: "d-changning",
      name: "长宁区",
      level: "district",
      address: "长宁区愚园路1320号",
      children: [
        { id: "p-hongqiao", name: "虹桥临空经济园区", level: "park", address: "长宁区临空经济园" },
        { id: "p-zhongshan", name: "中山公园商圈", level: "park", address: "长宁区长宁路" },
      ],
    },
    {
      id: "d-jingan",
      name: "静安区",
      level: "district",
      address: "静安区常德路370号",
      children: [
        { id: "p-shibei", name: "市北高新园区", level: "park", address: "静安区共和新路" },
        { id: "p-suhewan", name: "苏河湾片区", level: "park", address: "静安区天目西路" },
      ],
    },
    {
      id: "d-putuo",
      name: "普陀区",
      level: "district",
      address: "普陀区大渡河路1668号",
      children: [
        { id: "p-taopu", name: "桃浦智创城", level: "park", address: "普陀区桃浦路" },
        { id: "p-changfeng", name: "长风生态商务区", level: "park", address: "普陀区云岭东路" },
      ],
    },
    {
      id: "d-chongming",
      name: "崇明区",
      level: "district",
      address: "崇明区城桥镇人民路",
      children: [
        { id: "p-changxing", name: "长兴岛产业园区", level: "park", address: "崇明区长兴岛" },
        { id: "p-cmindustrial", name: "崇明工业园区", level: "park", address: "崇明区港西镇" },
      ],
    },
  ],
};

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

// 工具：递归遍历
export function visitOrg(node: OrgNode, fn: (n: OrgNode, parent?: OrgNode) => void, parent?: OrgNode) {
  fn(node, parent);
  node.children?.forEach((c) => visitOrg(c, fn, node));
}

export function findOrg(root: OrgNode, id: string): OrgNode | undefined {
  if (root.id === id) return root;
  for (const c of root.children ?? []) {
    const r = findOrg(c, id);
    if (r) return r;
  }
}

export function updateOrg(root: OrgNode, id: string, patch: Partial<OrgNode>): OrgNode {
  if (root.id === id) return { ...root, ...patch };
  return { ...root, children: root.children?.map((c) => updateOrg(c, id, patch)) };
}

export function addChildOrg(root: OrgNode, parentId: string, child: OrgNode): OrgNode {
  if (root.id === parentId) {
    return { ...root, children: [...(root.children ?? []), child] };
  }
  return { ...root, children: root.children?.map((c) => addChildOrg(c, parentId, child)) };
}

export function removeOrg(root: OrgNode, id: string): OrgNode {
  return {
    ...root,
    children: root.children?.filter((c) => c.id !== id).map((c) => removeOrg(c, id)),
  };
}

// 收集所有节点（用于账号绑定身份的下拉列表）
export function flattenOrg(root: OrgNode): OrgNode[] {
  const list: OrgNode[] = [];
  visitOrg(root, (n) => list.push(n));
  return list;
}
