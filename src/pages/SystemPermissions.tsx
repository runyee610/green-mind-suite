import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  ChevronRight,
  ChevronDown,
  Save,
  Info,
  Building2,
  Network,
  FolderTree,
  FileText,
  MousePointerClick,
  Hash,
  Users as UsersIcon,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ===== 角色 =====
type Role = {
  id: string;
  name: string;
  scope: string;
  userCount: number;
  desc: string;
};

const ROLES: Role[] = [
  { id: "city_admin", name: "市管理员", scope: "市级", userCount: 4, desc: "市级管理与全域查看" },
  { id: "liaison", name: "对口人", scope: "跨级", userCount: 12, desc: "对口企业沟通与数据复核" },
  { id: "district_admin", name: "区管理员", scope: "区级", userCount: 8, desc: "本区行政范围管理" },
  { id: "park_admin", name: "园区管理员", scope: "园区", userCount: 16, desc: "园区企业及设施管理" },
  { id: "group_admin", name: "集团管理员", scope: "集团", userCount: 6, desc: "本集团产权下属企业管理" },
  { id: "enterprise_admin", name: "企业管理员", scope: "企业", userCount: 320, desc: "本企业自助管理" },
];

// ===== 资源树（页面 / 操作 / 字段） =====
type ResourceNode = {
  id: string;
  name: string;
  kind: "page" | "action" | "field";
  children?: ResourceNode[];
};

const RESOURCES: ResourceNode[] = [
  {
    id: "p_dashboard",
    name: "全景监测",
    kind: "page",
    children: [
      { id: "a_dashboard_view", name: "查看", kind: "action", children: [
        { id: "f_dashboard_carbon", name: "碳排实时数据", kind: "field" },
        { id: "f_dashboard_alarm", name: "告警明细", kind: "field" },
      ]},
      { id: "a_dashboard_export", name: "导出", kind: "action" },
    ],
  },
  {
    id: "p_report_monthly",
    name: "节能月报",
    kind: "page",
    children: [
      { id: "a_rm_view", name: "查看", kind: "action" },
      { id: "a_rm_edit", name: "编辑", kind: "action", children: [
        { id: "f_rm_sensitive", name: "敏感能耗数据", kind: "field" },
        { id: "f_rm_remark", name: "备注", kind: "field" },
      ]},
      { id: "a_rm_export", name: "导出", kind: "action" },
      { id: "a_rm_audit", name: "审核", kind: "action" },
    ],
  },
  {
    id: "p_report_yearly",
    name: "节能年报",
    kind: "page",
    children: [
      { id: "a_ry_view", name: "查看", kind: "action" },
      { id: "a_ry_export", name: "导出", kind: "action" },
    ],
  },
  {
    id: "p_quota",
    name: "能源限额",
    kind: "page",
    children: [
      { id: "a_q_view", name: "查看", kind: "action" },
      { id: "a_q_declare", name: "限额申报", kind: "action" },
      { id: "a_q_audit", name: "限额审核", kind: "action" },
    ],
  },
  {
    id: "p_archives",
    name: "节能档案",
    kind: "page",
    children: [
      { id: "a_ar_view", name: "查看", kind: "action" },
      { id: "a_ar_upload", name: "上传", kind: "action" },
    ],
  },
  {
    id: "p_enterprise",
    name: "企业管理",
    kind: "page",
    children: [
      { id: "a_e_view", name: "查看", kind: "action", children: [
        { id: "f_e_legal", name: "法人代表", kind: "field" },
        { id: "f_e_contact_phone", name: "联系人电话", kind: "field" },
      ]},
      { id: "a_e_edit", name: "编辑", kind: "action" },
    ],
  },
  {
    id: "p_system",
    name: "系统管理",
    kind: "page",
    children: [
      { id: "a_s_users", name: "用户管理", kind: "action" },
      { id: "a_s_perm", name: "权限配置", kind: "action" },
    ],
  },
];

// ===== 组织树 =====
type OrgNode = { id: string; name: string; children?: OrgNode[] };

