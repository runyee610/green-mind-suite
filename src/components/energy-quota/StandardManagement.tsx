import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, Edit, Plus, Search, FileCheck2, Layers, Archive, Upload, History, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { standards as initialStandards, type QuotaStandard } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

// 扩展：对口人 / 历史对口人 / 关联废止标准
interface StandardExt extends QuotaStandard {
  contact?: string;
  contactHistory?: { name: string; period: string }[];
  linkedDisabledId?: string;
}

interface FormState {
  id?: string;
  code: string;
  name: string;
  parentId?: string;
  contact: string;
  linkedDisabledId?: string;
  isEnergyOutput: boolean; // 保留兼容，不在表单展示
  years: number[];          // 保留兼容
}

const empty: FormState = { code: "", name: "", parentId: undefined, contact: "", linkedDisabledId: undefined, isEnergyOutput: false, years: [] };

// mock：对口人 / 历史对口人
const CONTACTS = ["王伟", "李静", "张磊", "陈芳", "刘洋", "周琳", "黄浩", "徐婷"];
function pickContact(seed: string, i = 0) {
  let h = i;
  for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k)) >>> 0;
  return CONTACTS[h % CONTACTS.length];
}
function makeContactHistory(seed: string) {
  return [
    { name: pickContact(seed, 7), period: "2021 - 2022" },
    { name: pickContact(seed, 13), period: "2023 - 2024" },
  ];
}
// mock：废止标准过往每年的适用企业
const HIST_NAMES = ["上海宝钢实业", "申能集团", "上海石化", "华润上海", "上海耀皮玻璃", "上海华谊", "上海纺织", "金桥能源", "上海建工", "光明乳业", "锦江实业", "复星新材料"];
function makeDisabledHistory(seed: string) {
  let h = 0;
  for (let k = 0; k < seed.length; k++) h = (h * 131 + seed.charCodeAt(k)) >>> 0;
  const years = [2021, 2022, 2023];
  return years.map((y, idx) => {
    const n = 2 + ((h + idx * 7) % 4);
    const names: string[] = [];
    for (let i = 0; i < n; i++) names.push(HIST_NAMES[(h + idx * 11 + i * 3) % HIST_NAMES.length]);
    return { year: y, count: n, names };
  });
}

function rankOf(s: QuotaStandard): number {
  const enabled = s.status === "启用" ? 0 : 2;
  const prefix = s.code.startsWith("GB") ? 0 : 1;
  return enabled + prefix;
}

