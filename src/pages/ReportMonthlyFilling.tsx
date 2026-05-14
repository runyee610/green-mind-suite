import { Fragment, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  CheckCircle2,
  ClipboardList,
  Database,
  Factory,
  FileCheck2,
  Flame,
  HelpCircle,
  Info,
  Leaf,
  Save,
  Send,
  Sigma,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ENTERPRISE_TYPES,
  EnterpriseTypeSwitcher,
  SpecialFieldsPlaceholder,
  TYPE_HAS_STEAM,
  type EnterpriseTypeId,
} from "@/components/report-monthly/EnterpriseTypeSwitcher";
import { PowerGenFillingSection } from "@/components/report-monthly/PowerGenFields";
import { PowerSupplyFillingSection } from "@/components/report-monthly/PowerSupplyFields";
import { NonEnergyFillingSection } from "@/components/report-monthly/NonEnergyFields";
import { TelecomFillingSection } from "@/components/report-monthly/TelecomFields";
import { DataCenterFillingSection } from "@/components/report-monthly/DataCenterFields";

// ============= 类型 =============
type EnergyRow = {
  id: string;
  name: string;
  unit: string;
  coefEquivalent: number;
  coefStandard: number;
  isGreen?: boolean;
  consumptionYTD: number;
  consumptionYTDLast: number;
  materialYTD: number;
  materialYTDLast: number;
  nonIndustrialYTD: number;
  nonIndustrialYTDLast: number;
  outputYTD: number;
  outputYTDLast: number;
};

const initialEnergy: EnergyRow[] = [
  { id: "elec", name: "电力", unit: "万kWh", coefEquivalent: 3.07, coefStandard: 1.229, consumptionYTD: 0, consumptionYTDLast: 7802, materialYTD: 0, materialYTDLast: 0, nonIndustrialYTD: 0, nonIndustrialYTDLast: 110, outputYTD: 0, outputYTDLast: 72 },
  { id: "coal", name: "原煤", unit: "吨", coefEquivalent: 0.7143, coefStandard: 0.7143, consumptionYTD: 0, consumptionYTDLast: 25400, materialYTD: 0, materialYTDLast: 980, nonIndustrialYTD: 0, nonIndustrialYTDLast: 0, outputYTD: 0, outputYTDLast: 0 },
  { id: "gas", name: "天然气", unit: "万m³", coefEquivalent: 12.95, coefStandard: 12.95, consumptionYTD: 0, consumptionYTDLast: 1359, materialYTD: 0, materialYTDLast: 0, nonIndustrialYTD: 0, nonIndustrialYTDLast: 20, outputYTD: 0, outputYTDLast: 11 },
  { id: "oil", name: "成品油", unit: "吨", coefEquivalent: 1.4571, coefStandard: 1.4571, consumptionYTD: 0, consumptionYTDLast: 2961, materialYTD: 0, materialYTDLast: 0, nonIndustrialYTD: 0, nonIndustrialYTDLast: 0, outputYTD: 0, outputYTDLast: 0 },
  { id: "heat", name: "热力", unit: "百万千焦", coefEquivalent: 0.0341, coefStandard: 0.0341, consumptionYTD: 0, consumptionYTDLast: 33700, materialYTD: 0, materialYTDLast: 0, nonIndustrialYTD: 0, nonIndustrialYTDLast: 0, outputYTD: 0, outputYTDLast: 1620 },
  { id: "green", name: "绿电（含绿证/可再生能源）", unit: "万kWh", coefEquivalent: 3.07, coefStandard: 1.229, isGreen: true, consumptionYTD: 0, consumptionYTDLast: 410, materialYTD: 0, materialYTDLast: 0, nonIndustrialYTD: 0, nonIndustrialYTDLast: 0, outputYTD: 0, outputYTDLast: 0 },
];

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const rateOf = (a: number, b: number): number | null => (b ? round(((a - b) / b) * 100, 2) : null);
const fmtRate = (r: number | null) => (r === null ? "—" : `${r > 0 ? "+" : ""}${r.toFixed(2)}%`);

