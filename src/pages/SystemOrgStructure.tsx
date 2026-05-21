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
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  INITIAL_ORG_TREE,
  LEVEL_BADGE_CLASS,
  LEVEL_LABEL,
  OrgLevel,
  OrgNode,
  addChildOrg,
  findOrg,
  removeOrg,
  updateOrg,
  visitOrg,
} from "@/components/system/orgTreeData";

const LEVEL_ICON: Record<OrgLevel, typeof Building2> = {
  city: Building2,
  dept: Factory,
  district: MapPin,
  park: TreePine,
};

const CHILD_LEVEL: Record<OrgLevel, OrgLevel | null> = {
  city: "district", // 默认新增区；通过对话框可改为科室
  dept: null,
  district: "park",
  park: null,
};

function genId(level: OrgLevel) {
  return `${level}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function SystemOrgStructure() {
  const [tree, setTree] = useState<OrgNode>(INITIAL_ORG_TREE);
  const [selectedId, setSelectedId] = useState<string>(tree.id);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    visitOrg(tree, (n) => {
      if (n.level === "city" || n.level === "district") s.add(n.id);
    });
    return s;
  });
  const [query, setQuery] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OrgNode | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [addParent, setAddParent] = useState<OrgNode | null>(null);
  const [addLevel, setAddLevel] = useState<OrgLevel>("district");
  const [addName, setAddName] = useState("");
  const [addAddress, setAddAddress] = useState("");

  const selected = useMemo(() => findOrg(tree, selectedId) ?? tree, [tree, selectedId]);

  const stats = useMemo(() => {
    const m: Record<OrgLevel, number> = { city: 0, dept: 0, district: 0, park: 0 };
    visitOrg(tree, (n) => (m[n.level] += 1));
    return m;
  }, [tree]);

  const toggle = (id: string) =>
    setExpanded((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const openEdit = (n: OrgNode) => {
    setEditTarget(n);
    setEditName(n.name);
    setEditAddress(n.address ?? "");
    setEditOpen(true);
  };
  const submitEdit = () => {
    if (!editTarget) return;
    const v = editName.trim();
    if (!v) return toast({ title: "名称不能为空", variant: "destructive" });
    setTree((t) => updateOrg(t, editTarget.id, { name: v, address: editAddress.trim() }));
    toast({ title: "已更新", description: v });
    setEditOpen(false);
  };

  const openAdd = (parent: OrgNode) => {
    setAddParent(parent);
    // 市级下默认新增"区级"；如需科室可在对话框切换
    const def: OrgLevel = parent.level === "city" ? "district" : (CHILD_LEVEL[parent.level] ?? "park");
    setAddLevel(def);
    setAddName("");
    setAddAddress("");
    setAddOpen(true);
  };
  const submitAdd = () => {
    if (!addParent) return;
    const v = addName.trim();
    if (!v) return toast({ title: "名称不能为空", variant: "destructive" });
    const node: OrgNode = {
      id: genId(addLevel),
      name: v,
      level: addLevel,
      address: addAddress.trim(),
    };
    setTree((t) => addChildOrg(t, addParent.id, node));
    setExpanded((p) => new Set(p).add(addParent.id));
    toast({ title: "已新增", description: `${LEVEL_LABEL[addLevel]} · ${v}` });
    setAddOpen(false);
  };

  const handleDelete = (n: OrgNode) => {
    if (n.level === "city") {
      return toast({ title: "市级中心不可删除", variant: "destructive" });
    }
    if ((n.children?.length ?? 0) > 0) {
      return toast({
        title: "无法删除",
        description: `「${n.name}」下还有 ${n.children!.length} 个子节点，请先迁移或删除`,
        variant: "destructive",
      });
    }
    if (!window.confirm(`确认删除「${n.name}」？此操作不可恢复。`)) return;
    setTree((t) => removeOrg(t, n.id));
    if (selectedId === n.id) setSelectedId(tree.id);
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
            aria-label="toggle"
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
            className="flex flex-1 items-center gap-2 py-1.5 text-left"
          >
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate">{n.name}</span>
            <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5", LEVEL_BADGE_CLASS[n.level])}>
              {LEVEL_LABEL[n.level]}
            </Badge>
          </button>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {canAdd && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => openAdd(n)}
                title="新增下级"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => openEdit(n)}
              title="编辑"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {n.level !== "city" && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => handleDelete(n)}
                title="删除"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        {hasChildren && isOpen && (
          <div>{n.children!.map((c) => renderNode(c, depth + 1))}</div>
        )}
      </div>
    );
  };

  const SelectedIcon = LEVEL_ICON[selected.level];

  return (
    <AppLayout title="组织架构管理" subtitle="维护市-科室/区-园区三级组织树（仅市级管理员可编辑）">
      {/* 统计 */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["city", "dept", "district", "park"] as OrgLevel[]).map((lv) => {
          const Icon = LEVEL_ICON[lv];
          return (
            <Card key={lv} className="border-border/60">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-lg inline-flex items-center justify-center", LEVEL_BADGE_CLASS[lv])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{LEVEL_LABEL[lv]}</div>
                  <div className="text-xl font-semibold">{stats[lv]}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
              <Button size="sm" className="h-8" onClick={() => openAdd(tree)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> 新增下级
              </Button>
            </div>
            <div className="max-h-[640px] overflow-auto pr-1">
              {renderNode(tree)}
            </div>
          </CardContent>
        </Card>

        {/* 右：详情 */}
        <Card className="col-span-12 lg:col-span-5 border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("h-10 w-10 rounded-lg inline-flex items-center justify-center", LEVEL_BADGE_CLASS[selected.level])}>
                <SelectedIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold">{selected.name}</div>
                <Badge variant="outline" className={cn("text-[10px] mt-0.5", LEVEL_BADGE_CLASS[selected.level])}>
                  {LEVEL_LABEL[selected.level]}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="h-8" onClick={() => openEdit(selected)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> 编辑
              </Button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">组织名称</Label>
                <div className="mt-1">{selected.name}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">地址</Label>
                <div className="mt-1 text-muted-foreground">{selected.address || "—"}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">下级节点</Label>
                <div className="mt-1 text-muted-foreground">
                  {selected.children?.length ?? 0} 个
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              说明：科室与区/园区为业务条线与行政条线，二者不进行硬绑定；在分配任务或数据流转时，通过"业务规则"进行网状关联。
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 编辑 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑组织</DialogTitle>
            <DialogDescription>修改组织名称与地址等基础信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">名称</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">地址</Label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={submitEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增 */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增下级组织</DialogTitle>
            <DialogDescription>
              父级：<span className="text-foreground">{addParent?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {addParent?.level === "city" && (
              <div>
                <Label className="text-xs">层级</Label>
                <div className="mt-1 flex gap-2">
                  {(["dept", "district"] as OrgLevel[]).map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setAddLevel(lv)}
                      className={cn(
                        "h-8 px-3 rounded-md border text-xs",
                        addLevel === lv
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground",
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
    </AppLayout>
  );
}
