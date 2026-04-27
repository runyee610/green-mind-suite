import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Edit, Plus, Search, Upload } from "lucide-react";
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { allYears, sortStandards, standards as initialStandards, type QuotaStandard } from "@/components/energy-quota/quotaData";
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

export function StandardManagement() {
  const [list, setList] = useState<QuotaStandard[]>(initialStandards);
  const [keyword, setKeyword] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("全部");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const sorted = useMemo(() => sortStandards(list), [list]);
  const filtered = useMemo(
    () => sorted.filter((s) => {
      const k = !keyword || s.code.includes(keyword) || s.name.includes(keyword);
      const y = yearFilter === "全部" || s.years.includes(Number(yearFilter));
      return k && y;
    }),
    [sorted, keyword, yearFilter],
  );

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
    setList((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: x.status === "启用" ? "禁用" : "启用" } : x)));
    toast.success(`${s.code} 已${s.status === "启用" ? "禁用" : "启用"}`);
  };

  const renderYears = (years: number[]) => {
    if (years.length <= 1) return <span className="font-mono text-xs">{years[0] ?? "-"}{years[0] ? "年度" : ""}</span>;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="cursor-help border-secondary/40 bg-secondary/10 text-secondary">多年度（{years.length}）</Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="font-mono text-xs">{years.join("、")}</div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="panel"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">标准总数</p>
          <div className="mt-2 font-mono text-2xl font-semibold text-primary">{list.length}</div>
          <p className="mt-1 text-xs text-muted-foreground">含 GB / DB 全部版本</p>
        </CardContent></Card>
        <Card className="panel"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">启用中</p>
          <div className="mt-2 font-mono text-2xl font-semibold text-success">{list.filter((s) => s.status === "启用").length}</div>
          <p className="mt-1 text-xs text-muted-foreground">可用于本年度申报</p>
        </CardContent></Card>
        <Card className="panel"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">已禁用</p>
          <div className="mt-2 font-mono text-2xl font-semibold text-muted-foreground">{list.filter((s) => s.status === "禁用").length}</div>
          <p className="mt-1 text-xs text-muted-foreground">仅作历史档案保留</p>
        </CardContent></Card>
      </div>

      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-secondary" />标准库管理</CardTitle>
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
              <Button size="sm" variant="outline" onClick={() => toast.info("市级账号可上传 .xlsx / .xls 标准模板")}>
                <Upload className="mr-1 h-4 w-4" />上传模板
              </Button>
              <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" />新建标准</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-12">序号</TableHead>
                <TableHead>标准号</TableHead>
                <TableHead>标准名称</TableHead>
                <TableHead className="w-32">适用年份</TableHead>
                <TableHead className="w-24">能源输出</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-32 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s, idx) => (
                <TableRow key={s.id} className={cn("h-12 border-border/40", s.status === "禁用" && "opacity-60")}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <Badge variant="outline" className={cn("border-border/60 font-mono", s.code.startsWith("GB") ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent")}>{s.code}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{s.name}</TableCell>
                  <TableCell>{renderYears(s.years)}</TableCell>
                  <TableCell className="text-xs">{s.isEnergyOutput ? <span className="text-primary">是</span> : <span className="text-muted-foreground">否</span>}</TableCell>
                  <TableCell>
                    <Badge className={cn("h-6", s.status === "启用" ? "border-success/40 bg-success/10 text-success" : "border-muted-foreground/40 bg-muted/40 text-muted-foreground")} variant="outline">
                      {s.status === "启用" && <CheckCircle2 className="mr-1 h-3 w-3" />}{s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Edit className="mr-1 h-3 w-3" />编辑</Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleStatus(s)}>{s.status === "启用" ? "禁用" : "启用"}</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
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
                  {list.filter((s) => s.id !== form.id).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.code}　{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