const BASE_STEPS = [
  { id: "basic", label: "基础信息", icon: Info, desc: "确认企业与统计周期" },
  { id: "energy", label: "能源消费", icon: Flame, desc: "按品种填写消费量" },
  { id: "output", label: "工业产值", icon: Factory, desc: "填写产值与产量" },
  { id: "carbon", label: "碳排与蒸汽", icon: Sparkles, desc: "选填项" },
  
  { id: "review", label: "预览提交", icon: FileCheck2, desc: "核对后提交审核" },
] as const;

/** 不同企业类型在第 4 步的专属字段标题 */
const SPECIAL_STEP_BY_TYPE: Record<EnterpriseTypeId, { label: string; desc: string }> = {
  power_gen: { label: "碳排与电力生产", desc: "碳排放（选填）+ 电力生产专属指标" },
  power_supply: { label: "碳排与供电", desc: "碳排放（选填）+ 供电企业专属指标" },
  energy_convert: { label: "碳排与蒸汽", desc: "碳排放（选填）+ 蒸汽相关指标" },
  non_energy: { label: "碳排与产品能耗", desc: "碳排放（选填）+ 分产品单位产量综合能耗" },
  telecom: { label: "碳排与电信", desc: "碳排放（选填）+ 电信企业专属指标" },
};



type StepId = (typeof BASE_STEPS)[number]["id"];