const ADMIN_TREE: OrgNode[] = [
  {
    id: "city_sh",
    name: "上海市",
    children: [
      {
        id: "d_pd",
        name: "浦东新区",
        children: [
          { id: "park_zj", name: "张江园区", children: [
            { id: "ent_zj_a", name: "张江A企业" },
            { id: "ent_zj_b", name: "张江B企业" },
          ]},
          { id: "park_jq", name: "金桥园区", children: [
            { id: "ent_jq_a", name: "金桥A企业" },
          ]},
        ],
      },
      {
        id: "d_mh",
        name: "闵行区",
        children: [
          { id: "park_zb", name: "紫竹园区", children: [
            { id: "ent_zb_a", name: "紫竹A企业" },
          ]},
        ],
      },
    ],
  },
];

const PROPERTY_TREE: OrgNode[] = [
  {
    id: "g_baowu",
    name: "宝武集团",
    children: [
      { id: "g_baowu_e1", name: "宝钢股份" },
      { id: "g_baowu_e2", name: "宝武炭材" },
      { id: "g_baowu_e3", name: "宝武新能源" },
    ],
  },
  {
    id: "g_huayi",
    name: "华谊集团",
    children: [
      { id: "g_huayi_e1", name: "华谊化工" },
      { id: "g_huayi_e2", name: "华谊新材料" },
    ],
  },
  {
    id: "g_shangshi",
    name: "上实集团",
    children: [
      { id: "g_shangshi_e1", name: "上实环境" },
      { id: "g_shangshi_e2", name: "上实医药" },
    ],
  },
];

// ===== 默认权限快照（按角色） =====
const DEFAULT_PERMS: Record<string, string[]> = {
  city_admin: collectAllIds(RESOURCES),
  district_admin: ["p_report_monthly","a_rm_view","a_rm_export","a_rm_audit","p_report_yearly","a_ry_view","a_ry_export","p_quota","a_q_view","a_q_audit","p_enterprise","a_e_view","p_dashboard","a_dashboard_view","f_dashboard_carbon","f_dashboard_alarm"],
  park_admin: ["p_dashboard","a_dashboard_view","f_dashboard_alarm","p_report_monthly","a_rm_view","a_rm_export","p_enterprise","a_e_view"],
  group_admin: ["p_dashboard","a_dashboard_view","f_dashboard_carbon","p_report_monthly","a_rm_view","a_rm_export","p_report_yearly","a_ry_view","p_enterprise","a_e_view"],
  enterprise_admin: ["p_report_monthly","a_rm_view","a_rm_edit","f_rm_remark","p_report_yearly","a_ry_view","p_enterprise","a_e_view"],
  liaison: ["p_report_monthly","a_rm_view","a_rm_audit","p_enterprise","a_e_view"],
};

const DEFAULT_SCOPE: Record<string, { mode: "admin" | "property"; nodes: string[] }> = {
  city_admin: { mode: "admin", nodes: ["city_sh"] },
  district_admin: { mode: "admin", nodes: ["d_pd"] },
  park_admin: { mode: "admin", nodes: ["park_zj"] },
  group_admin: { mode: "property", nodes: ["g_baowu"] },
  enterprise_admin: { mode: "admin", nodes: ["ent_zj_a"] },
  liaison: { mode: "admin", nodes: ["d_pd", "d_mh"] },
};

function collectAllIds(nodes: ResourceNode[]): string[] {
  const ids: string[] = [];
  const walk = (ns: ResourceNode[]) => ns.forEach((n) => {
    ids.push(n.id);
    if (n.children) walk(n.children);
  });
  walk(nodes);
  return ids;
}

function collectOrgIds(nodes: OrgNode[]): string[] {
  const ids: string[] = [];
  const walk = (ns: OrgNode[]) => ns.forEach((n) => {
    ids.push(n.id);
    if (n.children) walk(n.children);
  });
  walk(nodes);
  return ids;
}

function filterTree<T extends { name: string; children?: T[] }>(nodes: T[], q: string): T[] {
  if (!q.trim()) return nodes;
  const lower = q.toLowerCase();
  const walk = (ns: T[]): T[] =>
    ns
      .map((n) => {
        const kids = n.children ? walk(n.children) : [];
        const hit = n.name.toLowerCase().includes(lower);
        if (hit || kids.length) return { ...n, children: kids } as T;
        return null;
      })
      .filter(Boolean) as T[];
  return walk(nodes);
}

