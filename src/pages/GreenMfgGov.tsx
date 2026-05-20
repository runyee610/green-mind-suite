import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Eye, FileBarChart, Filter, Pencil, Plus, Search, Settings2, Trash2, XCircle, Clock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ALL_INDUSTRIES,
  INDUSTRY_TREE,
  DECLARATION_BATCHES,
  MOCK_DECLARATIONS,
  MOCK_DYNAMIC,
  dynamicStatusClass,
  stageBadgeClass,
} from "@/components/green-mfg/data";
import { GreenArchivePanel } from "@/components/green-mfg/GreenArchivePanel";
import { RiskWarningPanel } from "@/components/green-mfg/RiskWarningPanel";


/** Cascading industry filter: hover parent → reveals children on the right */
function IndustryCascadeFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hoverParent, setHoverParent] = useState<string | null>(null);

  const label = useMemo(() => {
    if (value === "all") return "全部行业";
    return value;
  }, [value]);

  const keyParents = INDUSTRY_TREE.filter((n) => n.type === "重点行业");
  const otherParents = INDUSTRY_TREE.filter((n) => n.type !== "重点行业");
  const activeParent =
    INDUSTRY_TREE.find((p) => p.name === hoverParent) ??
    INDUSTRY_TREE.find((p) => p.name === value) ??
    INDUSTRY_TREE.find((p) => p.children.includes(value)) ??
    keyParents[0];

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const ParentRow = ({
    node,
  }: {
    node: (typeof INDUSTRY_TREE)[number];
  }) => {
    const isActive = activeParent?.name === node.name;
    const isSelected = value === node.name;
    return (
      <button
        type="button"
        onMouseEnter={() => setHoverParent(node.name)}
        onClick={() => select(node.name)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-xs transition",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
          isSelected && "font-semibold text-primary",
        )}
      >
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            node.type === "重点行业" ? "bg-warning" : "bg-muted-foreground/50",
          )}
        />
        <span className="flex-1 truncate">{node.name}</span>
        {node.children.length > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
      </button>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-52 justify-between text-xs font-normal"
        >
          <span className="inline-flex items-center gap-1 truncate">
            <Filter className="h-3 w-3 shrink-0" />
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[440px] p-0"
        onMouseLeave={() => setHoverParent(null)}
      >
        <div className="grid grid-cols-2 divide-x divide-border">
          {/* Parents */}
          <div className="max-h-80 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => select("all")}
              onMouseEnter={() => setHoverParent(null)}
              className={cn(
                "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent/60",
                value === "all" && "font-semibold text-primary",
              )}
            >
              全部行业
            </button>
            <div className="my-1 h-px bg-border/60" />
            <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-warning">
              重点行业
            </div>
            {keyParents.map((n) => (
              <ParentRow key={n.name} node={n} />
            ))}
            <div className="my-1 h-px bg-border/60" />
            <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              非重点行业
            </div>
            {otherParents.map((n) => (
              <ParentRow key={n.name} node={n} />
            ))}
          </div>
          {/* Children */}
          <div
            className="max-h-80 overflow-y-auto p-2"
            onMouseEnter={() => activeParent && setHoverParent(activeParent.name)}
          >
            {activeParent ? (
              <>
                <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {activeParent.name} · 细分
                </div>
                <button
                  type="button"
                  onClick={() => select(activeParent.name)}
                  className={cn(
                    "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent/60",
                    value === activeParent.name && "font-semibold text-primary",
                  )}
                >
                  全部 {activeParent.name}
                </button>
                {activeParent.children.length === 0 && (
                  <div className="px-2 py-3 text-[11px] text-muted-foreground">无细分行业</div>
                )}
                {activeParent.children.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => select(c)}
                    className={cn(
                      "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent/60",
                      value === c && "font-semibold text-primary",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
                悬浮左侧行业查看细分
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function GreenMfgGov({ section }: { section?: "declaration" | "dynamic" } = {}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>(section ?? "declaration");
  useEffect(() => {
    if (section) setTab(section);
  }, [section]);
  const [keyword, setKeyword] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [batches, setBatches] = useState<string[]>([...DECLARATION_BATCHES]);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  const declarations = MOCK_DECLARATIONS.filter((r) => {
    const k = keyword.trim();
    if (k && !r.enterpriseName.includes(k) && !r.creditCode.includes(k)) return false;
    if (stageFilter !== "all" && r.stage !== stageFilter) return false;
    if (industryFilter !== "all") {
      const node = INDUSTRY_TREE.find((i) => i.name === industryFilter);
      if (node) {
        if (r.industry !== industryFilter) return false;
      } else {
        // 选择的是细分行业
        const parent = INDUSTRY_TREE.find((i) => i.children.includes(industryFilter));
        if (!parent) return false;
        if (r.industry !== parent.name) return false;
        if ((r as { subIndustry?: string }).subIndustry && (r as { subIndustry?: string }).subIndustry !== industryFilter) return false;
      }
    }
    if (batchFilter !== "all" && r.batch !== batchFilter) return false;
    return true;
  });

  const dynamicRows = MOCK_DYNAMIC.filter((r) => {
    const k = keyword.trim();
    if (k && !r.enterpriseName.includes(k) && !r.creditCode.includes(k)) return false;
    return true;
  });

  const batchInUse = (b: string) => MOCK_DECLARATIONS.some((r) => r.batch === b);

  const handleAddBatch = (name: string) => {
    const v = name.trim();
    if (!v) return toast.error("批次名称不能为空");
    if (batches.includes(v)) return toast.error("该批次已存在");
    setBatches([v, ...batches]);
    toast.success(`已新增批次「${v}」`);
  };
  const handleEditBatch = (oldName: string, newName: string) => {
    const v = newName.trim();
    if (!v) return toast.error("批次名称不能为空");
    if (v === oldName) return;
    if (batches.includes(v)) return toast.error("该批次已存在");
    setBatches(batches.map((b) => (b === oldName ? v : b)));
    if (batchFilter === oldName) setBatchFilter(v);
    toast.success(`已更新为「${v}」`);
  };
  const handleDeleteBatch = (b: string) => {
    if (batchInUse(b)) return toast.error("该批次下存在自评价记录，无法删除");
    setBatches(batches.filter((x) => x !== b));
    if (batchFilter === b) setBatchFilter("all");
    toast.success(`已删除批次「${b}」`);
  };
  return (
    <AppLayout
      title={
        section === "dynamic"
          ? "绿色工厂动态管理"
          : "审核推荐"
      }
      subtitle={
        section === "dynamic"
          ? "市级绿色工厂年度动态管理表复核"
          : "专家审核 → 通过评定；不通过自动进入梯度培育"
      }
    >
      {/* 概览指标 */}
      <div className="grid gap-3 md:grid-cols-4 mb-4">
        <KpiTile icon={ClipboardList} label="审核推荐" value={MOCK_DECLARATIONS.length} accent="primary" />
        <KpiTile icon={Clock} label="待审核" value={MOCK_DECLARATIONS.filter((d) => d.stage === "待审核").length} accent="primary" />
        <KpiTile icon={XCircle} label="已驳回" value={MOCK_DECLARATIONS.filter((d) => d.stage === "已驳回").length} accent="warning" />
        <KpiTile icon={CheckCircle2} label="已完成" value={MOCK_DECLARATIONS.filter((d) => d.stage === "已完成").length} accent="success" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        {!section && (
          <TabsList>
            <TabsTrigger value="declaration">审核推荐</TabsTrigger>
            <TabsTrigger value="dynamic">动态管理表（年度）</TabsTrigger>
          </TabsList>
        )}

        {/* 专家审核推荐管理 */}
        <TabsContent value="declaration" className="mt-4">
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="text-base">审核推荐列表</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="搜索企业名称"
                      className="h-8 w-64 pl-8 text-xs"
                    />
                  </div>
                  <IndustryCascadeFilter value={industryFilter} onChange={setIndustryFilter} />
                  <Select value={batchFilter} onValueChange={setBatchFilter}>
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <Filter className="mr-1 h-3 w-3" />
                      <SelectValue placeholder="批次" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部批次</SelectItem>
                      {batches.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setBatchDialogOpen(true)}>
                    <Settings2 className="mr-1 h-3 w-3" />批次管理
                  </Button>
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <Filter className="mr-1 h-3 w-3" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="填写中">填写中</SelectItem>
                      <SelectItem value="待审核">待审核</SelectItem>
                      <SelectItem value="已驳回">已驳回</SelectItem>
                      <SelectItem value="培育中">培育中</SelectItem>
                      <SelectItem value="已完成">已完成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <Table className="min-w-[1280px]">
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="whitespace-nowrap">企业名称 / 统一社会信用代码</TableHead>
                    <TableHead className="whitespace-nowrap">所属区</TableHead>
                    <TableHead className="whitespace-nowrap">行业</TableHead>
                    <TableHead className="whitespace-nowrap">提交批次</TableHead>
                    <TableHead className="text-center whitespace-nowrap px-[3px]">AI 智能打分 / 专家审核</TableHead>
                    <TableHead className="text-center whitespace-nowrap">流转状态</TableHead>
                    <TableHead className="whitespace-nowrap">提交时间</TableHead>
                    <TableHead className="sticky right-0 z-20 bg-card text-right whitespace-nowrap shadow-[-8px_0_8px_-8px_hsl(var(--border))]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declarations.map((r) => {
                    return (
                    <TableRow key={r.id} className="h-12 border-border/40 group">
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm">{r.enterpriseName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{r.creditCode}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{r.district}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-xs">{r.industry}</div>
                        {r.subIndustry && (
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{r.subIndustry}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{r.batch}</TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-mono text-xs text-center px-0">
                        <div className="font-mono text-xs">{r.score} / {r.manualScore ?? "—"}</div>
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge variant="outline" className={stageBadgeClass(r.stage)}>{r.stage}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{r.submitDate}</TableCell>
                      <TableCell className="sticky right-0 z-10 bg-card text-right whitespace-nowrap shadow-[-8px_0_8px_-8px_hsl(var(--border))] group-hover:bg-muted/40">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => navigate(`/green-mfg/gov/declaration/${r.id}`)}>
                          <Eye className="mr-1 h-3 w-3" />详情/审核
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                  {declarations.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="h-24 text-center text-xs text-muted-foreground">暂无符合条件的专家审核推荐</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 动态管理 */}
        <TabsContent value="dynamic" className="mt-4 space-y-4">
          <Tabs defaultValue="report">
            <TabsList>
              <TabsTrigger value="report">动态管理表</TabsTrigger>
              <TabsTrigger value="archive">绿色档案</TabsTrigger>
              <TabsTrigger value="risk">风险预警</TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="mt-4">
              <Card className="panel">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle className="text-base">动态管理表 · {new Date().getFullYear()} 年度</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">仅市级绿色工厂需逐年填报；填报后由市级生态主管部门复核。</p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索企业名称" className="h-8 w-64 pl-8 text-xs" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60 hover:bg-transparent">
                        
                        <TableHead>企业名称</TableHead>
                        <TableHead>所属区</TableHead>
                        <TableHead className="text-center">年度</TableHead>
                        <TableHead className="text-center">综合能耗</TableHead>
                        <TableHead className="text-center">碳排放</TableHead>
                        <TableHead className="text-center">固废利用率</TableHead>
                        <TableHead className="text-center">状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dynamicRows.map((r) => (
                        <TableRow key={r.id} className="h-12 border-border/40">
                          
                          <TableCell className="text-sm">{r.enterpriseName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.district}</TableCell>
                          <TableCell className="text-center font-mono text-xs">{r.year}</TableCell>
                          <TableCell className="p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-mono text-xs text-center px-0">{r.energyConsumption?.toLocaleString() ?? "—"}</TableCell>
                          <TableCell className="p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-mono text-xs text-center px-0">{r.carbonEmission?.toLocaleString() ?? "—"}</TableCell>
                          <TableCell className="p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-mono text-xs text-center px-0">{r.wasteRecycleRate != null ? `${r.wasteRecycleRate}%` : "—"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={dynamicStatusClass(r.status)}>{r.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" className="h-7" onClick={() => navigate(`/green-mfg/gov/dynamic/${r.id}`)}>
                              <Eye className="mr-1 h-3 w-3" />查看/审核
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="archive" className="mt-4">
              <GreenArchivePanel mode="gov" />
            </TabsContent>

            <TabsContent value="risk" className="mt-4">
              <RiskWarningPanel mode="gov" />
            </TabsContent>

          </Tabs>
        </TabsContent>
      </Tabs>
      <BatchManageDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        batches={batches}
        inUse={batchInUse}
        onAdd={handleAddBatch}
        onEdit={handleEditBatch}
        onDelete={handleDeleteBatch}
      />
    </AppLayout>
  );
}

function KpiTile({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: "primary" | "success" | "warning" }) {
  const cls = accent === "success" ? "text-success bg-success/10" : accent === "warning" ? "text-warning bg-warning/10" : "text-primary bg-primary/10";
  return (
    <Card className="panel">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${cls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BatchManageDialog({
  open, onOpenChange, batches, inUse, onAdd, onEdit, onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batches: string[];
  inUse: (b: string) => boolean;
  onAdd: (name: string) => void;
  onEdit: (oldName: string, newName: string) => void;
  onDelete: (b: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingVal, setEditingVal] = useState("");

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setEditingKey(null); setNewName(""); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">提交批次管理</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="新批次名称，如 2026年第一批"
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            className="h-8"
            onClick={() => { onAdd(newName); setNewName(""); }}
          >
            <Plus className="mr-1 h-3 w-3" />新增
          </Button>
        </div>

        <div className="mt-2 max-h-72 overflow-auto rounded-md border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 text-xs">批次名称</TableHead>
                <TableHead className="h-9 text-right text-xs">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b} className="h-10">
                  <TableCell className="text-sm">
                    {editingKey === b ? (
                      <Input
                        autoFocus
                        value={editingVal}
                        onChange={(e) => setEditingVal(e.target.value)}
                        className="h-7 text-xs"
                      />
                    ) : (
                      <span>{b}{inUse(b) && <span className="ml-2 text-[10px] text-muted-foreground">使用中</span>}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingKey === b ? (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => { onEdit(b, editingVal); setEditingKey(null); }}>保存</Button>
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingKey(null)}>取消</Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditingKey(b); setEditingVal(b); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-destructive hover:text-destructive"
                          disabled={inUse(b)}
                          onClick={() => onDelete(b)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {batches.length === 0 && (
                <TableRow><TableCell colSpan={2} className="h-16 text-center text-xs text-muted-foreground">暂无批次</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
