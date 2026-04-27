import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, Calendar, CheckCircle2, FileText, Info, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { allIndustries, enterprises as allEnterprises, sortStandardCodes, sortStandards, standards, cycles, type QuotaCycle } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

interface NewCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (cycle: QuotaCycle) => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i);

// 去重的企业池（以 creditCode 为唯一键）
const enterprisePool = (() => {
  const map = new Map<string, typeof allEnterprises[number]>();
  for (const e of allEnterprises) {
    if (!map.has(e.creditCode)) map.set(e.creditCode, e);
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
})();

export function NewCycleDialog({ open, onOpenChange, onCreated }: NewCycleDialogProps) {
  const [year, setYear] = useState<number>(currentYear);
  const [startMonth, setStartMonth] = useState("01");
  const [endMonth, setEndMonth] = useState("12");
  const [deadline, setDeadline] = useState(`${currentYear}-03-31`);
  const [notifyEnterprise, setNotifyEnterprise] = useState(true);
  const [remark, setRemark] = useState("");

  // 企业筛选与选择
  const [keyword, setKeyword] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("全部");
  const [standardFilter, setStandardFilter] = useState<string>("全部");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const enabledStandards = useMemo(
    () => sortStandards(standards.filter((s) => s.status === "启用" && !s.parentId)),
    [],
  );
  const period = `${year}${startMonth}-${year}${endMonth}`;
  const duplicate = useMemo(() => cycles.find((c) => c.period === period), [period]);

  // 筛选后的企业列表
  const filteredPool = useMemo(() => {
    return enterprisePool.filter((e) => {
      if (industryFilter !== "全部" && e.industry !== industryFilter) return false;
      if (standardFilter !== "全部" && !e.standardCodes.includes(standardFilter)) return false;
      if (keyword && !e.name.includes(keyword) && !e.creditCode.includes(keyword)) return false;
      return true;
    });
  }, [keyword, industryFilter, standardFilter]);

  const allFilteredSelected = filteredPool.length > 0 && filteredPool.every((e) => selectedIds.has(e.id));
  const someFilteredSelected = filteredPool.some((e) => selectedIds.has(e.id));

  useEffect(() => {
    if (open) {
      setYear(currentYear);
      setStartMonth("01");
      setEndMonth("12");
      setDeadline(`${currentYear}-03-31`);
      setNotifyEnterprise(true);
      setRemark("");
      setKeyword("");
      setIndustryFilter("全部");
      setStandardFilter("全部");
      setSelectedIds(new Set());
    }
  }, [open]);

  const toggleEnterprise = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredPool.forEach((e) => next.delete(e.id));
      } else {
        filteredPool.forEach((e) => next.add(e.id));
      }
      return next;
    });
  };

  const selectAllPool = () => {
    setSelectedIds(new Set(enterprisePool.map((e) => e.id)));
    toast.success(`已选中全部 ${enterprisePool.length} 家企业`);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedCount = selectedIds.size;
  const canSubmit = !duplicate && selectedCount > 0 && !!deadline;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const newCycle: QuotaCycle = {
      id: `c${Date.now()}`,
      period,
      startMonth: `${year}-${startMonth}`,
      endMonth: `${year}-${endMonth}`,
      deadline,
      status: "进行中",
      reported: 0,
      audited: 0,
      total: selectedCount,
    };
    onCreated(newCycle);
    toast.success(`周期 ${period} 已创建，已导入 ${selectedCount} 家企业${notifyEnterprise ? "，并发送填报通知" : ""}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            新建限额周期
          </DialogTitle>
          <DialogDescription>
            创建一个新的能耗限额申报周期，并配置申报范围、截止时间与通知方式。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 周期信息 */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">1</span>
              周期信息
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">限额年度</Label>
                <Select value={String(year)} onValueChange={(v) => { setYear(Number(v)); setDeadline(`${v}-03-31`); }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y} 年</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">起始月</Label>
                <Select value={startMonth} onValueChange={setStartMonth}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                      <SelectItem key={m} value={m}>{m} 月</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">结束月</Label>
                <Select value={endMonth} onValueChange={setEndMonth}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                      <SelectItem key={m} value={m}>{m} 月</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">填报截止日期</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-9" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">周期编号：</span>
              <span className="font-mono text-sm font-semibold text-foreground">{period}</span>
              {duplicate && (
                <Badge variant="outline" className="ml-2 border-destructive/40 bg-destructive/10 text-destructive text-[10px]">
                  <AlertTriangle className="mr-1 h-3 w-3" />已存在同名周期
                </Badge>
              )}
            </div>
          </section>

          {/* 申报范围 - 企业选择 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">2</span>
                申报范围（从企业库选择）
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">已选</span>
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-mono font-semibold">
                  {selectedCount}
                </Badge>
                <span className="text-muted-foreground">/ {enterprisePool.length} 家</span>
                {selectedCount > 0 && (
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={clearSelection}>
                    <X className="mr-1 h-3 w-3" />清空
                  </Button>
                )}
              </div>
            </div>

            {/* 筛选与批量操作 */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索企业名称 / 信用代码"
                  className="h-9 w-64 pl-8"
                />
              </div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-9 w-44"><SelectValue placeholder="行业" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部行业</SelectItem>
                  {allIndustries.map((ind) => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={standardFilter} onValueChange={setStandardFilter}>
                <SelectTrigger className="h-9 w-44"><SelectValue placeholder="适用标准" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部标准</SelectItem>
                  {enabledStandards.map((s) => <SelectItem key={s.id} value={s.code}>{s.code}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-9" onClick={selectAllPool}>
                选择全部企业
              </Button>
            </div>

            {/* 企业列表 */}
            <div className="rounded-md border border-border/60">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox
                    checked={allFilteredSelected ? true : (someFilteredSelected ? "indeterminate" : false)}
                    onCheckedChange={toggleSelectAllFiltered}
                  />
                  <span className="text-muted-foreground">
                    全选当前筛选结果（{filteredPool.length} 家）
                  </span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  当前筛选已选 {filteredPool.filter((e) => selectedIds.has(e.id)).length} / {filteredPool.length}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {filteredPool.length === 0 ? (
                  <div className="py-10 text-center text-xs text-muted-foreground">无符合条件的企业</div>
                ) : (
                  filteredPool.slice(0, 200).map((e) => {
                    const checked = selectedIds.has(e.id);
                    const codes = sortStandardCodes(e.standardCodes);
                    return (
                      <label
                        key={e.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 border-b border-border/30 px-3 py-2 transition last:border-0",
                          checked ? "bg-primary/5" : "hover:bg-muted/20",
                        )}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleEnterprise(e.id)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-foreground">{e.name}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">{e.creditCode}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">{e.industry}</span>
                            <span className="text-muted-foreground">·</span>
                            <div className="flex flex-wrap gap-1">
                              {codes.map((c) => (
                                <Badge
                                  key={c}
                                  variant="outline"
                                  className={cn(
                                    "font-mono text-[10px]",
                                    c.startsWith("GB")
                                      ? "border-primary/30 bg-primary/10 text-primary"
                                      : "border-warning/40 bg-warning/10 text-warning",
                                  )}
                                >
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
                {filteredPool.length > 200 && (
                  <div className="border-t border-border/40 bg-muted/20 py-2 text-center text-[11px] text-muted-foreground">
                    仅展示前 200 条，请使用筛选缩小范围（共 {filteredPool.length} 家）
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 通知与备注 */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">3</span>
              通知与备注
            </h3>
            <label className="flex items-start gap-2 rounded-md border border-border/60 px-3 py-2 cursor-pointer">
              <Checkbox checked={notifyEnterprise} onCheckedChange={(v) => setNotifyEnterprise(!!v)} className="mt-0.5" />
              <div>
                <div className="text-sm text-foreground">立即向企业发送填报通知</div>
                <div className="text-[11px] text-muted-foreground">将通过站内信与短信通知所有被纳入本周期的企业用户</div>
              </div>
            </label>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">备注（可选）</Label>
              <Textarea
                placeholder="例：本周期为 2026 年度常规申报，请于截止前完成提交……"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </section>

          {/* 摘要 */}
          <section className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
              <FileText className="h-3.5 w-3.5" />创建摘要
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">周期</div>
                <div className="mt-0.5 font-mono font-semibold text-foreground">{period}</div>
              </div>
              <div>
                <div className="text-muted-foreground">截止日期</div>
                <div className="mt-0.5 font-mono font-semibold text-foreground">{deadline || "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">已选企业数</div>
                <div className="mt-0.5 flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-primary" />
                  <span className="font-mono text-base font-bold text-primary">{selectedCount}</span>
                  <span className="text-muted-foreground">家</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            <CheckCircle2 className="mr-1 h-4 w-4" />确认创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
