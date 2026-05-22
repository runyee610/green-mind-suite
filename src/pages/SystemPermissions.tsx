import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  Save,
  Info,
  Users as UsersIcon,
  Eye,
  Pencil,
  Download,
  CheckCircle2,
  Upload,
  Sparkles,
  RotateCcw,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Lock,
  HelpCircle,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  INITIAL_ORG_FOREST,
  INITIAL_GROUPS,
  INITIAL_ENTERPRISES,
  flattenForest,
  ROLE_META,
  type RoleId,
} from "@/components/system/orgTreeData";

// ===== 组织 + 角色 双选 =====
type OrgScope = "city" | "district" | "park" | "group" | "enterprise";

const SCOPE_LABEL: Record<OrgScope, string> = {
  city: "市级",
  district: "区级",
  park: "园区",
  group: "集团",
  enterprise: "企业",
};

const ORGS_FLAT = flattenForest(INITIAL_ORG_FOREST);
const DEPT_IDS = new Set(ORGS_FLAT.filter((o) => o.level === "dept").map((o) => o.id));
const SCOPE_OPTIONS: Record<OrgScope, { id: string; name: string }[]> = {
  city: [
    ...ORGS_FLAT.filter((o) => o.level === "city").map((o) => ({ id: o.id, name: o.name })),
    ...ORGS_FLAT.filter((o) => o.level === "dept").map((o) => ({ id: o.id, name: `└ ${o.name}` })),
  ],
  district: ORGS_FLAT.filter((o) => o.level === "district").map((o) => ({ id: o.id, name: o.name })),
  park: ORGS_FLAT.filter((o) => o.level === "park").map((o) => ({ id: o.id, name: o.name })),
  group: INITIAL_GROUPS.map((g) => ({ id: g.id, name: g.name })),
  enterprise: INITIAL_ENTERPRISES.map((e) => ({ id: e.id, name: e.name })),
};

const ROLE_OPTIONS: RoleId[] = ["admin", "deputy", "user"];

const SCOPE_ROLE_DEFAULTS: Record<OrgScope, Record<RoleId, string[]>> = {
  city: {
    admin: ["city_admin"],
    deputy: ["city_deputy"],
    user: ["dept_user"],
  },
  district: {
    admin: ["district_admin"],
    deputy: ["district_admin"],
    user: ["district_user"],
  },
  park: {
    admin: ["park_admin"],
    deputy: ["park_admin"],
    user: ["park_user"],
  },
  group: {
    admin: ["group_admin"],
    deputy: ["group_admin"],
    user: ["group_admin"],
  },
  enterprise: {
    admin: ["enterprise_admin"],
    deputy: ["enterprise_admin"],
    user: ["enterprise_user"],
  },
};







// ===== 资源（页面 → 操作 → 字段） =====
type ActionItem = {
  id: string;
  name: string;
  kind: "view" | "edit" | "export" | "audit" | "upload" | "other";
  desc: string;
  fields?: { id: string; name: string; sensitive?: boolean; desc?: string }[];
};

type PageItem = {
  id: string;
  name: string;
  desc: string;
  actions: ActionItem[];
};

