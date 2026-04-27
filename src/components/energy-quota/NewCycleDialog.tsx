import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, Calendar, CheckCircle2, FileText, Info } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { allIndustries, cycles, sortStandards, standards, type QuotaCycle } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

interface NewCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (cycle: QuotaCycle) => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i);

export function NewCycleDialog({ open, onOpenChange, onCreated }: NewCycleDialogProps) {
  const [year, setYear] = useState<number>(currentYear);
  const [startMonth, setStartMonth] = useState("01");
  const [endMonth, setEndMonth] = useState("12");
  const [deadline, setDeadline] = useState(`${currentYear}-03-31`);
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<"all" | "industry" | "standard">("all");
  const [notifyEnterprise, setNotifyEnterprise] = useState(true);
  const [remark, setRemark] = useState("");

  const enabledStandards = useMemo(() => sortStandards(standards.filter((s) => s.status === "启用" && !s.parentId)), []);
  const period = `${year}${startMonth}-${year}${endMonth}`;

  // 重复周期检查
  const duplicate = useMemo(() => cycles.find((c) => c.period === period), [period]);

  // 估算企业数量（mock 逻辑）
  const estimatedTotal = useMemo(() => {
    if (importMode === "all") return 248;
    if (importMode === "industry") return Math.max(0, selectedIndustries.length * 18);
    if (importMode === "standard") return Math.max(0, selectedStandards.length * 32);
    return 0;
  }, [importMode, selectedIndustries, selectedStandards]);

  useEffect(() => {
    if (open) {
      // 重置表单
      setYear(currentYear);
      setStartMonth("01");
      setEndMonth("12");
      setDeadline(`${currentYear}-03-31`);
      setSelectedStandards([]);
      setSelectedIndustries([]);
      setImportMode("all");
      setNotifyEnterprise(true);
      setRemark("");
    }
  }, [open]);

  const toggleStandard = (code: string) => {
    setSelectedStandards((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
  };
  const toggleIndustry = (name: string) => {
    setSelectedIndustries((prev) => prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]);
  };

  const canSubmit = !duplicate && estimatedTotal > 0 && deadline;

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
      total: estimatedTotal,
    };
    onCreated(newCycle);
    toast.success(`周期 ${period} 已创建，已导入 ${estimatedTotal} 家企业${notifyEnterprise ? "，并发送填报通知" : ""}`);
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
                <Label className="text-xs text-muted-foreground">申报年度</Label>
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

          {/* 申报范围 */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">2</span>
              申报范围（企业导入）
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "all", label: "全部企业", desc: "导入平台所有备案企业" },
                { key: "industry", label: "按行业", desc: "选择一个或多个行业" },
                { key: "standard", label: "按适用标准", desc: "选择一个或多个标准" },
              ] as const).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setImportMode(m.key)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-md border px-3 py-2 text-left transition",
                    importMode === m.key ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/30",
                  )}
                >
                  <span className="text-sm font-medium text-foreground">{m.label}</span>
                  <span className="text-[11px] text-muted-foreground">{m.desc}</span>
                </button>
              ))}
            </div>

            {importMode === "industry" && (
              <div className="rounded-md border border-border/60 p-3">
                <div className="mb-2 text-xs text-muted-foreground">已选 {selectedIndustries.length} 个行业</div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {allIndustries.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => toggleIndustry(ind)}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px] transition",
                        selectedIndustries.includes(ind)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground hover:bg-muted/40",
                      )}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {importMode === "standard" && (
              <div className="rounded-md border border-border/60 p-3">
                <div className="mb-2 text-xs text-muted-foreground">已选 {selectedStandards.length} 个标准</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {enabledStandards.map((s) => (
                    <label key={s.id} className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 hover:bg-muted/30">
                      <Checkbox
                        checked={selectedStandards.includes(s.code)}
                        onCheckedChange={() => toggleStandard(s.code)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "font-mono text-[10px]",
                            s.code.startsWith("GB")
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-warning/40 bg-warning/10 text-warning",
                          )}>{s.code}</Badge>
                        </div>
                        <div className="mt-0.5 text-xs text-foreground truncate">{s.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
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
                <div className="text-muted-foreground">预计企业数</div>
                <div className="mt-0.5 flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-primary" />
                  <span className="font-mono text-base font-bold text-primary">{estimatedTotal}</span>
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