export default function ReportMonthlyFilling() {
  const [step, setStep] = useState<StepId>("basic");
  const [enterpriseType, setEnterpriseType] = useState<EnterpriseTypeId>(TYPE_HAS_STEAM);
  const enterpriseTypeLabel = ENTERPRISE_TYPES.find((t) => t.id === enterpriseType)?.label ?? "";
  const showSteam = enterpriseType === TYPE_HAS_STEAM;
  const STEPS = BASE_STEPS.map((s) => {
    if (s.id === "carbon") return { ...s, ...SPECIAL_STEP_BY_TYPE[enterpriseType] };
    if (s.id === "output" && enterpriseType === "telecom")
      return { ...s, label: "电信业务总量", desc: "填写电信业务总量与单位能耗" };
    return s;
  });
  const [energy, setEnergy] = useState<EnergyRow[]>(initialEnergy);
  const [output, setOutput] = useState({ curr: 0, last: 1688000 });
  const [carbon, setCarbon] = useState({ curr: 0, last: 268900 });
  const [steam, setSteam] = useState({ energyCurr: 0, energyLast: 11900, outputCurr: 0, outputLast: 445000 });
  const [measure, setMeasure] = useState("");
  const [savedAt, setSavedAt] = useState<string>("");

  // 计算
  const sumEq = (k: keyof EnergyRow) => energy.reduce((a, v) => a + (v[k] as number) * v.coefEquivalent, 0);
  const sumSt = (k: keyof EnergyRow) => energy.reduce((a, v) => a + (v[k] as number) * v.coefStandard, 0);
  const sumGreenEq = (k: keyof EnergyRow) => energy.filter((v) => v.isGreen).reduce((a, v) => a + (v[k] as number) * v.coefEquivalent, 0);
  const sumGreenSt = (k: keyof EnergyRow) => energy.filter((v) => v.isGreen).reduce((a, v) => a + (v[k] as number) * v.coefStandard, 0);

  const calc = useMemo(() => {
    const consEqCurr = sumEq("consumptionYTD"), consEqLast = sumEq("consumptionYTDLast");
    const consStCurr = sumSt("consumptionYTD"), consStLast = sumSt("consumptionYTDLast");
    const outEqCurr = sumEq("outputYTD"), outEqLast = sumEq("outputYTDLast");
    const outStCurr = sumSt("outputYTD"), outStLast = sumSt("outputYTDLast");
    const totalEqCurr = consEqCurr - outEqCurr, totalEqLast = consEqLast - outEqLast;
    const totalStCurr = consStCurr - outStCurr, totalStLast = consStLast - outStLast;
    const greenEqCurr = sumGreenEq("consumptionYTD"), greenEqLast = sumGreenEq("consumptionYTDLast");
    const greenStCurr = sumGreenSt("consumptionYTD"), greenStLast = sumGreenSt("consumptionYTDLast");
    const unitEq = output.curr ? totalEqCurr / output.curr : 0;
    const unitSt = output.curr ? totalStCurr / output.curr : 0;
    return {
      consEqCurr, consEqLast, consStCurr, consStLast,
      totalEqCurr, totalEqLast, totalStCurr, totalStLast,
      totalEqExGreenCurr: totalEqCurr - greenEqCurr,
      totalEqExGreenLast: totalEqLast - greenEqLast,
      totalStExGreenCurr: totalStCurr - greenStCurr,
      totalStExGreenLast: totalStLast - greenStLast,
      unitEq, unitSt,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energy, output]);

  // 完成度
  const completion = useMemo(() => {
    const totals = {
      basic: 1,
      energy: energy.filter((e) => e.consumptionYTD > 0).length / energy.length,
      output: output.curr > 0 ? 1 : 0,
      carbon: 1,
      measure: measure.trim().length > 0 ? 1 : 0,
      review: 0,
    } as Record<StepId, number>;
    const avg = (totals.basic + totals.energy + totals.output + totals.measure) / 4;
    return Math.round(avg * 100);
  }, [energy, output, measure]);

  // 异常预警
  const warnings = useMemo(() => {
    const out: string[] = [];
    energy.forEach((e) => {
      const r = rateOf(e.consumptionYTD, e.consumptionYTDLast);
      if (r !== null && Math.abs(r) > 10 && e.consumptionYTD > 0) {
        out.push(`${e.name}消费量同比 ${fmtRate(r)}（超 10% 阈值）`);
      }
    });
    if (output.curr && output.last) {
      const r = rateOf(output.curr, output.last);
      if (r !== null && Math.abs(r) > 30) out.push(`工业生产总值同比 ${fmtRate(r)}（超 30% 阈值）`);
    }
    return out;
  }, [energy, output]);

  const updateEnergy = (id: string, key: keyof EnergyRow, value: number) => {
    setEnergy((prev) => prev.map((e) => (e.id === id ? { ...e, [key]: value } : e)));
  };

  const handleSave = () => {
    const t = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    setSavedAt(t);
    toast({ title: "已保存草稿", description: `保存时间 ${t}，可关闭页面后继续填报` });
  };

  const handleSubmit = () => {
    toast({ title: "提交成功", description: "节能月报已提交至区主管部门审核" });
  };

  const goNext = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };
  const goPrev = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  return (
    <AppLayout title="节能月报 · 企业填报" subtitle="按步骤填写本月能源消费、产值与节能措施，系统自动计算综合指标">
      <TooltipProvider delayDuration={150}>
        <div className="space-y-4">
          <EnterpriseTypeSwitcher value={enterpriseType} onChange={setEnterpriseType} />
          {/* 顶部信息条 */}
          <Card className="panel-glow">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold leading-tight text-foreground">上海宝山钢铁股份有限公司</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">企业填报</Badge>
                  <span className="font-mono text-muted-foreground">913100001322830140</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-muted-foreground">统计月份：<span className="font-mono text-foreground">2026-03</span></span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-muted-foreground">截止：<span className="font-mono text-warning">2026-04-15</span></span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">填报完成度</span>
                  <Progress value={completion} className="h-2 w-32" />
                  <span className="font-mono text-sm font-semibold text-primary">{completion}%</span>
                </div>
                <div className="flex items-center gap-2">
                  {savedAt ? (
                    <span className="text-[11px] text-muted-foreground">
                      <CheckCircle2 className="mr-1 inline h-3 w-3 text-success" />
                      已保存 {savedAt}
                    </span>
                  ) : null}
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={handleSave}>
                    <Save className="h-3.5 w-3.5" />保存草稿
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 步骤条 */}
          <Card>
            <CardContent className="p-4">
              <ol className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                {STEPS.map((s, i) => {
                  const active = s.id === step;
                  const done = STEPS.findIndex((x) => x.id === step) > i;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setStep(s.id)}
                        className={cn(
                          "group flex w-full items-start gap-2.5 rounded-md border p-2.5 text-left transition",
                          active && "border-primary/50 bg-primary/5 shadow-sm",
                          !active && done && "border-success/40 bg-success/5",
                          !active && !done && "border-border hover:bg-muted/40",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            active && "bg-primary text-primary-foreground",
                            !active && done && "bg-success text-success-foreground",
                            !active && !done && "bg-muted text-muted-foreground",
                          )}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className={cn("flex items-center gap-1 text-sm font-medium", active ? "text-primary" : done ? "text-success" : "text-foreground")}>
                            <s.icon className="h-3.5 w-3.5" />
                            {s.label}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.desc}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          {/* 异常预警 */}
          {warnings.length > 0 && step !== "review" ? (
            <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-medium">检测到 {warnings.length} 项数据异常，请核对后再提交：</div>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-warning/90">
                  {warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          ) : null}

          {/* 主体内容 */}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {step === "basic" && <StepBasic />}

              {step === "energy" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Flame className="h-4 w-4 text-primary" /> 能源品种消费明细
                      <HelpHint text="能源品种、计量单位与折标系数由企业基本信息维护，此处不可修改。" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="overflow-x-auto rounded-md border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/60 hover:bg-muted/60">
                            <TableHead>能源品种</TableHead>
                            <TableHead>单位</TableHead>
                            <TableHead className="min-w-[140px]">企业消费量<br /><span className="text-[10px] text-muted-foreground">今年累计 / 去年同期</span></TableHead>
                            <TableHead>同比</TableHead>
                            <TableHead className="min-w-[140px]">用于原材料</TableHead>
                            <TableHead className="min-w-[140px]">非工业累计</TableHead>
                            <TableHead className="min-w-[140px]">外供量</TableHead>
                            <TableHead className="text-[11px]">折标系数<br /><span className="text-[10px] text-muted-foreground">等价/当量</span></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {energy.map((row) => {
                            const r = rateOf(row.consumptionYTD, row.consumptionYTDLast);
                            const abnormal = r !== null && Math.abs(r) > 10 && row.consumptionYTD > 0;
                            if (row.isGreen) {
                              return (
                                <Fragment key={row.id}>
                                  <TableRow className="hover:bg-success/5">
                                    <TableCell colSpan={8} className="bg-success/10 py-2">
                                      <div className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-success">
                                        <Leaf className="h-4 w-4" />
                                        {row.name}
                                        <Badge variant="outline" className="h-5 border-success/40 bg-success/15 px-1.5 text-[10px] text-success">
                                          可在综合能耗中扣除
                                        </Badge>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow key={row.id} className="align-top bg-success/[0.03]">
                                    <TableCell className="text-muted-foreground">—</TableCell>
                                    <TableCell className="text-muted-foreground">{row.unit}</TableCell>
                                    <TableCell>
                                      <NumInput value={row.consumptionYTD} onChange={(v) => updateEnergy(row.id, "consumptionYTD", v)} placeholder="本月填写" />
                                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">去年 {row.consumptionYTDLast.toLocaleString()}</div>
                                    </TableCell>
                                    <TableCell>
                                      <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px]", abnormal ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-muted/40 text-muted-foreground")}>
                                        {fmtRate(r)}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <NumInput value={row.materialYTD} onChange={(v) => updateEnergy(row.id, "materialYTD", v)} />
                                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">去年 {row.materialYTDLast.toLocaleString()}</div>
                                    </TableCell>
                                    <TableCell>
                                      <NumInput value={row.nonIndustrialYTD} onChange={(v) => updateEnergy(row.id, "nonIndustrialYTD", v)} />
                                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">去年 {row.nonIndustrialYTDLast.toLocaleString()}</div>
                                    </TableCell>
                                    <TableCell>
                                      <NumInput value={row.outputYTD} onChange={(v) => updateEnergy(row.id, "outputYTD", v)} />
                                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">去年 {row.outputYTDLast.toLocaleString()}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                                      <div>等价 {row.coefEquivalent}</div>
                                      <div>当量 {row.coefStandard}</div>
                                    </TableCell>
                                  </TableRow>
                                </Fragment>
                              );
                            }
                            return (
                              <TableRow key={row.id} className="align-top">
                                <TableCell>
                                  <div className="flex items-center gap-1.5 font-medium">
                                    {row.name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{row.unit}</TableCell>
                                <TableCell>
                                  <NumInput value={row.consumptionYTD} onChange={(v) => updateEnergy(row.id, "consumptionYTD", v)} placeholder="本月填写" />
                                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">去年 {row.consumptionYTDLast.toLocaleString()}</div>
                                </TableCell>
                                <TableCell>
                                  <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px]", abnormal ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-muted/40 text-muted-foreground")}>
                                    {fmtRate(r)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <NumInput value={row.materialYTD} onChange={(v) => updateEnergy(row.id, "materialYTD", v)} />
                                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">去年 {row.materialYTDLast.toLocaleString()}</div>
                                </TableCell>
                                <TableCell>
                                  <NumInput value={row.nonIndustrialYTD} onChange={(v) => updateEnergy(row.id, "nonIndustrialYTD", v)} />
                                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">去年 {row.nonIndustrialYTDLast.toLocaleString()}</div>
                                </TableCell>
                                <TableCell>
                                  <NumInput value={row.outputYTD} onChange={(v) => updateEnergy(row.id, "outputYTD", v)} />
                                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">去年 {row.outputYTDLast.toLocaleString()}</div>
                                </TableCell>
                                <TableCell className="font-mono text-[11px] text-muted-foreground">
                                  <div>等价 {row.coefEquivalent}</div>
                                  <div>当量 {row.coefStandard}</div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      <Info className="mr-1 inline h-3 w-3" />
                      所有数值为<strong className="text-foreground">本年 1 月至本月累计值</strong>；同比变化率绝对值&gt;10% 将自动标红预警。
                    </p>
                  </CardContent>
                </Card>
              )}

              {step === "output" && (
                enterpriseType === "telecom" ? (
                  <TelecomFillingSection
                    totalCurr={output.curr}
                    totalLast={output.last}
                    onTotalCurr={(v) => setOutput((s) => ({ ...s, curr: v }))}
                    onTotalLast={(v) => setOutput((s) => ({ ...s, last: v }))}
                    unitEq={calc.unitEq}
                    unitSt={calc.unitSt}
                  />
                ) : (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Factory className="h-4 w-4 text-primary" /> 工业产值
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <FieldNum label="工业生产总值（今年累计）" unit="万元" value={output.curr} onChange={(v) => setOutput((s) => ({ ...s, curr: v }))} required />
                      <FieldNum label="工业生产总值（去年同期）" unit="万元" value={output.last} onChange={(v) => setOutput((s) => ({ ...s, last: v }))} muted />
                      <ComputedHint label="万元产值能耗（等价值）" value={`${round(calc.unitEq, 4)} 吨标煤/万元`} formula="综合能耗（等价值） ÷ 工业生产总值" />
                      <ComputedHint label="万元产值能耗（当量值）" value={`${round(calc.unitSt, 4)} 吨标煤/万元`} formula="综合能耗（当量值） ÷ 工业生产总值" />
                    </CardContent>
                  </Card>
                )
              )}

              {step === "carbon" && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-4 w-4 text-primary" /> 综合碳排放量{enterpriseType !== "telecom" && "（选填）"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <FieldNum label="综合碳排放量（今年累计）" unit="吨二氧化碳" value={carbon.curr} onChange={(v) => setCarbon((s) => ({ ...s, curr: v }))} />
                      <FieldNum label="综合碳排放量（去年同期）" unit="吨二氧化碳" value={carbon.last} onChange={(v) => setCarbon((s) => ({ ...s, last: v }))} muted />
                    </CardContent>
                  </Card>
                  {showSteam ? (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Flame className="h-4 w-4 text-primary" /> 蒸汽相关指标
                          <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
                            {enterpriseTypeLabel} 专属
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <FieldNum label="蒸汽综合能耗（今年累计）" unit="tce" value={steam.energyCurr} onChange={(v) => setSteam((s) => ({ ...s, energyCurr: v }))} />
                        <FieldNum label="蒸汽综合能耗（去年同期）" unit="tce" value={steam.energyLast} onChange={(v) => setSteam((s) => ({ ...s, energyLast: v }))} muted />
                        <FieldNum label="蒸汽产量（今年累计）" unit="吨" value={steam.outputCurr} onChange={(v) => setSteam((s) => ({ ...s, outputCurr: v }))} />
                        <FieldNum label="蒸汽产量（去年同期）" unit="吨" value={steam.outputLast} onChange={(v) => setSteam((s) => ({ ...s, outputLast: v }))} muted />
                        <ComputedHint label="蒸汽单位产量综合能耗" value={`${round(steam.outputCurr ? steam.energyCurr / steam.outputCurr : 0, 6)} tce/吨`} formula="蒸汽综合能耗 ÷ 蒸汽产量" />
                      </CardContent>
                    </Card>
                  ) : enterpriseType === "power_gen" ? (
                    <PowerGenFillingSection />
                  ) : enterpriseType === "power_supply" ? (
                    <PowerSupplyFillingSection />
                  ) : enterpriseType === "non_energy" ? (
                    <NonEnergyFillingSection />
                  ) : enterpriseType === "telecom" ? (
                    (() => {
                      const unitCurr = output.curr ? carbon.curr / output.curr : 0;
                      const unitLast = output.last ? carbon.last / output.last : 0;
                      const r = rateOf(unitCurr, unitLast);
                      const abnormal = r !== null && Math.abs(r) > 10;
                      return (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Sparkles className="h-4 w-4 text-primary" /> 万元产值碳排放量
                              <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
                                电信企业 专属
                              </Badge>
                              <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
                                系统计算
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid gap-3 md:grid-cols-3">
                              <div className="rounded-md border border-primary/30 bg-primary/[0.05] p-3">
                                <Label className="text-xs text-muted-foreground">今年累计</Label>
                                <div className="mt-1 font-mono text-base font-semibold text-primary">
                                  {round(unitCurr, 6)} <span className="text-[11px] text-muted-foreground">吨CO₂/万元</span>
                                </div>
                              </div>
                              <div className="rounded-md border border-border bg-muted/30 p-3">
                                <Label className="text-xs text-muted-foreground">去年累计</Label>
                                <div className="mt-1 font-mono text-base font-semibold text-muted-foreground">
                                  {round(unitLast, 6)} <span className="text-[11px]">吨CO₂/万元</span>
                                </div>
                              </div>
                              <div className="rounded-md border border-border bg-muted/30 p-3">
                                <Label className="text-xs text-muted-foreground">变化率</Label>
                                <div className={cn("mt-1 font-mono text-base font-semibold", abnormal ? "text-destructive" : "text-foreground")}>
                                  {fmtRate(r)}
                                </div>
                              </div>
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              公式：综合碳排放量 ÷ 电信业务总量；变化率 =（今年累计 − 去年累计）÷ 去年累计 × 100%
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()
                  ) : (
                    <SpecialFieldsPlaceholder typeLabel={enterpriseTypeLabel} />
                  )}
                  {enterpriseType === "telecom" && <DataCenterFillingSection />}
                </div>
              )}

              {step === "measure" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Leaf className="h-4 w-4 text-primary" /> 本月节能措施
                      <HelpHint text="请描述本月已实施的节能技改、管理优化措施及节约标煤量等。" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label className="text-xs text-muted-foreground">节能措施描述</Label>
                    <Textarea
                      className="mt-2 min-h-[140px]"
                      placeholder="例如：完成 4 号高炉余热回收升级与电机变频改造，本月节约标煤约 380 tce。"
                      value={measure}
                      onChange={(e) => setMeasure(e.target.value)}
                    />
                    <div className="mt-2 text-[11px] text-muted-foreground">建议字数 50–500 字，可附上节能量、改造范围、投资额等信息。</div>
                  </CardContent>
                </Card>
              )}

              {step === "review" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileCheck2 className="h-4 w-4 text-primary" /> 提交前预览
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ReviewRow label="工业生产总值" curr={`${output.curr.toLocaleString()} 万元`} last={`${output.last.toLocaleString()} 万元`} rate={rateOf(output.curr, output.last)} />
                    <ReviewRow label="综合能耗（等价值）" curr={`${round(calc.totalEqCurr)} tce`} last={`${round(calc.totalEqLast)} tce`} rate={rateOf(calc.totalEqCurr, calc.totalEqLast)} computed />
                    <ReviewRow label="综合能耗（当量值）" curr={`${round(calc.totalStCurr)} tce`} last={`${round(calc.totalStLast)} tce`} rate={rateOf(calc.totalStCurr, calc.totalStLast)} computed />
                    <ReviewRow label="扣除绿电后综合能耗（等价值）" curr={`${round(calc.totalEqExGreenCurr)} tce`} last={`${round(calc.totalEqExGreenLast)} tce`} rate={rateOf(calc.totalEqExGreenCurr, calc.totalEqExGreenLast)} computed />
                    <ReviewRow label="万元产值能耗（等价值）" curr={`${round(calc.unitEq, 4)} 吨标煤/万元`} last="—" computed />
                    <Separator />
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">本月节能措施</div>
                      <div className="mt-1 whitespace-pre-wrap rounded border border-border bg-muted/30 p-2 text-sm">
                        {measure || <span className="text-muted-foreground">（未填写）</span>}
                      </div>
                    </div>
                    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
                      <Info className="mr-1 inline h-3 w-3 text-primary" />
                      提交后数据将进入区主管部门审核流程，审核期间不可修改；如被驳回可基于反馈重新填写。
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 步骤切换按钮 */}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={goPrev} disabled={step === STEPS[0].id} className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" /> 上一步
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleSave} className="gap-1.5">
                    <Save className="h-4 w-4" /> 保存草稿
                  </Button>
                  {step !== "review" ? (
                    <Button onClick={goNext} className="gap-1.5">
                      下一步 <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="gap-1.5 bg-success text-success-foreground hover:bg-success/90">
                      <Send className="h-4 w-4" /> 提交审核
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧实时计算面板 */}
            <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] shadow-lg ring-1 ring-primary/20">
                <CardHeader className="sticky top-0 z-10 rounded-t-lg border-b border-primary/20 bg-primary/10 pb-2 backdrop-blur">
                  <CardTitle className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      <span className="text-primary">实时计算结果</span>
                    </span>
                    <Badge variant="outline" className="h-5 gap-1 border-primary/40 bg-background px-1.5 text-[10px] text-primary">
                      <Sparkles className="h-2.5 w-2.5" />实时
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 py-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">① 总量合计</div>
                    <CalcRow label="总量（等价值）" value={`${round(calc.consEqCurr)} tce`} icon={Sigma} formula="∑ 各能源消费量 × 等价折标系数" />
                    <CalcRow label="总量（当量值）" value={`${round(calc.consStCurr)} tce`} icon={Sigma} formula="∑ 各能源消费量 × 当量折标系数" />
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">② 综合能耗（扣除外供）</div>
                    <CalcRow label="综合能耗（等价值）" value={`${round(calc.totalEqCurr)} tce`} icon={Database} highlight formula="总量（等价值） − 外供量（等价值）" />
                    <CalcRow label="综合能耗（当量值）" value={`${round(calc.totalStCurr)} tce`} icon={Database} highlight formula="总量（当量值） − 外供量（当量值）" />
                  </div>
                  <div className="space-y-1.5 rounded-md border border-success/40 bg-success/[0.07] p-2">
                    <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-success">
                      <Leaf className="h-3 w-3" />③ 扣除绿电后综合能耗
                    </div>
                    <CalcRow label="扣除绿电（等价值）" value={`${round(calc.totalEqExGreenCurr)} tce`} icon={Leaf} formula="综合能耗（等价值） − 绿电消费量 × 等价折标系数" />
                    <CalcRow label="扣除绿电（当量值）" value={`${round(calc.totalStExGreenCurr)} tce`} icon={Leaf} formula="综合能耗（当量值） − 绿电消费量 × 当量折标系数" />
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">④ 万元产值能耗</div>
                    <CalcRow label="单耗（等价值）" value={`${round(calc.unitEq, 4)}`} unit="吨标煤/万元" icon={Factory} formula="综合能耗（等价值） ÷ 工业生产总值" />
                    <CalcRow label="单耗（当量值）" value={`${round(calc.unitSt, 4)}`} unit="吨标煤/万元" icon={Factory} formula="综合能耗（当量值） ÷ 工业生产总值" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ClipboardList className="h-4 w-4 text-primary" /> 填报小贴士
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-[11px] text-muted-foreground">
                  <p>• 所有数值为<strong className="text-foreground">本年 1 月至本月累计</strong>，非单月数据。</p>
                  <p>• 标<Badge variant="outline" className="mx-0.5 h-4 border-success/40 bg-success/10 px-1 text-[10px] text-success">填报</Badge>字段需手填；标<Badge variant="outline" className="mx-0.5 h-4 border-primary/40 bg-primary/10 px-1 text-[10px] text-primary">计算</Badge>字段系统自动计算。</p>
                  <p>• 同比变化&gt;10% 会高亮预警，请确认数据无误。</p>
                  <p>• 鼠标悬停每一项可查看<strong className="text-foreground">完整公式</strong>，计算过程透明可溯。</p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}

// ============= 子组件 =============
function NumInput({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <Input
      type="number"
      className="h-8 w-full font-mono text-sm"
      value={value || ""}
      placeholder={placeholder ?? "0"}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
    />
  );
}

function FieldNum({ label, unit, value, onChange, required, muted }: { label: string; unit: string; value: number; onChange: (v: number) => void; required?: boolean; muted?: boolean }) {
  return (
    <div className={cn("rounded-md border p-3", muted ? "border-border bg-muted/30" : "border-success/40 bg-success/[0.06]")}>
      <Label className="flex items-center gap-1 text-xs">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-2 flex items-center gap-2">
        <Input type="number" className="h-9 font-mono" value={value || ""} onChange={(e) => onChange(Number(e.target.value) || 0)} />
        <span className="shrink-0 text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function ComputedHint({ label, value, formula }: { label: string; value: string; formula: string }) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/[0.04] p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="h-5 cursor-help gap-1 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
              <Calculator className="h-3 w-3" /> 系统计算
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            <div className="text-[10px] uppercase tracking-wide text-primary">公式</div>
            <div className="font-mono">{formula}</div>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="mt-2 font-mono text-base font-semibold text-primary">{value}</div>
    </div>
  );
}

function CalcRow({ label, value, unit, icon: Icon, highlight, formula }: { label: string; value: string; unit?: string; icon: typeof Sigma; highlight?: boolean; formula?: string }) {
  const content = (
    <div className={cn("flex items-start justify-between gap-2 rounded px-1 py-0.5", formula && "cursor-help hover:bg-primary/5")}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
        {formula ? <HelpCircle className="h-2.5 w-2.5 text-muted-foreground/60" /> : null}
      </div>
      <div className={cn("text-right font-mono text-xs", highlight ? "font-semibold text-primary" : "text-foreground")}>
        {value}
        {unit ? <span className="ml-1 text-[10px] text-muted-foreground">{unit}</span> : null}
      </div>
    </div>
  );
  if (!formula) return content;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs text-xs">
        <div className="text-[10px] uppercase tracking-wide text-primary">计算公式</div>
        <div className="mt-0.5 font-mono">{formula}</div>
      </TooltipContent>
    </Tooltip>
  );
}