export function StandardManagement() {
  // 初始化：附带对口人
  const [list, setList] = useState<StandardExt[]>(() =>
    initialStandards.map((s, i) => ({
      ...s,
      contact: pickContact(s.id, i),
      contactHistory: makeContactHistory(s.id),
    })),
  );
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // 批量导入
  const [batchText, setBatchText] = useState("");
  const [batchConflict, setBatchConflict] = useState<"skip" | "overwrite">("skip");
  const [singleForm, setSingleForm] = useState<{ code: string; name: string; parentId?: string; contact: string }>({ code: "", name: "", parentId: undefined, contact: "" });

  const flattened = useMemo(() => {
    const matchKeyword = (s: StandardExt) =>
      !keyword || s.code.toLowerCase().includes(keyword.toLowerCase()) || s.name.includes(keyword) || (s.contact ?? "").includes(keyword);

    const matchedIds = new Set(list.filter(matchKeyword).map((s) => s.id));
    const visibleIds = new Set(matchedIds);
    list.forEach((s) => { if (matchedIds.has(s.id) && s.parentId) visibleIds.add(s.parentId); });

    const tops = list
      .filter((s) => !s.parentId && visibleIds.has(s.id))
      .sort((a, b) => {
        const r = rankOf(a) - rankOf(b);
        if (r !== 0) return r;
        return a.code.localeCompare(b.code);
      });

    const rows: { node: StandardExt; depth: number; childCount: number; seq: number | null }[] = [];
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
  }, [list, keyword, expanded]);

  const openCreate = () => {
    setSingleForm({ code: "", name: "", parentId: undefined, contact: "" });
    setBatchText("");
    setBatchConflict("skip");
    setCreateOpen(true);
  };
  const openEdit = (s: StandardExt) => {
    setForm({
      id: s.id, code: s.code, name: s.name, parentId: s.parentId,
      contact: s.contact ?? "", linkedDisabledId: s.linkedDisabledId,
      isEnergyOutput: s.isEnergyOutput, years: [...s.years],
    });
    setErrors({});
    setOpen(true);
  };

  const validateEdit = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.code.trim()) e.code = "标准号必填";
    else if (!/^(GB|DB)/.test(form.code.trim())) e.code = "标准号必须以 GB 或 DB 开头";
    else if (list.some((s) => s.code === form.code.trim() && s.id !== form.id)) e.code = `标准号 ${form.code} 已存在`;
    if (!form.name.trim()) e.name = "标准名称必填";
    if (form.parentId && form.parentId === form.id) e.parentId = "上级标准不可选择自身";
    setErrors(e);
    if (Object.keys(e).length > 0) { toast.error(Object.values(e)[0]); return false; }
    return true;
  };

  const submitEdit = () => {
    if (!validateEdit()) return;
    if (form.id) {
      setList((prev) => prev.map((s) => (s.id === form.id ? {
        ...s,
        code: form.code.trim(), name: form.name.trim(), parentId: form.parentId,
        contact: form.contact.trim() || undefined,
        linkedDisabledId: form.linkedDisabledId,
      } : s)));
      toast.success("标准已更新");
    }
    setOpen(false);
  };

  // 新建 - 单个
  const submitSingle = () => {
    const code = singleForm.code.trim();
    const name = singleForm.name.trim();
    if (!code) return toast.error("标准号必填");
    if (!/^(GB|DB)/.test(code)) return toast.error("标准号必须以 GB 或 DB 开头");
    if (!name) return toast.error("标准名称必填");
    if (list.some((s) => s.code === code)) return toast.error(`标准号 ${code} 已存在`);
    const id = `s${Date.now()}`;
    setList((prev) => [...prev, {
      id, code, name, parentId: singleForm.parentId,
      years: [], isEnergyOutput: false, status: "启用",
      contact: singleForm.contact.trim() || undefined,
      contactHistory: [],
    }]);
    toast.success("标准已新建");
    setCreateOpen(false);
  };

  // 新建 - 批量
  const parseBatch = (text: string) => {
    const rows: { code: string; name: string }[] = [];
    text.split(/\r?\n/).forEach((line) => {
      const t = line.trim();
      if (!t) return;
      // 支持 Tab / 逗号 / 多空格
      const parts = t.split(/\t|,|，|\s{2,}/).map((x) => x.trim()).filter(Boolean);
      if (parts.length >= 2) rows.push({ code: parts[0], name: parts.slice(1).join(" ") });
    });
    return rows;
  };

  const batchPreview = useMemo(() => parseBatch(batchText), [batchText]);

  const submitBatch = () => {
    if (batchPreview.length === 0) return toast.error("请粘贴或输入有效数据");
    let created = 0, overwritten = 0, skipped = 0, invalid = 0;
    setList((prev) => {
      const next = [...prev];
      batchPreview.forEach((row, idx) => {
        if (!/^(GB|DB)/.test(row.code)) { invalid++; return; }
        const dupIdxByCode = next.findIndex((s) => s.code === row.code);
        const dupIdxByName = next.findIndex((s) => s.name === row.name);
        const dupIdx = dupIdxByCode >= 0 ? dupIdxByCode : dupIdxByName;
        if (dupIdx >= 0) {
          if (batchConflict === "overwrite") {
            next[dupIdx] = { ...next[dupIdx], code: row.code, name: row.name };
            overwritten++;
          } else { skipped++; }
        } else {
          next.push({
            id: `s${Date.now()}_${idx}`,
            code: row.code, name: row.name,
            years: [], isEnergyOutput: false, status: "启用",
            contact: undefined, contactHistory: [],
          });
          created++;
        }
      });
      return next;
    });
    toast.success(`导入完成：新增 ${created}，覆盖 ${overwritten}，跳过 ${skipped}${invalid ? `，无效 ${invalid}` : ""}`);
    setCreateOpen(false);
  };

  const toggleStatus = (s: StandardExt) => {
    const next = s.status === "启用" ? "废止" : "启用";
    setList((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: next } : x)));
    toast.success(`${s.code} 已${next}`);
  };

  const enabledCount = list.filter((s) => s.status === "启用").length;
  const disabledCount = list.filter((s) => s.status === "废止").length;

  // 编辑弹窗中：关联废止标准的历史
  const linkedDisabledStd = form.linkedDisabledId ? list.find((s) => s.id === form.linkedDisabledId) : undefined;
  const disabledOptions = list.filter((s) => s.status === "废止" && s.id !== form.id);
  const linkedHistory = useMemo(() => (linkedDisabledStd ? makeDisabledHistory(linkedDisabledStd.id) : []), [linkedDisabledStd]);
  const editingStd = form.id ? list.find((s) => s.id === form.id) : undefined;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="panel overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><Layers className="h-6 w-6" /></div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">标准总数</p>
              <div className="mt-1 font-mono text-2xl font-bold text-foreground">{list.length}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">含 GB / DB 全部版本</p>
            </div>
          </CardContent>
        </Card>
        <Card className="panel overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success"><FileCheck2 className="h-6 w-6" /></div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">启用中</p>
              <div className="mt-1 font-mono text-2xl font-bold text-success">{enabledCount}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">可用于本年度申报</p>
            </div>
          </CardContent>
        </Card>
        <Card className="panel overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Archive className="h-6 w-6" /></div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">已废止</p>
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
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="标准号 / 名称 / 对口人" className="h-9 w-64 pl-8" />
              </div>
              <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" />新建标准</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-14">序号</TableHead>
                <TableHead className="w-64">标准号</TableHead>
                <TableHead>标准名称</TableHead>
                <TableHead className="w-32">对口人</TableHead>
                <TableHead className="w-32">启用状态</TableHead>
                <TableHead className="w-20 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattened.map(({ node: s, depth, childCount, seq }) => {
                const isChild = depth > 0;
                const isExpanded = expanded[s.id];
                return (
                  <TableRow key={s.id} className={cn("h-12 border-border/40", s.status === "废止" && "opacity-65", isChild && "bg-muted/30")}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{seq ?? ""}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-1.5" style={{ paddingLeft: depth * 20 }}>
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
                        <span className="text-foreground">{s.code}</span>
                        {!isChild && childCount > 0 && (
                          <span className="ml-1 inline-flex h-5 min-w-[22px] items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium leading-none text-muted-foreground" title={`包含 ${childCount} 个子标准`}>
                            {childCount}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{s.name}</TableCell>
                    <TableCell className="text-sm text-foreground">
                      {s.contact ?? <span className="text-xs text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={s.status === "启用"} onCheckedChange={() => toggleStatus(s)} aria-label="切换启用状态" />
                        <span className={cn("text-xs font-medium", s.status === "启用" ? "text-success" : "text-muted-foreground")}>{s.status}</span>
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
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">暂无符合条件的标准</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 编辑弹窗 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>编辑标准</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">标准号 <span className="text-destructive">*</span></Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={cn(errors.code && "border-destructive")} />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">标准名称 <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cn(errors.name && "border-destructive")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">上级标准</Label>
              <Select value={form.parentId ?? "__top"} onValueChange={(v) => setForm({ ...form, parentId: v === "__top" ? undefined : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__top">顶级标准</SelectItem>
                  {list.filter((s) => s.id !== form.id && !s.parentId).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.code}　{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">对口人</Label>
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="当前对口人姓名" />
            </div>

            {/* 历史对口人 */}
            {editingStd?.contactHistory && editingStd.contactHistory.length > 0 && (
              <div className="space-y-1.5 col-span-2">
                <Label className="flex items-center gap-1.5 text-xs"><History className="h-3.5 w-3.5 text-muted-foreground" />历史对口人</Label>
                <div className="flex flex-wrap gap-1.5 rounded-md border border-border/60 bg-muted/30 p-2.5">
                  {editingStd.contactHistory.map((c, i) => (
                    <Badge key={i} variant="outline" className="border-border/60 bg-background font-normal">
                      <span className="text-foreground">{c.name}</span>
                      <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">{c.period}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 关联废止标准（仅启用标准可关联） */}
            {editingStd?.status === "启用" && (
              <div className="space-y-1.5 col-span-2">
                <Label className="flex items-center gap-1.5 text-xs"><Link2 className="h-3.5 w-3.5 text-muted-foreground" />关联废止标准</Label>
                <Select value={form.linkedDisabledId ?? "__none"} onValueChange={(v) => setForm({ ...form, linkedDisabledId: v === "__none" ? undefined : v })}>
                  <SelectTrigger><SelectValue placeholder="选择被替代的废止标准" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">不关联</SelectItem>
                    {disabledOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.code}　{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">关联后可继承该废止标准过往的适用企业信息，便于沿用历史档案。</p>

                {linkedDisabledStd && (
                  <div className="mt-2 rounded-md border border-border/60 bg-muted/20 p-3">
                    <div className="mb-2 text-xs font-medium text-foreground">
                      {linkedDisabledStd.code} 过往适用企业
                    </div>
                    <div className="space-y-2">
                      {linkedHistory.map((h) => (
                        <div key={h.year} className="rounded border border-border/40 bg-background p-2">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-mono text-xs text-muted-foreground">{h.year} 年度</span>
                            <Badge variant="outline" className="border-primary/30 bg-primary/8 text-primary font-mono">
                              {h.count} 家
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {h.names.map((n, i) => (
                              <span key={i} className="inline-block rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground/80">{n}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={submitEdit}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建弹窗 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>新建标准</DialogTitle></DialogHeader>
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">单个新建</TabsTrigger>
              <TabsTrigger value="batch"><Upload className="mr-1 h-3.5 w-3.5" />批量粘贴 / 导入</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">标准号 <span className="text-destructive">*</span></Label>
                  <Input value={singleForm.code} onChange={(e) => setSingleForm({ ...singleForm, code: e.target.value })} placeholder="GB / DB 开头" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">标准名称 <span className="text-destructive">*</span></Label>
                  <Input value={singleForm.name} onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })} placeholder="限额标准名称" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">上级标准</Label>
                  <Select value={singleForm.parentId ?? "__top"} onValueChange={(v) => setSingleForm({ ...singleForm, parentId: v === "__top" ? undefined : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__top">顶级标准</SelectItem>
                      {list.filter((s) => !s.parentId).map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.code}　{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">对口人</Label>
                  <Input value={singleForm.contact} onChange={(e) => setSingleForm({ ...singleForm, contact: e.target.value })} placeholder="对口人姓名" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
                <Button onClick={submitSingle}>确认</Button>
              </DialogFooter>
            </TabsContent>
            <TabsContent value="batch" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">粘贴数据 <span className="text-muted-foreground">（每行一条，格式：标准号 [Tab/逗号] 标准名称）</span></Label>
                <Textarea
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder={"GB 21258-2024\t燃煤发电机组单位产品能源消耗限额\nDB31/T 638-2024\t上海市数据中心能源消耗限额\n..."}
                />
                <p className="text-[11px] text-muted-foreground">支持从 Excel 直接复制粘贴；可识别 Tab / 逗号 / 多空格分隔。</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">遇到相同标准号 / 标准名称时</Label>
                <RadioGroup value={batchConflict} onValueChange={(v) => setBatchConflict(v as "skip" | "overwrite")} className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><RadioGroupItem value="skip" />跳过（保留原记录）</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><RadioGroupItem value="overwrite" />覆盖（使用新数据更新）</label>
                </RadioGroup>
              </div>

              {batchPreview.length > 0 && (
                <div className="rounded-md border border-border/60">
                  <div className="border-b border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    预览解析结果：共 <span className="font-mono text-foreground">{batchPreview.length}</span> 条
                  </div>
                  <div className="max-h-48 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/40 hover:bg-transparent">
                          <TableHead className="h-8 w-48 py-1">标准号</TableHead>
                          <TableHead className="h-8 py-1">标准名称</TableHead>
                          <TableHead className="h-8 w-20 py-1 text-right">状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchPreview.map((r, i) => {
                          const dup = list.some((s) => s.code === r.code || s.name === r.name);
                          const invalid = !/^(GB|DB)/.test(r.code);
                          return (
                            <TableRow key={i} className="h-9 border-border/30">
                              <TableCell className="py-1 font-mono text-xs">{r.code}</TableCell>
                              <TableCell className="py-1 text-xs">{r.name}</TableCell>
                              <TableCell className="py-1 text-right">
                                {invalid ? (
                                  <span className="text-[11px] text-destructive">无效</span>
                                ) : dup ? (
                                  <span className={cn("text-[11px]", batchConflict === "overwrite" ? "text-warning" : "text-muted-foreground")}>
                                    {batchConflict === "overwrite" ? "覆盖" : "跳过"}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-success">新增</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
                <Button onClick={submitBatch} disabled={batchPreview.length === 0}>确认导入</Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