const PAGES: PageItem[] = [
  {
    id: "p_dashboard",
    name: "全景监测",
    desc: "实时能耗与碳排监测大屏",
    actions: [
      {
        id: "a_dashboard_view", name: "查看", kind: "view", desc: "进入页面、浏览图表",
        fields: [
          { id: "f_dashboard_carbon", name: "碳排实时数据", sensitive: true, desc: "敏感：实时碳排放数据" },
          { id: "f_dashboard_alarm", name: "告警明细", desc: "告警事件清单" },
        ],
      },
      { id: "a_dashboard_export", name: "导出", kind: "export", desc: "导出图表与数据" },
    ],
  },
  {
    id: "p_report_monthly",
    name: "节能月报",
    desc: "企业月度能耗与碳排通过",
    actions: [
      { id: "a_rm_view", name: "查看", kind: "view", desc: "查看月报数据" },
      {
        id: "a_rm_edit", name: "编辑", kind: "edit", desc: "填报与修改月报",
        fields: [
          { id: "f_rm_sensitive", name: "敏感能耗数据", sensitive: true, desc: "敏感：核心能耗指标" },
          { id: "f_rm_remark", name: "备注", desc: "填报备注" },
        ],
      },
      { id: "a_rm_export", name: "导出", kind: "export", desc: "导出月报 Excel" },
      { id: "a_rm_audit", name: "审核", kind: "audit", desc: "审批与退回月报" },
    ],
  },
  {
    id: "p_report_yearly",
    name: "节能年报",
    desc: "年度节能与碳排统计",
    actions: [
      { id: "a_ry_view", name: "查看", kind: "view", desc: "查看年报数据" },
      { id: "a_ry_export", name: "导出", kind: "export", desc: "导出年报报表" },
    ],
  },
  {
    id: "p_quota",
    name: "能源限额",
    desc: "限额自评价与审核",
    actions: [
      { id: "a_q_view", name: "查看", kind: "view", desc: "查看限额情况" },
      { id: "a_q_declare", name: "限额自评价", kind: "edit", desc: "提交限额自评价" },
      { id: "a_q_audit", name: "限额审核", kind: "audit", desc: "审核限额自评价" },
    ],
  },
  {
    id: "p_archives",
    name: "节能档案",
    desc: "节能档案文件管理",
    actions: [
      { id: "a_ar_view", name: "查看", kind: "view", desc: "查看档案文件" },
      { id: "a_ar_upload", name: "上传", kind: "upload", desc: "上传档案附件" },
    ],
  },
  {
    id: "p_enterprise",
    name: "企业管理",
    desc: "企业基础信息与人员",
    actions: [
      {
        id: "a_e_view", name: "查看", kind: "view", desc: "查看企业信息",
        fields: [
          { id: "f_e_legal", name: "法人代表", sensitive: true, desc: "敏感：法人姓名" },
          { id: "f_e_contact_phone", name: "联系人电话", sensitive: true, desc: "敏感：联系电话" },
        ],
      },
      { id: "a_e_edit", name: "编辑", kind: "edit", desc: "修改企业信息" },
    ],
  },
  {
    id: "p_system",
    name: "系统管理",
    desc: "账号与权限管理",
    actions: [
      { id: "a_s_users", name: "账号管理", kind: "edit", desc: "管理系统账号" },
      { id: "a_s_perm", name: "权限配置", kind: "edit", desc: "配置角色权限" },
    ],
  },
];

function collectAllIds(): string[] {
  const ids: string[] = [];
  PAGES.forEach((p) => {
    ids.push(p.id);
    p.actions.forEach((a) => {
      ids.push(a.id);
      a.fields?.forEach((f) => ids.push(f.id));
    });
  });
  return ids;
}

function collectPageIds(p: PageItem): string[] {
  const ids: string[] = [p.id];
  p.actions.forEach((a) => {
    ids.push(a.id);
    a.fields?.forEach((f) => ids.push(f.id));
  });
  return ids;
}

function collectActionIds(a: ActionItem): string[] {
  return [a.id, ...(a.fields?.map((f) => f.id) ?? [])];
}