function ReviewRow({ label, curr, last, rate, computed }: { label: string; curr: string; last: string; rate?: number | null; computed?: boolean }) {
  const abnormal = rate !== undefined && rate !== null && Math.abs(rate) > 10;
  return (
    <div className="grid grid-cols-12 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
      <div className="col-span-4 flex items-center gap-1.5">
        <span className="font-medium">{label}</span>
        {computed ? <Badge variant="outline" className="h-4 border-primary/40 bg-primary/10 px-1 text-[10px] text-primary">计算</Badge> : null}
      </div>
      <div className="col-span-3 font-mono text-foreground">{curr}</div>
      <div className="col-span-3 font-mono text-muted-foreground">{last}</div>
      <div className="col-span-2 text-right">
        {rate !== undefined && rate !== null ? (
          <span className={cn("font-mono text-xs", abnormal ? "text-destructive" : "text-muted-foreground")}>{fmtRate(rate)}</span>
        ) : <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

function HelpHint({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

function StepBasic() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="h-4 w-4 text-primary" /> 基础信息确认
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <ReadField label="企业名称" value="上海宝山钢铁股份有限公司" />
        <ReadField label="统一社会信用代码" value="913100001322830140" mono />
        <ReadField label="企业类型" value="非能源加工转换工业企业" />
        <ReadField label="温报行业类型" value="钢铁" />
        <ReadField label="所属区" value="宝山区" />
        <ReadField label="所属行业" value="黑色金属冶炼" />
        <ReadField label="统计月份" value="2026-03" mono />
        <ReadField label="填报截止" value="2026-04-15" mono warning />
        <ReadField label="联系人" value="周立新 / 021-2664 8888" />
        <ReadField label="重点用能企业" value="是" />
      </CardContent>
    </Card>
  );
}

function ReadField({ label, value, mono, warning }: { label: string; value: string; mono?: boolean; warning?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-sm", mono && "font-mono", warning ? "text-warning font-medium" : "text-foreground")}>{value}</div>
    </div>
  );
}