// ===== 资源树渲染 =====
function ResourceTree({
  nodes,
  checked,
  onToggle,
  level = 0,
  expanded,
  toggleExpand,
}: {
  nodes: ResourceNode[];
  checked: Set<string>;
  onToggle: (id: string, checked: boolean, descendants: string[]) => void;
  level?: number;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
}) {
  return (
    <ul className={cn("space-y-1", level === 0 && "pl-0")}>
      {nodes.map((n) => {
        const hasChildren = !!n.children?.length;
        const open = expanded.has(n.id);
        const descendants = hasChildren ? collectAllIds(n.children!) : [];
        const Icon =
          n.kind === "page" ? FileText : n.kind === "action" ? MousePointerClick : Hash;
        return (
          <li key={n.id}>
            <div
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
              style={{ paddingLeft: 8 + level * 16 }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(n.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ) : (
                <span className="w-3.5" />
              )}
              <Checkbox
                checked={checked.has(n.id)}
                onCheckedChange={(v) => onToggle(n.id, !!v, descendants)}
              />
              <Icon
                className={cn(
                  "h-3.5 w-3.5",
                  n.kind === "page" && "text-primary",
                  n.kind === "action" && "text-foreground/70",
                  n.kind === "field" && "text-muted-foreground",
                )}
              />
              <span className="text-sm">{n.name}</span>
              <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                {n.kind === "page" ? "页面" : n.kind === "action" ? "操作" : "字段"}
              </Badge>
            </div>
            {hasChildren && open && (
              <ResourceTree
                nodes={n.children!}
                checked={checked}
                onToggle={onToggle}
                level={level + 1}
                expanded={expanded}
                toggleExpand={toggleExpand}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ===== 组织树渲染 =====
function OrgTree({
  nodes,
  checked,
  onToggle,
  expanded,
  toggleExpand,
  level = 0,
}: {
  nodes: OrgNode[];
  checked: Set<string>;
  onToggle: (id: string, checked: boolean, descendants: string[]) => void;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
  level?: number;
}) {
  return (
    <ul className="space-y-1">
      {nodes.map((n) => {
        const hasChildren = !!n.children?.length;
        const open = expanded.has(n.id);
        const descendants = hasChildren ? collectOrgIds(n.children!) : [];
        return (
          <li key={n.id}>
            <div
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
              style={{ paddingLeft: 8 + level * 16 }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(n.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ) : (
                <span className="w-3.5" />
              )}
              <Checkbox
                checked={checked.has(n.id)}
                onCheckedChange={(v) => onToggle(n.id, !!v, descendants)}
              />
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{n.name}</span>
            </div>
            {hasChildren && open && (
              <OrgTree
                nodes={n.children!}
                checked={checked}
                onToggle={onToggle}
                expanded={expanded}
                toggleExpand={toggleExpand}
                level={level + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ===== 主页面 =====
export default function SystemPermissions() {
  const [activeRole, setActiveRole] = useState<string>(ROLES[0].id);
  const [roleQuery, setRoleQuery] = useState("");

  // 功能权限：每个角色一份
  const [permsByRole, setPermsByRole] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    ROLES.forEach((r) => (init[r.id] = new Set(DEFAULT_PERMS[r.id] ?? [])));
    return init;
  });

  // 数据范围：每个角色一份
  const [scopeByRole, setScopeByRole] = useState<Record<string, { mode: "admin" | "property"; nodes: Set<string> }>>(
    () => {
      const init: Record<string, { mode: "admin" | "property"; nodes: Set<string> }> = {};
      ROLES.forEach((r) => {
        const d = DEFAULT_SCOPE[r.id] ?? { mode: "admin" as const, nodes: [] };
        init[r.id] = { mode: d.mode, nodes: new Set(d.nodes) };
      });
      return init;
    },
  );

  const [resourceQuery, setResourceQuery] = useState("");
  const [orgQuery, setOrgQuery] = useState("");
  const [resourceExpanded, setResourceExpanded] = useState<Set<string>>(
    () => new Set(RESOURCES.map((r) => r.id)),
  );
  const [orgExpanded, setOrgExpanded] = useState<Set<string>>(
    () => new Set([...collectOrgIds(ADMIN_TREE), ...collectOrgIds(PROPERTY_TREE)]),
  );

  const filteredRoles = useMemo(
    () => ROLES.filter((r) => r.name.toLowerCase().includes(roleQuery.toLowerCase())),
    [roleQuery],
  );
  const filteredResources = useMemo(() => filterTree(RESOURCES, resourceQuery), [resourceQuery]);

  const currentRole = ROLES.find((r) => r.id === activeRole)!;
  const currentPerms = permsByRole[activeRole];
  const currentScope = scopeByRole[activeRole];

  const orgTreeData = currentScope.mode === "admin" ? ADMIN_TREE : PROPERTY_TREE;
  const filteredOrg = useMemo(() => filterTree(orgTreeData, orgQuery), [orgQuery, orgTreeData]);

  const handleResourceToggle = (id: string, c: boolean, descendants: string[]) => {
    setPermsByRole((prev) => {
      const next = new Set(prev[activeRole]);
      const ids = [id, ...descendants];
      if (c) ids.forEach((i) => next.add(i));
      else ids.forEach((i) => next.delete(i));
      return { ...prev, [activeRole]: next };
    });
  };

  const handleOrgToggle = (id: string, c: boolean, descendants: string[]) => {
    setScopeByRole((prev) => {
      const cur = prev[activeRole];
      const next = new Set(cur.nodes);
      const ids = [id, ...descendants];
      if (c) ids.forEach((i) => next.add(i));
      else ids.forEach((i) => next.delete(i));
      return { ...prev, [activeRole]: { ...cur, nodes: next } };
    });
  };

  const handleScopeMode = (mode: "admin" | "property") => {
    setScopeByRole((prev) => ({
      ...prev,
      [activeRole]: { mode, nodes: new Set() },
    }));
  };

  const toggleResExpand = (id: string) =>
    setResourceExpanded((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleOrgExpand = (id: string) =>
    setOrgExpanded((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleSave = (kind: "perm" | "scope") => {
    toast({
      title: kind === "perm" ? "功能授权已保存" : "数据范围已保存",
      description: `角色「${currentRole.name}」配置已实时生效。`,
    });
  };

  return (
    <AppLayout title="权限配置中心" subtitle="角色 · 功能资源 · 数据域 三位一体">
      {/* 规则提示横幅 */}
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-foreground/90">
          <span className="font-medium text-primary">权限规则：</span>
          上级默认可见下级全部数据；如需对个别字段屏蔽，请在
          <Badge variant="outline" className="mx-1 text-[10px]">功能授权</Badge>
          中取消对应「字段」级勾选。
          <span className="ml-2 text-muted-foreground">
            示例：全景监测模块 + 集团管理员 → 仅本集团产权树下属节点可见。
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左侧：角色列表 */}
        <Card className="col-span-12 lg:col-span-3">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">角色列表</h3>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {ROLES.length}
              </Badge>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={roleQuery}
                onChange={(e) => setRoleQuery(e.target.value)}
                placeholder="搜索角色"
                className="h-8 pl-8 text-xs"
              />
            </div>
            <ScrollArea className="h-[560px] pr-2">
              <ul className="space-y-1.5">
                {filteredRoles.map((r) => {
                  const active = r.id === activeRole;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setActiveRole(r.id)}
                        className={cn(
                          "w-full text-left rounded-md border p-2.5 transition",
                          active
                            ? "border-primary/60 bg-primary/10 shadow-sm"
                            : "border-border/60 hover:bg-muted/40",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              active ? "bg-primary" : "bg-muted-foreground/40",
                            )}
                          />
                          <span className="text-sm font-medium">{r.name}</span>
                          <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 h-4">
                            {r.scope}
                          </Badge>
                        </div>
                        <div className="mt-1 ml-3.5 text-[11px] text-muted-foreground line-clamp-1">
                          {r.desc}
                        </div>
                        <div className="mt-1 ml-3.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <UsersIcon className="h-3 w-3" />
                          {r.userCount} 个账号
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 右侧：配置工作区 */}
        <Card className="col-span-12 lg:col-span-9">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-base font-semibold flex items-center gap-2">
                  {currentRole.name}
                  <Badge variant="outline" className="text-[10px]">{currentRole.scope}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{currentRole.desc}</div>
              </div>
            </div>

            <Tabs defaultValue="perm" className="w-full">
              <TabsList>
                <TabsTrigger value="perm">
                  <FolderTree className="h-3.5 w-3.5 mr-1.5" />
                  功能授权
                </TabsTrigger>
                <TabsTrigger value="scope">
                  <Network className="h-3.5 w-3.5 mr-1.5" />
                  数据域配置
                </TabsTrigger>
              </TabsList>

              {/* Tab 1：功能授权 */}
              <TabsContent value="perm" className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={resourceQuery}
                      onChange={(e) => setResourceQuery(e.target.value)}
                      placeholder="模糊搜索：页面 / 操作 / 字段"
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      已选 {currentPerms.size} 项
                    </Badge>
                    <Button size="sm" className="h-8" onClick={() => handleSave("perm")}>
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      保存并生效
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                  <div className="grid grid-cols-3 gap-2 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-primary" /> 页面
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MousePointerClick className="h-3 w-3" /> 操作
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> 字段
                    </div>
                  </div>
                  <ScrollArea className="h-[480px]">
                    <ResourceTree
                      nodes={filteredResources}
                      checked={currentPerms}
                      onToggle={handleResourceToggle}
                      expanded={resourceExpanded}
                      toggleExpand={toggleResExpand}
                    />
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* Tab 2：数据域配置 */}
              <TabsContent value="scope" className="mt-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-4 space-y-3">
                    <div className="rounded-lg border border-border/60 p-3">
                      <Label className="text-xs text-muted-foreground mb-2 block">作用域维度</Label>
                      <RadioGroup
                        value={currentScope.mode}
                        onValueChange={(v) => handleScopeMode(v as "admin" | "property")}
                        className="space-y-2"
                      >
                        <div className="flex items-start gap-2 rounded-md border border-border/40 p-2">
                          <RadioGroupItem value="admin" id="mode-admin" className="mt-1" />
                          <Label htmlFor="mode-admin" className="cursor-pointer flex-1">
                            <div className="text-sm font-medium">行政隶属树</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              市 → 区 → 园区 → 企业
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-start gap-2 rounded-md border border-border/40 p-2">
                          <RadioGroupItem value="property" id="mode-property" className="mt-1" />
                          <Label htmlFor="mode-property" className="cursor-pointer flex-1">
                            <div className="text-sm font-medium">产权归属树</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              集团 → 下属企业
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5" /> 配置示例
                      </div>
                      <div className="text-[11px] leading-relaxed text-foreground/80">
                        <span className="font-medium">全景监测</span> + 
                        <span className="font-medium"> 集团管理员</span> ＝
                        仅本集团 <span className="font-medium">产权树</span> 下属节点可见。
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                      <div className="text-xs text-muted-foreground mb-1">已选范围节点</div>
                      <div className="text-2xl font-semibold">{currentScope.nodes.size}</div>
                      <Button
                        size="sm"
                        className="mt-2 w-full h-8"
                        onClick={() => handleSave("scope")}
                      >
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        保存数据域
                      </Button>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-8">
                    <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Network className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold">
                          {currentScope.mode === "admin" ? "行政隶属树" : "产权归属树"}
                        </h4>
                        <div className="ml-auto relative w-48">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            value={orgQuery}
                            onChange={(e) => setOrgQuery(e.target.value)}
                            placeholder="模糊搜索节点"
                            className="h-8 pl-8 text-xs"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[440px]">
                        <OrgTree
                          nodes={filteredOrg}
                          checked={currentScope.nodes}
                          onToggle={handleOrgToggle}
                          expanded={orgExpanded}
                          toggleExpand={toggleOrgExpand}
                        />
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
