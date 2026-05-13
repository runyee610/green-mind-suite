import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Eye, FileBarChart, Filter, Pencil, Plus, Search, Settings2, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

export default function GreenMfgGov({ section }: { section?: "declaration" | "dynamic" } = {}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>(section ?? "declaration");
  const [keyword, setKeyword] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [expandedIndustries, setExpandedIndustries] = useState<Record<string, boolean>>({});
  const toggleIndustry = (name: string) =>
    setExpandedIndustries((p) => ({ ...p, [name]: !p[name] }));
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
    if (batchInUse(b)) return toast.error("该批次下存在申报记录，无法删除");
    setBatches(batches.filter((x) => x !== b));
    if (batchFilter === b) setBatchFilter("all");
    toast.success(`已删除批次「${b}」`);
  };
  return (
    <AppLayout
      title={
        section === "dynamic"
          ? "绿色工厂动态管理"
          : "绿色工厂自评价管理"
      }
      subtitle={
        section === "dynamic"
          ? "市级绿色工厂年度动态管理表复核"
          : "申报监管、AI 智能预审、专家审批"
      }
    >
      {/* 概览指标 */}
      <div className="grid gap-3 md:grid-cols-4 mb-4">
        <KpiTile icon={ClipboardList} label="待审批自评价" value={82} accent="primary" />
        <KpiTile icon={CheckCircle2} label="本年国家级绿色工厂" value={116} accent="success" />
        <KpiTile icon={FileBarChart} label="培育中企业" value={MOCK_DECLARATIONS.filter((d) => d.stage === "培育中").length} accent="warning" />
        <KpiTile icon={ClipboardList} label="动态管理待审" value={MOCK_DYNAMIC.filter((d) => d.status === "已填报").length} accent="primary" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        {!section && (
          <TabsList>
            <TabsTrigger value="declaration">绿色工厂申报管理</TabsTrigger>
            <TabsTrigger value="dynamic">动态管理表（年度）</TabsTrigger>
          </TabsList>
        )}

        {/* 申报管理 */}
        <TabsContent value="declaration" className="mt-4">
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="text-base">自评价列表</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="搜索企业名称 / 信用代码"
                      className="h-8 w-64 pl-8 text-xs"
                    />
                  </div>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="h-8 w-52 text-xs">
                      <Filter className="mr-1 h-3 w-3" />
                      <SelectValue placeholder="行业" />
                    </SelectTrigger>
                    <SelectContent className="max-h-96">
                      <SelectItem value="all" className="text-xs font-medium">全部行业</SelectItem>
                      <div className="my-1 h-px bg-border/60" />
                      <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-warning">重点行业</div>
                      {INDUSTRY_TREE.filter((n) => n.type === "重点行业").map((node) => {
                        const expanded = !!expandedIndustries[node.name];
                        return (
                          <SelectGroup key={node.name}>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleIndustry(node.name); }}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-[11px] font-semibold text-foreground hover:bg-accent"
                            >
                              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning" />
                              {node.name}
                            </button>
                            {expanded && (
                              <>
                                <SelectItem value={node.name} className="pl-7 text-xs text-muted-foreground">全部 {node.name}</SelectItem>
                                {node.children.map((c) => (
                                  <SelectItem key={c} value={c} className="pl-7 text-xs">{c}</SelectItem>
                                ))}
                              </>
                            )}
                          </SelectGroup>
                        );
                      })}
                      <div className="my-1 h-px bg-border/60" />
                      <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">非重点行业</div>
                      {INDUSTRY_TREE.filter((n) => n.type !== "重点行业").map((node) => (
                        <SelectGroup key={node.name}>
                          {node.children.map((c) => (
                            <SelectItem key={c} value={c} className="pl-7 text-xs">{c}</SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="填报中">自评价中</SelectItem>
                      <SelectItem value="区审批">区审批</SelectItem>
                      <SelectItem value="市审批">市审批</SelectItem>
                      <SelectItem value="培育中">培育中</SelectItem>
                      <SelectItem value="绿色工厂">绿色工厂</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>企业名称 / 统一社会信用代码</TableHead>
                    <TableHead>所属区</TableHead>
                    <TableHead>行业</TableHead>
                    <TableHead>自评价批次</TableHead>
                    <TableHead className="text-center px-[3px]">AI 智能打分 / 专家打分</TableHead>
                    <TableHead className="text-center">综合能耗（吨标煤）</TableHead>
                    <TableHead className="text-center">产值（万元）</TableHead>
                    <TableHead className="text-center">流转状态</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declarations.map((r) => {
                    const dyn = MOCK_DYNAMIC.find((d) => d.enterpriseName === r.enterpriseName);
                    return (
                    <TableRow key={r.id} className="h-12 border-border/40">
                      <TableCell>
                        <div className="text-sm">{r.enterpriseName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{r.creditCode}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.district}</TableCell>
                      <TableCell>
                        <div className="text-xs">{r.industry}</div>
                        {r.subIndustry && (
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{r.subIndustry}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.batch}</TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-mono text-xs text-center px-0">
                        <div className="font-mono text-xs">{r.score} / {r.manualScore ?? "—"}</div>
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-mono text-xs px-[9px] text-center">
                        {dyn?.energyConsumption != null ? dyn.energyConsumption.toLocaleString() : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 font-mono text-xs text-center px-0">{r.outputValue.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={stageBadgeClass(r.stage)}>{r.stage}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.submitDate}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => navigate(`/green-mfg/gov/declaration/${r.id}`)}>
                          <Eye className="mr-1 h-3 w-3" />详情/审批
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                  {declarations.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="h-24 text-center text-xs text-muted-foreground">暂无符合条件的申报</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 动态管理 */}
        <TabsContent value="dynamic" className="mt-4">
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">动态管理表 · {new Date().getFullYear()} 年度</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">仅市级绿色工厂需逐年填报；填报后由市级生态主管部门复核。</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索企业名称 / 信用代码" className="h-8 w-64 pl-8 text-xs" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>编号</TableHead>
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
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
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
          <DialogTitle className="text-base">自评价批次管理</DialogTitle>
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
