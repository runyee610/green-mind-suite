import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Edit, Eye, FileDown, History, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditDetailView } from "@/components/energy-quota/AuditDetailView";
import { EntDeclarationDetailView } from "@/components/energy-quota/EntDeclarationDetailView";
import { EnterpriseHistoryDialog } from "@/components/energy-quota/EnterpriseHistoryDialog";
import { useRole } from "@/contexts/RoleContext";
import { EditEnterpriseStandardDialog } from "@/components/energy-quota/EditEnterpriseStandardDialog";
import { EntDeclareDialog } from "@/components/energy-quota/EntDeclareDialog";
import { NewCycleDialog } from "@/components/energy-quota/NewCycleDialog";
import { allContacts, cycles as initialCycles, enterprises as initialEnterprises, enterpriseStatusStyle, getEnterpriseContact, sampleDetail, sortStandardCodes, standards, type CycleStatus, type QuotaCycle, type QuotaEnterprise } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

export function CycleAndDeclaration() {
  const { role } = useRole();
  const [cycles, setCycles] = useState<QuotaCycle[]>(initialCycles);
  const [enterprises, setEnterprises] = useState<QuotaEnterprise[]>(initialEnterprises);
  const isEnt = role === "ent";
  // 企业侧：以 sampleDetail 中的企业作为当前登录企业（按统一社会信用代码识别）
  const currentEntCreditCode = sampleDetail.creditCode;

  // 企业侧只能看到自己申报过（已有数据）的周期
  const visibleCycles = useMemo(() => {
    if (!isEnt) return cycles;
    const declaredCycleIds = new Set(
      enterprises.filter((e) => e.creditCode === currentEntCreditCode && e.hasData).map((e) => e.cycleId),
    );
    return cycles.filter((c) => declaredCycleIds.has(c.id));
  }, [isEnt, cycles, enterprises, currentEntCreditCode]);

  const [cycleId, setCycleId] = useState<string>(visibleCycles[0]?.id ?? cycles[0].id);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("全部");
  const [contactFilter, setContactFilter] = useState<string>("全部");
  const [expanded, setExpanded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editStandardTarget, setEditStandardTarget] = useState<QuotaEnterprise | null>(null);
  const [deleteCycleTarget, setDeleteCycleTarget] = useState<QuotaCycle | null>(null);
  const [forceCompleteTarget, setForceCompleteTarget] = useState<QuotaCycle | null>(null);
  const [historyTarget, setHistoryTarget] = useState<QuotaEnterprise | null>(null);
  const [newCycleOpen, setNewCycleOpen] = useState(false);
  const [editCycleTarget, setEditCycleTarget] = useState<QuotaCycle | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // 当可见周期变化（角色切换）时，确保当前选中的周期合法
  useEffect(() => {
    if (visibleCycles.length > 0 && !visibleCycles.some((c) => c.id === cycleId)) {
      setCycleId(visibleCycles[0].id);
    }
  }, [visibleCycles, cycleId]);

  const activeCycle = visibleCycles.find((c) => c.id === cycleId) ?? visibleCycles[0] ?? cycles[0];
  const sortedCycles = useMemo(() => [...visibleCycles].sort((a, b) => {
    if (a.status !== b.status) return a.status === "进行中" ? -1 : 1;
    return b.startMonth.localeCompare(a.startMonth);
  }), [visibleCycles]);

  const filteredEnterprises = useMemo(
    () => enterprises.filter((e) => {
      if (e.cycleId !== cycleId) return false;
      // 企业侧仅显示自己
      if (isEnt && e.creditCode !== currentEntCreditCode) return false;
      const k = !keyword || e.name.includes(keyword) || e.creditCode.includes(keyword) || e.standardCodes.some((s) => s.includes(keyword));
      const s = statusFilter === "全部" || e.status === statusFilter;
      const c = contactFilter === "全部" || getEnterpriseContact(e.id) === contactFilter;
      return k && s && c;
    }),
    [enterprises, cycleId, keyword, statusFilter, contactFilter, isEnt, currentEntCreditCode],
  );

  // 过滤条件变化时重置页码
  useEffect(() => { setPage(1); }, [cycleId, keyword, statusFilter, contactFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEnterprises.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedEnterprises = useMemo(
    () => filteredEnterprises.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredEnterprises, safePage],
  );

  const switchCycleStatus = (c: QuotaCycle) => {
    if (c.status === "进行中") {
      const pending = enterprises.filter((e) => e.cycleId === c.id && e.status === "待审核").length;
      if (pending > 0) {
        setForceCompleteTarget(c);
        return;
      }
    }
    setCycles((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: x.status === "进行中" ? "已完成" : "进行中" as CycleStatus } : x)));
    toast.success(`周期 ${c.period} 已${c.status === "进行中" ? "完成" : "重新开启"}`);
  };

  const confirmForceComplete = () => {
    if (!forceCompleteTarget) return;
    setCycles((prev) => prev.map((x) => (x.id === forceCompleteTarget.id ? { ...x, status: "已完成" } : x)));
    toast.warning(`周期 ${forceCompleteTarget.period} 已强制完成，未审核企业已锁定`);
    setForceCompleteTarget(null);
  };

  const confirmDeleteCycle = () => {
    if (!deleteCycleTarget) return;
    setCycles((prev) => prev.filter((x) => x.id !== deleteCycleTarget.id));
    setEnterprises((prev) => prev.filter((e) => e.cycleId !== deleteCycleTarget.id));
    toast.error(`周期 ${deleteCycleTarget.period} 及其关联数据已删除`);
    setDeleteCycleTarget(null);
  };

  const confirmEditStandard = (codes: string[]) => {
    if (!editStandardTarget) return;
    const wasHasData = editStandardTarget.hasData;
    const changed =
      codes.length !== editStandardTarget.standardCodes.length ||
      codes.some((c) => !editStandardTarget.standardCodes.includes(c));
    setEnterprises((prev) =>
      prev.map((e) =>
        e.id === editStandardTarget.id
          ? {
              ...e,
              standardCodes: [...codes],
              ...(wasHasData && changed ? { status: "未填报" as const, hasData: false } : {}),
            }
          : e,
      ),
    );
    if (wasHasData && changed) {
      toast.success(`已修改 ${editStandardTarget.name} 的适用标准，原填报数据已清空`);
    } else {
      toast.success(`已更新 ${editStandardTarget.name} 的适用标准`);
    }
    setEditStandardTarget(null);
  };

  if (detailOpen) {
    return role === "ent"
      ? <EntDeclarationDetailView detail={sampleDetail} onBack={() => setDetailOpen(false)} />
      : <AuditDetailView detail={sampleDetail} onBack={() => setDetailOpen(false)} />;
  }

  const pendingPct = activeCycle.total > 0 ? Math.round((activeCycle.audited / activeCycle.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 周期统计条（可折叠） - 仅政府侧 */}
      {!isEnt && (
      <Card className="panel">
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-muted/30">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-7 px-3 font-medium",
                    activeCycle.status === "进行中"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-success/40 bg-success/10 text-success",
                  )}
                >
                  <Calendar className="mr-1 h-3.5 w-3.5" />{activeCycle.status}
                </Badge>
                <span className="font-mono text-base font-semibold text-foreground">{activeCycle.period}</span>
                <span className="text-sm text-muted-foreground">企业填报进度：</span>
                <span className="font-mono text-sm">
                  <span className="text-primary font-semibold">{activeCycle.reported}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-warning font-semibold">{activeCycle.audited}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-foreground font-semibold">{activeCycle.total}</span>
                </span>
                <span className="text-xs text-muted-foreground">（已填报 / 已审核 / 应填报）</span>
                <Badge variant="outline" className="border-border/60 bg-muted/40 text-muted-foreground text-xs">截止 {activeCycle.deadline}</Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">{expanded ? "收起" : "展开"}全部周期</span>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">所有限额周期 — 进行中优先，按起始日期降序</p>
                <Button size="sm" onClick={() => setNewCycleOpen(true)}><Plus className="mr-1 h-4 w-4" />新建周期</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="w-12">序号</TableHead>
                    <TableHead>限额周期</TableHead>
                    <TableHead className="w-24">状态</TableHead>
                    <TableHead className="w-32">填报截止</TableHead>
                    <TableHead>企业数量（已填/已审/应填）</TableHead>
                    <TableHead className="w-56 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCycles.map((c, i) => (
                    <TableRow key={c.id} className={cn("h-12 border-border/40", c.id === cycleId && "bg-primary/5")}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <button className="text-primary hover:underline" onClick={() => setCycleId(c.id)}>{c.period}</button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-medium", c.status === "进行中" ? "border-primary/30 bg-primary/10 text-primary" : "border-success/40 bg-success/10 text-success")}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground">{c.deadline}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <span className="text-primary font-medium">{c.reported}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-warning font-medium">{c.audited}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-foreground font-medium">{c.total}</span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => switchCycleStatus(c)}>{c.status === "进行中" ? "完成" : "开启"}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditCycleTarget(c)}><Edit className="mr-1 h-3 w-3" />编辑</Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteCycleTarget(c)}><Trash2 className="mr-1 h-3 w-3" />删除</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      )}

      {/* 申报企业列表 */}
      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-nowrap items-center justify-between gap-3 overflow-x-auto">
            <CardTitle className="flex shrink-0 items-center gap-2 whitespace-nowrap text-base text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              申报企业列表
              <Badge variant="outline" className="ml-1 border-primary/30 bg-primary/8 text-primary text-xs font-medium">
                {filteredEnterprises.length}
              </Badge>
            </CardTitle>
            <div className="flex shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap">
              <Select value={cycleId} onValueChange={setCycleId}>
                <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                <SelectContent>{sortedCycles.map((c) => <SelectItem key={c.id} value={c.id}>{c.period}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部状态</SelectItem>
                  {(["未填报", "填报中", "待审核", "已驳回", "已完成"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {!isEnt && (
                <Select value={contactFilter} onValueChange={setContactFilter}>
                  <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部对口人</SelectItem>
                    {allContacts.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {!isEnt && (
                <>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="企业名称 / 信用代码 / 标准" className="h-9 w-64 pl-8" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="sm" variant="outline"><FileDown className="mr-1 h-4 w-4" />导出汇总表</Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {[2026, 2025, 2024, 2023, 2022, 2021].map((y) => (
                        <DropdownMenuItem key={y} onClick={() => toast.success(`正在生成 ${y} 年汇总表（异步任务）`)}>{y} 年汇总表</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-44">统一社会信用代码</TableHead>
                <TableHead className="pr-2">企业名称</TableHead>
                <TableHead className="w-40 pl-2">行业</TableHead>
                <TableHead className="w-44">适用标准</TableHead>
                {!isEnt && <TableHead className="w-20">对口人</TableHead>}
                {isEnt && <TableHead className="w-36">申报周期</TableHead>}
                <TableHead className="w-28">填报状态</TableHead>
                <TableHead className="w-64 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedEnterprises.map((e, i) => {
                const style = enterpriseStatusStyle[e.status];
                const sortedCodes = sortStandardCodes(e.standardCodes);
                return (
                  <TableRow key={e.id} className="border-border/40">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {(safePage - 1) * pageSize + i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground">{e.creditCode}</TableCell>
                    <TableCell className="pr-2 text-sm font-medium text-foreground">{e.name}</TableCell>
                    <TableCell className="pl-2 text-xs text-muted-foreground">{e.industry}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col items-start gap-0.5">
                        {sortedCodes.map((c) => (
                          <span key={c} className="font-mono text-[11px] text-foreground">{c}</span>
                        ))}
                      </div>
                    </TableCell>
                    {!isEnt && (
                      <TableCell className="text-xs text-foreground">{getEnterpriseContact(e.id)}</TableCell>
                    )}
                    {isEnt && (
                      <TableCell className="font-mono text-xs text-foreground">
                        {cycles.find((c) => c.id === e.cycleId)?.period ?? "—"}
                      </TableCell>
                    )}
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
                        style.badge,
                      )}>
                        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", style.dot)} />
                        {e.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" className="px-2" onClick={() => setDetailOpen(true)}>
                        <Eye className="mr-1 h-3 w-3" />查看
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="px-2">
                            <MoreHorizontal className="mr-1 h-3 w-3" />更多
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setHistoryTarget(e)}>
                            <History className="mr-2 h-3.5 w-3.5" />历史
                          </DropdownMenuItem>
                          {!isEnt && (
                            <DropdownMenuItem onClick={() => setEditStandardTarget(e)}>
                              <Edit className="mr-2 h-3.5 w-3.5" />编辑
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredEnterprises.length === 0 && (
                <TableRow><TableCell colSpan={isEnt ? 7 : 8} className="py-12 text-center text-sm text-muted-foreground">该周期暂无符合条件的申报企业</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {filteredEnterprises.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <div className="text-xs text-muted-foreground">
                共 <span className="font-mono font-semibold text-foreground">{filteredEnterprises.length}</span> 家企业
                · 第 <span className="font-mono font-semibold text-foreground">{(safePage - 1) * pageSize + 1}</span>–<span className="font-mono font-semibold text-foreground">{Math.min(safePage * pageSize, filteredEnterprises.length)}</span> 条
                · 可用标准 {standards.filter((s) => s.status === "启用").length} 项
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-8 px-2" disabled={safePage === 1} onClick={() => setPage(1)}>首页</Button>
                <Button size="sm" variant="outline" className="h-8 px-2" disabled={safePage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-2 font-mono text-xs text-foreground">
                  {safePage} <span className="text-muted-foreground">/ {totalPages}</span>
                </span>
                <Button size="sm" variant="outline" className="h-8 px-2" disabled={safePage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 px-2" disabled={safePage === totalPages} onClick={() => setPage(totalPages)}>末页</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 修改企业适用标准 */}
      <EditEnterpriseStandardDialog
        enterprise={editStandardTarget}
        onClose={() => setEditStandardTarget(null)}
        onConfirm={confirmEditStandard}
      />

      {/* 删除周期确认 */}
      <AlertDialog open={!!deleteCycleTarget} onOpenChange={(o) => !o && setDeleteCycleTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" />删除限额周期</AlertDialogTitle>
            <AlertDialogDescription>
              执行操作：删除该申报任务及所有关联数据（周期 {deleteCycleTarget?.period}）。该申报任务相关数据将被全部清空，<span className="font-semibold text-destructive">不可恢复</span>。确认继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCycle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 强制完成确认 */}
      <AlertDialog open={!!forceCompleteTarget} onOpenChange={(o) => !o && setForceCompleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-warning"><AlertTriangle className="h-5 w-5" />强制完成确认</AlertDialogTitle>
            <AlertDialogDescription>
              当前周期下仍有 <span className="font-semibold text-warning">{forceCompleteTarget && enterprises.filter((e) => e.cycleId === forceCompleteTarget.id && e.status === "待审核").length}</span> 家企业处于【待审核】状态。强制完成后，相关企业将无法继续提交或修改数据。确认结束任务吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmForceComplete}>确认强制完成</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 历史提交记录 */}
      <EnterpriseHistoryDialog
        enterprise={historyTarget}
        onClose={() => setHistoryTarget(null)}
        onViewDetail={() => {
          setHistoryTarget(null);
          setDetailOpen(true);
        }}
      />

      {/* 新建周期 */}
      <NewCycleDialog
        open={newCycleOpen}
        onOpenChange={setNewCycleOpen}
        onCreated={(cycle) => {
          setCycles((prev) => [cycle, ...prev]);
          setCycleId(cycle.id);
        }}
      />

      {/* 编辑周期 */}
      <NewCycleDialog
        open={!!editCycleTarget}
        onOpenChange={(o) => !o && setEditCycleTarget(null)}
        editing={editCycleTarget ?? undefined}
        onCreated={(cycle) => {
          setCycles((prev) => prev.map((x) => (x.id === cycle.id ? cycle : x)));
          toast.success(`周期 ${cycle.period} 已更新`);
        }}
      />
    </div>
  );
}
