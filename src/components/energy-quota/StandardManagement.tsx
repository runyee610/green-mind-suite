import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, Edit, Plus, Search, Upload, FileCheck2, Layers, Archive } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { allYears, standards as initialStandards, type QuotaStandard } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

interface FormState {
  id?: string;
  code: string;
  name: string;
  parentId?: string;
  years: number[];
  isEnergyOutput: boolean;
}

const empty: FormState = { code: "", name: "", parentId: undefined, years: [], isEnergyOutput: false };

// 排序权重：启用GB(0) > 启用DB(1) > 禁用GB(2) > 禁用DB(3)
function rankOf(s: QuotaStandard): number {
  const enabled = s.status === "启用" ? 0 : 2;
  const prefix = s.code.startsWith("GB") ? 0 : 1;
  return enabled + prefix;
}

export function StandardManagement() {
  const [list, setList] = useState<QuotaStandard[]>(initialStandards);
  const [keyword, setKeyword] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("全部");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // 构造层级：先过滤，再按 顶级 → 子级 排序
  const flattened = useMemo(() => {
    const matchKeyword = (s: QuotaStandard) =>
      !keyword || s.code.toLowerCase().includes(keyword.toLowerCase()) || s.name.includes(keyword);
    const matchYear = (s: QuotaStandard) =>
      yearFilter === "全部" || s.years.includes(Number(yearFilter));

    // 取出所有匹配条件的；同时若子项匹配，需保留其父
    const matchedIds = new Set(list.filter((s) => matchKeyword(s) && matchYear(s)).map((s) => s.id));
    const visibleIds = new Set(matchedIds);
    list.forEach((s) => {
      if (matchedIds.has(s.id) && s.parentId) visibleIds.add(s.parentId);
    });

    const tops = list
      .filter((s) => !s.parentId && visibleIds.has(s.id))
      .sort((a, b) => {
        const r = rankOf(a) - rankOf(b);
        if (r !== 0) return r;
        return a.code.localeCompare(b.code);
      });

    const rows: { node: QuotaStandard; depth: number; childCount: number; seq: number | null }[] = [];
    let topSeq = 0;
    tops.forEach((top) => {
      const children = list
        .filter((s) => s.parentId === top.id && visibleIds.has(s.id))
        .sort((a, b) => a.code.localeCompare(b.code));
      topSeq += 1;
      rows.push({ node: top, depth: 0, childCount: children.length, seq: topSeq });
      if (expanded[top.id]) {
        children.forEach((c) => rows.push({ node: c, depth: 1, childCount: 0, seq: null }));
      }
    });
    return rows;
  }, [list, keyword, yearFilter, expanded]);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };
  const openEdit = (s: QuotaStandard) => {
    setForm({ id: s.id, code: s.code, name: s.name, parentId: s.parentId, years: [...s.years], isEnergyOutput: s.isEnergyOutput });
    setErrors({});
    setOpen(true);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.code.trim()) e.code = "标准号必填";
    else if (!/^(GB|DB)/.test(form.code.trim())) e.code = "标准号必须以 GB 或 DB 开头";
    else if (list.some((s) => s.code === form.code.trim() && s.id !== form.id)) e.code = `标准号 ${form.code} 已存在，请重新输入`;
    if (!form.name.trim()) e.name = "标准名称必填";
    if (form.years.length === 0) e.years = "请至少选择一个适用年份";
    if (form.parentId && form.parentId === form.id) e.parentId = "上级标准不可选择自身";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error(Object.values(e)[0]);
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    if (form.id) {
      setList((prev) => prev.map((s) => (s.id === form.id ? { ...s, code: form.code.trim(), name: form.name.trim(), parentId: form.parentId, years: [...form.years].sort(), isEnergyOutput: form.isEnergyOutput } : s)));
      toast.success("标准已更新");
    } else {
      const id = `s${Date.now()}`;
      setList((prev) => [...prev, { id, code: form.code.trim(), name: form.name.trim(), parentId: form.parentId, years: [...form.years].sort(), isEnergyOutput: form.isEnergyOutput, status: "启用" }]);
      toast.success("标准已新建");
    }
    setOpen(false);
  };

  const toggleYear = (y: number) =>
    setForm((f) => ({ ...f, years: f.years.includes(y) ? f.years.filter((x) => x !== y) : [...f.years, y] }));

  const toggleStatus = (s: QuotaStandard) => {
    const next = s.status === "启用" ? "禁用" : "启用";
    setList((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: next } : x)));
    toast.success(`${s.code} 已${next}`);
  };

  const renderYears = (years: number[]) => {
    if (years.length <= 1) {
      return <span className="font-mono text-xs text-foreground">{years[0] ? `${years[0]} 年度` : "-"}</span>;
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="cursor-help border-primary/30 bg-primary/8 text-primary font-medium">
            多年度（{years.length}）
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="font-mono text-xs">{years.join("、")}</div>
        </TooltipContent>
      </Tooltip>
    );
  };

  const enabledCount = list.filter((s) => s.status === "启用").length;
  const disabledCount = list.filter((s) => s.status === "禁用").length;

  return (
    <div className="space-y-4">
      {/* 概览卡：使用主色/成功色填充背景，避免浅灰 icon 与浅色面板对比不足 */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="panel overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">标准总数</p>
              <div className="mt-1 font-mono text-2xl font-bold text-foreground">{list.length}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">含 GB / DB 全部版本</p>
            </div>
          </CardContent>
        </Card>
        <Card className="panel overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">启用中</p>
              <div className="mt-1 font-mono text-2xl font-bold text-success">{enabledCount}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">可用于本年度申报</p>
            </div>
          </CardContent>
        </Card>
        <Card className="panel overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Archive className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">已禁用</p>
              <div className="mt-1 font-mono text-2xl font-bold text-foreground/70">{disabledCount}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">仅作历史档案保留</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />标准库管理
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="标准号 / 标准名称" className="h-9 w-64 pl-8" />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部年份</SelectItem>
                  {allYears.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" />新建标准</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-14">序号</TableHead>
                <TableHead className="w-60">标准号</TableHead>
                <TableHead>标准名称</TableHead>
                <TableHead className="w-36">适用年份</TableHead>
                <TableHead className="w-32">启用状态</TableHead>
                <TableHead className="w-20 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattened.map(({ node: s, depth, childCount, seq }) => {
                const isChild = depth > 0;
                const isExpanded = expanded[s.id];
                return (
                  <TableRow
                    key={s.id}
                    className={cn(
                      "h-12 border-border/40",
                      s.status === "禁用" && "opacity-65",
                      isChild && "bg-muted/30",
                    )}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {seq ?? ""}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div
                        className="flex items-center gap-1.5"
                        style={{ paddingLeft: depth * 20 }}
                      >
                        {!isChild && childCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => setExpanded((m) => ({ ...m, [s.id]: !m[s.id] }))}
                            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={isExpanded ? "收起" : "展开"}
                          >
                            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")} />
                          </button>
                        ) : (
                          <span className="inline-block w-5" />
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "border font-mono",
                            s.code.startsWith("GB")
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-warning/40 bg-warning/10 text-warning",
                          )}
                        >
                          {s.code}
                        </Badge>
                        {!isChild && childCount > 0 && (
                          <span
                            className="ml-1 inline-flex h-5 min-w-[22px] items-center justify-center rounded-full border border-primary/25 bg-primary/8 px-1.5 text-[11px] font-medium leading-none text-primary"
                            title={`包含 ${childCount} 个子标准`}
                          >
                            {childCount}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{s.name}</TableCell>
                    <TableCell>{renderYears(s.years)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={s.status === "启用"}
                          onCheckedChange={() => toggleStatus(s)}
                          aria-label="切换启用状态"
                        />
                        <span className={cn(
                          "text-xs font-medium",
                          s.status === "启用" ? "text-success" : "text-muted-foreground",
                        )}>
                          {s.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                        <Edit className="mr-1 h-3 w-3" />编辑
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {flattened.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">暂无符合条件的标准</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{form.id ? "编辑标准" : "新建标准"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">标准号 <span className="text-destructive">*</span></Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="限额标准号（GB/DB 开头）" className={cn(errors.code && "border-destructive")} />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">标准名称 <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="限额标准名称" className={cn(errors.name && "border-destructive")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">上级标准</Label>
              <Select value={form.parentId ?? "__top"} onValueChange={(v) => setForm({ ...form, parentId: v === "__top" ? undefined : v })}>
                <SelectTrigger><SelectValue placeholder="请选择上级标准" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__top">顶级标准</SelectItem>
                  {list.filter((s) => s.id !== form.id && !s.parentId).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.code}　{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">仅顶级标准可作为上级；选择后将作为其子标准展示</p>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">适用年份 <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-5 gap-2 rounded-md border border-border/60 p-3">
                {allYears.map((y) => (
                  <label key={y} className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox checked={form.years.includes(y)} onCheckedChange={() => toggleYear(y)} />
                    <span className="font-mono">{y}年</span>
                  </label>
                ))}
              </div>
              {errors.years && <p className="text-xs text-destructive">{errors.years}</p>}
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">是否能源输出</Label>
              <RadioGroup value={form.isEnergyOutput ? "yes" : "no"} onValueChange={(v) => setForm({ ...form, isEnergyOutput: v === "yes" })} className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><RadioGroupItem value="yes" />是</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><RadioGroupItem value="no" />否</label>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={submit}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