const DEFAULT_PERMS: Record<string, string[]> = {
  city_admin: collectAllIds(),
  city_deputy: ["p_dashboard","a_dashboard_view","f_dashboard_carbon","f_dashboard_alarm","a_dashboard_export","p_report_monthly","a_rm_view","a_rm_export","a_rm_audit","p_report_yearly","a_ry_view","a_ry_export","p_quota","a_q_view","a_q_audit","p_archives","a_ar_view","p_enterprise","a_e_view"],
  dept_admin: ["p_dashboard","a_dashboard_view","f_dashboard_alarm","p_report_monthly","a_rm_view","a_rm_export","a_rm_audit","p_quota","a_q_view","a_q_audit","p_enterprise","a_e_view"],
  dept_user: ["p_dashboard","a_dashboard_view","p_report_monthly","a_rm_view","p_enterprise","a_e_view"],
  district_admin: ["p_dashboard","a_dashboard_view","f_dashboard_carbon","f_dashboard_alarm","p_report_monthly","a_rm_view","a_rm_export","a_rm_audit","p_report_yearly","a_ry_view","a_ry_export","p_quota","a_q_view","a_q_audit","p_enterprise","a_e_view"],
  district_user: ["p_dashboard","a_dashboard_view","p_report_monthly","a_rm_view","p_enterprise","a_e_view"],
  park_admin: ["p_dashboard","a_dashboard_view","f_dashboard_alarm","p_report_monthly","a_rm_view","a_rm_export","p_enterprise","a_e_view"],
  park_user: ["p_dashboard","a_dashboard_view","p_report_monthly","a_rm_view","p_enterprise","a_e_view"],
  group_admin: ["p_dashboard","a_dashboard_view","f_dashboard_carbon","p_report_monthly","a_rm_view","a_rm_export","p_report_yearly","a_ry_view","p_enterprise","a_e_view"],
  enterprise_admin: ["p_report_monthly","a_rm_view","a_rm_edit","f_rm_remark","p_report_yearly","a_ry_view","p_enterprise","a_e_view","a_e_edit","p_archives","a_ar_view","a_ar_upload","p_quota","a_q_view","a_q_declare"],
  enterprise_user: ["p_report_monthly","a_rm_view","a_rm_edit","f_rm_remark","p_report_yearly","a_ry_view","p_enterprise","a_e_view","p_archives","a_ar_view","p_quota","a_q_view","a_q_declare"],
};

