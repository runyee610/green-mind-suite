import { useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Factory,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  TreePine,
  Search,
  UserCircle2,
  Network as NetworkIcon,
  Layers,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  INITIAL_ORG_FOREST,
  INITIAL_ACCOUNTS,
  INITIAL_MEMBERSHIPS,
  INITIAL_GROUPS,
  LEVEL_BADGE_CLASS,
  LEVEL_LABEL,
  OrgGroup,
  OrgLevel,
  OrgNode,
  ROLE_META,
  RoleId,
  addChildInForest,
  addRootToForest,
  findInForest,
  flattenForest,
  removeFromForest,
  updateInForest,
  visitOrg,
} from "@/components/system/orgTreeData";

const LEVEL_ICON: Record<OrgLevel, typeof Building2> = {
  city: Building2,
  dept: Factory,
  district: MapPin,
  park: TreePine,
};

const CHILD_LEVEL: Record<OrgLevel, OrgLevel | null> = {
  city: "district",
  dept: null,
  district: "park",
  park: null,
};

function genId(level: OrgLevel) {
  return `${level}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function SystemOrgStructure() {
  const [forest, setForest] = useState<OrgNode[]>(INITIAL_ORG_FOREST);
  const [selectedId, setSelectedId] = useState<string>(forest[0].id);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    forest.forEach((r) =>
      visitOrg(r, (n) => {
        if (n.level === "city" || n.level === "district") s.add(n.id);
      }),
    );
    return s;
  });
  const [query, setQuery] = useState("");

  // —— 账号/身份（只读展示，编辑入口跳转账号管理）
  const accounts = INITIAL_ACCOUNTS;
  const memberships = INITIAL_MEMBERSHIPS;

  // —— 集团
  const [groups, setGroups] = useState<OrgGroup[]>(INITIAL_GROUPS);

  // 对话框
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OrgNode | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  // parent === null 表示新增根（市级同级中心）
  const [addParent, setAddParent] = useState<OrgNode | null>(null);
  const [addLevel, setAddLevel] = useState<OrgLevel>("district");
  const [addName, setAddName] = useState("");
  const [addAddress, setAddAddress] = useState("");

  const [groupDlg, setGroupDlg] = useState<{ open: boolean; editing: OrgGroup | null }>({ open: false, editing: null });
  const [gName, setGName] = useState("");
  const [gIndustry, setGIndustry] = useState("");
  const [gAddress, setGAddress] = useState("");
  const [gRemark, setGRemark] = useState("");
  const [gCount, setGCount] = useState<number>(0);

  const selected = useMemo(() => findInForest(forest, selectedId) ?? forest[0], [forest, selectedId]);

  // 账号统计 by orgId
  const accountStats = useMemo(() => {
    const map: Record<string, { admin: number; deputy: number; user: number; total: number; rows: { acc: typeof accounts[number]; role: RoleId }[] }> = {};
    memberships.forEach((m) => {
      const slot = (map[m.orgId] ||= { admin: 0, deputy: 0, user: 0, total: 0, rows: [] });
      slot[m.role] += 1;
      slot.total += 1;
      const acc = accounts.find((a) => a.id === m.accountId);
      if (acc) slot.rows.push({ acc, role: m.role });
    });
    return map;
  }, [accounts, memberships]);

  const toggle = (id: string) =>
    setExpanded((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // ===== 组织 CRUD =====
  const openEdit = (n: OrgNode) => {
    setEditTarget(n); setEditName(n.name); setEditAddress(n.address ?? ""); setEditOpen(true);
  };
  const submitEdit = () => {
    if (!editTarget) return;
    const v = editName.trim();
    if (!v) return toast({ title: "名称不能为空", variant: "destructive" });
    setForest((f) => updateInForest(f, editTarget.id, { name: v, address: editAddress.trim() }));
    toast({ title: "已更新", description: v });
    setEditOpen(false);
  };

  const openAddChild = (parent: OrgNode) => {
    setAddParent(parent);
    const def: OrgLevel = parent.level === "city" ? "district" : (CHILD_LEVEL[parent.level] ?? "park");
    setAddLevel(def);
    setAddName(""); setAddAddress(""); setAddOpen(true);
  };
  // 同级（市级）中心
  const openAddSibling = () => {
    setAddParent(null);
    setAddLevel("city");
    setAddName(""); setAddAddress(""); setAddOpen(true);
  };
  const submitAdd = () => {
    const v = addName.trim();
    if (!v) return toast({ title: "名称不能为空", variant: "destructive" });
    const node: OrgNode = { id: genId(addLevel), name: v, level: addLevel, address: addAddress.trim() };
    if (addParent === null) {
      setForest((f) => addRootToForest(f, node));
      toast({ title: "已新增同级中心", description: v });
    } else {
      setForest((f) => addChildInForest(f, addParent.id, node));
      setExpanded((p) => new Set(p).add(addParent.id));
      toast({ title: "已新增", description: `${LEVEL_LABEL[addLevel]} · ${v}` });
    }
    setAddOpen(false);
  };

  const handleDelete = (n: OrgNode) => {
    if (n.level === "city" && forest.length === 1) {
      return toast({ title: "至少保留一个市级中心", variant: "destructive" });
    }
    if ((n.children?.length ?? 0) > 0) {
      return toast({
        title: "无法删除",
        description: `「${n.name}」下还有 ${n.children!.length} 个子节点,请先迁移或删除`,
        variant: "destructive",
      });
    }
    if (!window.confirm(`确认删除「${n.name}」？此操作不可恢复。`)) return;
    setForest((f) => removeFromForest(f, n.id));
    if (selectedId === n.id) setSelectedId(forest[0].id);
    toast({ title: "已删除", description: n.name });
  };

  const filterMatch = (n: OrgNode): boolean => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    if (n.name.toLowerCase().includes(q)) return true;
    return (n.children ?? []).some(filterMatch);
  };

  const renderNode = (n: OrgNode, depth = 0) => {
    if (!filterMatch(n)) return null;
    const Icon = LEVEL_ICON[n.level];
    const hasChildren = (n.children?.length ?? 0) > 0;
    const isOpen = expanded.has(n.id) || query.trim() !== "";
    const active = selectedId === n.id;
    const canAdd = n.level === "city" || n.level === "district";
    const stat = accountStats[n.id];
    return (
      <div key={n.id}>
        <div
          className={cn(
            "group flex items-center gap-1 rounded-md pr-2 hover:bg-muted/40 transition-colors",
            active && "bg-primary/10 ring-1 ring-primary/30",
          )}
          style={{ paddingLeft: depth * 16 + 4 }}
        >
          <button
            type="button"
            onClick={() => hasChildren && toggle(n.id)}
            className="h-7 w-5 inline-flex items-center justify-center text-muted-foreground"
          >
            {hasChildren ? (
              isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setSelectedId(n.id)}
            className="flex flex-1 items-center gap-2 py-1.5 text-left min-w-0"
          >
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate">{n.name}</span>
            <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5 shrink-0", LEVEL_BADGE_CLASS[n.level])}>
              {LEVEL_LABEL[n.level]}
            </Badge>
            {stat && stat.total > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <UserCircle2 className="h-3 w-3" />
                {stat.total}
                {stat.admin > 0 && <span className="text-primary">·管{stat.admin}</span>}
                {stat.deputy > 0 && <span className="text-amber-500">·副{stat.deputy}</span>}
                {stat.user > 0 && <span>·员{stat.user}</span>}
              </span>
            )}
          </button>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {canAdd && (
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openAddChild(n)} title="新增下级">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(n)} title="编辑">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon" variant="ghost"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => handleDelete(n)} title="删除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {hasChildren && isOpen && <div>{n.children!.map((c) => renderNode(c, depth + 1))}</div>}
      </div>
    );
  };

  const SelectedIcon = LEVEL_ICON[selected.level];
  const selStat = accountStats[selected.id];

  // ===== 集团 CRUD =====
  const openCreateGroup = () => {
    setGName(""); setGIndustry(""); setGAddress(""); setGRemark(""); setGCount(0);
    setGroupDlg({ open: true, editing: null });
  };
  const openEditGroup = (g: OrgGroup) => {
    setGName(g.name); setGIndustry(g.industry); setGAddress(g.address ?? "");
    setGRemark(g.remark ?? ""); setGCount(g.enterpriseCount);
    setGroupDlg({ open: true, editing: g });
  };
  const submitGroup = () => {
    if (!gName.trim()) return toast({ title: "集团名称不能为空", variant: "destructive" });
    const payload: OrgGroup = {
      id: groupDlg.editing?.id ?? `G${String(groups.length + 1).padStart(3, "0")}`,
      name: gName.trim(),
      industry: gIndustry.trim() || "未分类",
      address: gAddress.trim(),
      remark: gRemark.trim(),
      enterpriseCount: Math.max(0, Number(gCount) || 0),
    };
    if (groupDlg.editing) {
      setGroups((arr) => arr.map((x) => x.id === payload.id ? payload : x));
      toast({ title: "已更新集团" });
    } else {
      setGroups((arr) => [...arr, payload]);
      toast({ title: "已新增集团" });
    }
    setGroupDlg({ open: false, editing: null });
  };
  const deleteGroup = (g: OrgGroup) => {
    if (!window.confirm(`确认删除集团「${g.name}」？`)) return;
    setGroups((arr) => arr.filter((x) => x.id !== g.id));
    toast({ title: "已删除集团" });
  };

  return (
    <AppLayout title="组织架构管理" subtitle="行政条线（市-科室/区-园区）与集团条线 双轨管理">
      <Tabs defaultValue="hierarchy">
        <TabsList>
          <TabsTrigger value="hierarchy">
            <NetworkIcon className="h-3.5 w-3.5 mr-1" />
            行政架构
            <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">
              {forest.reduce((a, r) => a + 1 + (r.children?.length ?? 0), 0)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="group">
            <Layers className="h-3.5 w-3.5 mr-1" />
            集团管理
            <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">{groups.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ===== 行政架构 ===== */}
        <TabsContent value="hierarchy" className="mt-4">
          <div className="grid grid-cols-12 gap-4">
            {/* 左：树 */}
            <Card className="col-span-12 lg:col-span-7 border-border/60">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="搜索组织名称"
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <Button size="sm" variant="outline" className="h-8" onClick={openAddSibling}>
                    <Plus className="h-3.5 w-3.5 mr-1" />新增市级中心
                  </Button>
                </div>
                <div className="max-h-[640px] overflow-auto pr-1 space-y-2">
                  {forest.map((root) => (
                    <div key={root.id} className="rounded-md border border-border/40 p-1">
                      {renderNode(root)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 右：详情 + 账号情况 */}
            <Card className="col-span-12 lg:col-span-5 border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn("h-10 w-10 rounded-lg inline-flex items-center justify-center", LEVEL_BADGE_CLASS[selected.level])}>
                    <SelectedIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold truncate">{selected.name}</div>
                    <Badge variant="outline" className={cn("text-[10px] mt-0.5", LEVEL_BADGE_CLASS[selected.level])}>
                      {LEVEL_LABEL[selected.level]}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="h-8" onClick={() => openEdit(selected)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />编辑
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">地址</Label>
                    <div className="mt-1 text-muted-foreground">{selected.address || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">下级节点</Label>
                    <div className="mt-1 text-muted-foreground">{selected.children?.length ?? 0} 个</div>
                  </div>
                </div>

                {/* 账号情况 */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">账号情况</span>
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{selStat?.total ?? 0}</Badge>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                      <a href="/system/users">前往账号管理 →</a>
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(["admin", "deputy", "user"] as RoleId[]).map((r) => (
                      <div key={r} className={cn("rounded-md border p-2 text-center", ROLE_META[r].cls)}>
                        <div className="text-[10px] opacity-80">{ROLE_META[r].label}</div>
                        <div className="text-lg font-bold tabular-nums">{selStat?.[r] ?? 0}</div>
                      </div>
                    ))}
                  </div>
                  {selStat && selStat.rows.length > 0 ? (
                    <div className="rounded-md border border-border/60 divide-y divide-border/60 max-h-48 overflow-auto">
                      {selStat.rows.map(({ acc, role }) => (
                        <div key={`${acc.id}-${role}`} className="flex items-center gap-2 px-3 py-1.5 text-xs">
                          <UserCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{acc.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{acc.phone}</span>
                          <Badge variant="outline" className={cn("ml-auto text-[10px]", ROLE_META[role].cls)}>
                            {ROLE_META[role].label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-4 rounded-md bg-muted/30">
                      该组织尚无账号绑定
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== 集团管理 ===== */}
        <TabsContent value="group" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">集团列表</span>
                <span className="text-xs text-muted-foreground">独立于行政架构,按企业归属集团统一管理</span>
                <div className="ml-auto">
                  <Button size="sm" className="h-8" onClick={openCreateGroup}>
                    <Plus className="h-3.5 w-3.5 mr-1" />新增集团
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>集团名称</TableHead>
                    <TableHead>所属行业</TableHead>
                    <TableHead>下属企业数</TableHead>
                    <TableHead>地址</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{g.industry}</Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">{g.enterpriseCount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{g.address || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{g.remark || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditGroup(g)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteGroup(g)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* —— 编辑组织 —— */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑组织</DialogTitle>
            <DialogDescription>修改组织名称与地址等基础信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">名称</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">地址</Label><Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={submitEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* —— 新增组织 —— */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{addParent === null ? "新增市级中心（同级）" : "新增下级组织"}</DialogTitle>
            <DialogDescription>
              {addParent === null
                ? "新增一个与「上海市节能中心」同级的中心节点"
                : <>父级：<span className="text-foreground">{addParent?.name}</span></>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {addParent?.level === "city" && (
              <div>
                <Label className="text-xs">层级</Label>
                <div className="mt-1 flex gap-2">
                  {(["dept", "district"] as OrgLevel[]).map((lv) => (
                    <button
                      key={lv} type="button" onClick={() => setAddLevel(lv)}
                      className={cn(
                        "h-8 px-3 rounded-md border text-xs",
                        addLevel === lv ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {LEVEL_LABEL[lv]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs">名称</Label>
              <Input value={addName} onChange={(e) => setAddName(e.target.value)} className="mt-1" placeholder={`请输入${LEVEL_LABEL[addLevel]}名称`} />
            </div>
            <div>
              <Label className="text-xs">地址</Label>
              <Input value={addAddress} onChange={(e) => setAddAddress(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
            <Button onClick={submitAdd}>新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* —— 集团对话框 —— */}
      <Dialog open={groupDlg.open} onOpenChange={(o) => setGroupDlg((s) => ({ ...s, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{groupDlg.editing ? "编辑集团" : "新增集团"}</DialogTitle>
            <DialogDescription>集团独立于行政架构,用于按集团维度组织企业</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label className="text-xs">集团名称</Label><Input value={gName} onChange={(e) => setGName(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">所属行业</Label><Input value={gIndustry} onChange={(e) => setGIndustry(e.target.value)} className="mt-1" placeholder="如 钢铁冶金" /></div>
            <div><Label className="text-xs">下属企业数</Label><Input type="number" value={gCount} onChange={(e) => setGCount(Number(e.target.value))} className="mt-1" /></div>
            <div className="col-span-2"><Label className="text-xs">地址</Label><Input value={gAddress} onChange={(e) => setGAddress(e.target.value)} className="mt-1" /></div>
            <div className="col-span-2"><Label className="text-xs">备注</Label><Input value={gRemark} onChange={(e) => setGRemark(e.target.value)} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDlg({ open: false, editing: null })}>取消</Button>
            <Button onClick={submitGroup}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