const ACTION_STYLES: Record<ActionItem["kind"], { icon: any; cls: string; activeCls: string }> = {
  view:   { icon: Eye,           cls: "border-border/60 text-foreground/80",   activeCls: "border-blue-500/60 bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  edit:   { icon: Pencil,        cls: "border-border/60 text-foreground/80",   activeCls: "border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  export: { icon: Download,      cls: "border-border/60 text-foreground/80",   activeCls: "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  audit:  { icon: CheckCircle2,  cls: "border-border/60 text-foreground/80",   activeCls: "border-purple-500/60 bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  upload: { icon: Upload,        cls: "border-border/60 text-foreground/80",   activeCls: "border-cyan-500/60 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  other:  { icon: Sparkles,      cls: "border-border/60 text-foreground/80",   activeCls: "border-primary/60 bg-primary/10 text-primary" },
};

export default function SystemPermissions() {
  // 第 1 步：组织类型 → 具体组织 → 角色 级联选择
  const [scope, setScope] = useState<OrgScope>("city");
  const [orgId, setOrgId] = useState<string>(SCOPE_OPTIONS.city[0]?.id ?? "");
  const [role, setRole] = useState<RoleId>("admin");
  const activeRole = `${scope}__${orgId}__${role}`;
  const orgName = SCOPE_OPTIONS[scope].find((o) => o.id === orgId)?.name ?? "";

  const [resourceQuery, setResourceQuery] = useState("");
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);

  const defaultsFor = (s: OrgScope, r: RoleId): string[] => {
    let keys = SCOPE_ROLE_DEFAULTS[s][r];
    if (s === "city" && DEPT_IDS.has(orgId)) {
      // 内设科室：使用科室角色默认权限
      keys = r === "user" ? ["dept_user"] : ["dept_admin"];
    }
    const merged = new Set<string>();
    keys.forEach((k) => DEFAULT_PERMS[k]?.forEach((id) => merged.add(id)));
    return Array.from(merged);
  };

  const [permsByRole, setPermsByRole] = useState<Record<string, Set<string>>>({});

  const filteredPages = useMemo(() => {
    const q = resourceQuery.trim().toLowerCase();
    if (!q) return PAGES;
    return PAGES.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true;
      return p.actions.some(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.fields?.some((f) => f.name.toLowerCase().includes(q)),
      );
    });
  }, [resourceQuery]);

  const currentRole = {
    name: `${orgName || SCOPE_LABEL[scope]} · ${ROLE_META[role].label}`,
    scope: SCOPE_LABEL[scope],
  };
  const currentPerms = permsByRole[activeRole] ?? new Set(defaultsFor(scope, role));
  const totalCount = collectAllIds().length;

  const guardSwitch = (apply: () => void) => {
    if (dirty) {
      const ok = window.confirm("当前角色有未保存的改动，切换将丢失。继续？");
      if (!ok) return;
    }
    apply();
    setDirty(false);
  };
  const onScopeChange = (s: OrgScope) =>
    guardSwitch(() => {
      setScope(s);
      setOrgId(SCOPE_OPTIONS[s][0]?.id ?? "");
    });
  const onOrgChange = (id: string) => guardSwitch(() => setOrgId(id));
  const onRoleChange = (r: RoleId) => guardSwitch(() => setRole(r));

  const toggleIds = (ids: string[], checked: boolean) => {
    setPermsByRole((prev) => {
      const base = prev[activeRole] ?? new Set(defaultsFor(scope, role));
      const next = new Set(base);
      if (checked) ids.forEach((i) => next.add(i));
      else ids.forEach((i) => next.delete(i));
      return { ...prev, [activeRole]: next };
    });
    setDirty(true);
  };

  const togglePage = (p: PageItem, checked: boolean) => toggleIds(collectPageIds(p), checked);
  const toggleAction = (p: PageItem, a: ActionItem, checked: boolean) => {
    const ids = collectActionIds(a);
    if (checked) ids.push(p.id);
    toggleIds(ids, checked);
  };
  const toggleField = (p: PageItem, a: ActionItem, fid: string, checked: boolean) => {
    const ids = [fid];
    if (checked) ids.push(a.id, p.id);
    toggleIds(ids, checked);
  };

  const pageState = (p: PageItem): "all" | "some" | "none" => {
    const acts = p.actions;
    const checkedActs = acts.filter((a) => currentPerms.has(a.id)).length;
    if (checkedActs === 0) return "none";
    if (checkedActs === acts.length) return "all";
    return "some";
  };

  const handleSelectAll = () => {
    setPermsByRole((prev) => ({ ...prev, [activeRole]: new Set(collectAllIds()) }));
    setDirty(true);
  };
  const handleClearAll = () => {
    setPermsByRole((prev) => ({ ...prev, [activeRole]: new Set() }));
    setDirty(true);
  };
  const handleResetDefault = () => {
    setPermsByRole((prev) => ({ ...prev, [activeRole]: new Set(defaultsFor(scope, role)) }));
    setDirty(true);
  };



  const handleSave = () => {
    toast({
      title: "已保存并生效",
      description: `角色「${currentRole.name}」共 ${currentPerms.size} 项权限已更新。`,
    });
    setDirty(false);
  };

  const toggleFieldsExpand = (aid: string) =>
    setExpandedFields((p) => {
      const n = new Set(p);
      n.has(aid) ? n.delete(aid) : n.add(aid);
      return n;
    });

  return (
    <TooltipProvider delayDuration={200}>
      <AppLayout title="权限配置中心" subtitle="给角色勾选可使用的页面与操作即可，三步完成配置">
        {/* 步骤引导 */}
        <div className="mb-4 flex items-center gap-2 text-xs">
          {[
            { n: 1, t: "选择组织与角色" },
            { n: 2, t: "勾选权限" },
            { n: 3, t: "保存生效" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1">
                <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-[10px] font-bold">
                  {s.n}
                </span>
                <span className="font-medium">{s.t}</span>
              </div>
              {i < 2 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            <span>上级默认可见下级全部数据；如需屏蔽敏感字段，请展开"高级"取消勾选。</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* 左侧：组织 + 角色 级联选择 */}
          <Card className="col-span-12 lg:col-span-3">
            <CardContent className="p-3 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">第 1 步 · 选择组织与角色</h3>
              </div>

              {/* 1) 组织层级 */}
              <div>
                <div className="text-[11px] text-muted-foreground mb-1.5">① 组织层级</div>
                <div className="grid grid-cols-5 gap-1">
                  {(Object.keys(SCOPE_LABEL) as OrgScope[]).map((s, idx, arr) => (
                    <div key={s} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => onScopeChange(s)}
                        className={cn(
                          "flex-1 h-7 rounded-md border text-[11px] font-medium transition",
                          scope === s
                            ? "border-primary/60 bg-primary/10 text-primary"
                            : "border-border/60 text-muted-foreground hover:bg-muted/40",
                        )}
                      >
                        {SCOPE_LABEL[s]}
                      </button>
                      {idx < arr.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2) 具体组织 */}
              <div>
                <div className="text-[11px] text-muted-foreground mb-1.5">
                  ② 选择{SCOPE_LABEL[scope]}组织
                </div>
                <Select value={orgId} onValueChange={onOrgChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={`请选择${SCOPE_LABEL[scope]}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOPE_OPTIONS[scope].map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs">
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3) 角色 */}
              <div>
                <div className="text-[11px] text-muted-foreground mb-1.5">③ 选择角色</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {ROLE_OPTIONS.map((r) => {
                    const active = r === role;
                    const meta = ROLE_META[r];
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onRoleChange(r)}
                        className={cn(
                          "h-8 rounded-md border text-xs font-medium transition",
                          active
                            ? "border-primary/60 bg-primary/10 text-primary shadow-sm"
                            : "border-border/60 text-foreground/80 hover:bg-muted/40",
                        )}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground line-clamp-2">
                  {ROLE_META[role].desc}
                </div>
              </div>

              {/* 选中结果摘要 */}
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-2.5">
                <div className="text-[10px] text-muted-foreground mb-1">当前配置对象</div>
                <div className="text-sm font-semibold">{orgName || "—"}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    {SCOPE_LABEL[scope]}
                  </Badge>
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/15 text-primary border-0">
                    {ROLE_META[role].label}
                  </Badge>
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <CheckSquare className="h-3 w-3" />
                    {currentPerms.size} 项
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 右侧：权限配置 */}
          <Card className="col-span-12 lg:col-span-9">
            <CardContent className="p-4">
              {/* 顶部操作条 */}
              <div className="flex flex-wrap items-center gap-3 mb-4 pb-3 border-b border-border/60">
                <div>
                  <div className="text-base font-semibold flex items-center gap-2">
                    第 2 步 · 为「{currentRole.name}」勾选权限
                    <Badge variant="outline" className="text-[10px]">{currentRole.scope}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    已勾选 <span className="text-primary font-medium">{currentPerms.size}</span> / {totalCount} 项
                    {dirty && <span className="ml-2 text-amber-500">● 未保存</span>}
                  </div>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={resourceQuery}
                      onChange={(e) => setResourceQuery(e.target.value)}
                      placeholder="搜索页面 / 操作"
                      className="h-8 w-48 pl-8 text-xs"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleSelectAll}>
                    <CheckSquare className="h-3.5 w-3.5 mr-1" /> 全选
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleClearAll}>
                    <Square className="h-3.5 w-3.5 mr-1" /> 清空
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleResetDefault}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> 恢复默认
                  </Button>
                  <Button size="sm" className="h-8" onClick={handleSave} disabled={!dirty}>
                    <Save className="h-3.5 w-3.5 mr-1" /> 第 3 步 · 保存生效
                  </Button>
                </div>
              </div>

              {/* 权限树 */}
              <div className="flex items-center gap-3 mb-2 px-2 text-[11px] text-muted-foreground">
                <span>图例：</span>
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3 text-blue-500" />查看</span>
                <span className="inline-flex items-center gap-1"><Pencil className="h-3 w-3 text-amber-500" />编辑</span>
                <span className="inline-flex items-center gap-1"><Download className="h-3 w-3 text-emerald-500" />导出</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-purple-500" />审核</span>
                <span className="inline-flex items-center gap-1"><Upload className="h-3 w-3 text-cyan-500" />上传</span>
                <span className="ml-auto inline-flex items-center gap-1"><Lock className="h-3 w-3" />含字段级控制</span>
              </div>
              <ScrollArea className="h-[560px] pr-2">
                <div className="rounded-lg border border-border/60 divide-y divide-border/60">
                  {filteredPages.map((p) => {
                    const state = pageState(p);
                    const expanded = expandedFields.has(p.id);
                    const checkedActs = p.actions.filter((a) => currentPerms.has(a.id)).length;
                    return (
                      <div key={p.id}>
                        {/* L1 页面行 */}
                        <div
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 hover:bg-muted/40 transition",
                            state === "all" && "bg-primary/[0.04]",
                            state === "some" && "bg-amber-500/[0.04]",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => toggleFieldsExpand(p.id)}
                            className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground"
                          >
                            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                          <Checkbox
                            checked={state === "all" ? true : state === "some" ? "indeterminate" : false}
                            onCheckedChange={(v) => togglePage(p, !!v)}
                            className="h-4 w-4"
                          />
                          <button
                            type="button"
                            onClick={() => toggleFieldsExpand(p.id)}
                            className="flex-1 min-w-0 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{p.name}</span>
                              <span className="text-[11px] text-muted-foreground truncate">{p.desc}</span>
                            </div>
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                              {checkedActs}/{p.actions.length}
                            </span>
                            {state === "all" && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/15 text-primary border-0">全部</Badge>
                            )}
                            {state === "some" && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/15 text-amber-600 border-0">部分</Badge>
                            )}
                          </div>
                        </div>

                        {/* L2 操作行 */}
                        {expanded && (
                          <div className="bg-muted/20 border-t border-border/40">
                            {p.actions.map((a) => {
                              const checked = currentPerms.has(a.id);
                              const style = ACTION_STYLES[a.kind];
                              const Icon = style.icon;
                              const hasFields = !!a.fields?.length;
                              const fOpen = expandedFields.has(a.id);
                              const checkedFields = a.fields?.filter((f) => currentPerms.has(f.id)).length ?? 0;
                              const totalFields = a.fields?.length ?? 0;
                              const fState: "all" | "some" | "none" = !hasFields
                                ? checked ? "all" : "none"
                                : checkedFields === 0
                                  ? "none"
                                  : checkedFields === totalFields
                                    ? "all"
                                    : "some";
                              return (
                                <div key={a.id}>
                                  <div className="flex items-center gap-2 pl-10 pr-3 py-2 hover:bg-muted/40 transition border-t border-border/30 first:border-t-0">
                                    {hasFields ? (
                                      <button
                                        type="button"
                                        onClick={() => toggleFieldsExpand(a.id)}
                                        className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground"
                                      >
                                        {fOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                      </button>
                                    ) : (
                                      <span className="h-5 w-5 inline-flex items-center justify-center text-muted-foreground/40">·</span>
                                    )}
                                    <Checkbox
                                      checked={fState === "all" ? true : fState === "some" ? "indeterminate" : false}
                                      onCheckedChange={(v) => toggleAction(p, a, !!v)}
                                      className="h-4 w-4"
                                    />
                                    <span
                                      className={cn(
                                        "inline-flex items-center justify-center h-5 w-5 rounded",
                                        checked ? style.activeCls : "text-muted-foreground",
                                      )}
                                    >
                                      <Icon className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="text-sm font-medium">{a.name}</span>
                                    <span className="text-[11px] text-muted-foreground truncate">{a.desc}</span>
                                    {hasFields && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                                        <Lock className="h-2.5 w-2.5 mr-0.5" />
                                        字段 {checkedFields}/{totalFields}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* L3 字段行 */}
                                  {hasFields && fOpen && (
                                    <div className="bg-background/60 border-t border-border/30">
                                      {a.fields!.map((f) => {
                                        const fchecked = currentPerms.has(f.id);
                                        return (
                                          <div
                                            key={f.id}
                                            className="flex items-center gap-2 pl-[68px] pr-3 py-1.5 hover:bg-muted/40 transition border-t border-border/20 first:border-t-0"
                                          >
                                            <Checkbox
                                              checked={fchecked}
                                              onCheckedChange={(v) => toggleField(p, a, f.id, !!v)}
                                              className="h-3.5 w-3.5"
                                            />
                                            <span className={cn("text-xs", !fchecked && "text-muted-foreground line-through")}>
                                              {f.name}
                                            </span>
                                            {f.sensitive && (
                                              <Badge className="text-[9px] px-1 py-0 h-3.5 bg-destructive/15 text-destructive border-0">
                                                敏感
                                              </Badge>
                                            )}
                                            {f.desc && (
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs">{f.desc}</TooltipContent>
                                              </Tooltip>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredPages.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-12">
                      未找到匹配的页面或操作
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </TooltipProvider>
  );
}
