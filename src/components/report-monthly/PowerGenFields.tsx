import { useMemo, useState } from "react";
import { ArrowRight, Bolt, Calculator, Flame, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DualField } from "./FieldDisplay";

// ============= 数值/格式化工具 =============
const round = (n: number, d = 2) => {
  if (!isFinite(n)) return 0;
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};
const rate = (a: number, b: number): number | null => (b ? round(((a - b) / b) * 100, 2) : null);

// ============= 演示数据（详情页只读） =============
type Pair = { curr: number; last: number };
type PowerGenDemo = {
  // 发电与供电
  coalForGen: Pair; // 发电耗用标准煤量（吨标煤）
  supply: Pair; // 供电量（万kWh）
  generation: Pair; // 发电量（万kWh）
  capacity: Pair; // 发电设备装机容量（MW）
  plantUse: Pair; // 发电厂用电量（万kWh）
  toGrid: Pair; // 上网电量（万kWh）
  // 供热
  coalForHeat: Pair; // 供热耗用标准煤量（吨标煤）
  heatSupply: Pair; // 供热量（百万千焦）
  cogenEff: Pair; // 热电联产综合效率（%）
  // 外购与产量综合能耗
  purchasedElec: Pair; // 外购电量（万kWh）
  elecEnergyEq: Pair; // 电力综合能耗（等价值, tce）
  elecOutput: Pair; // 电力产量（万kWh）
  heatEnergyStd: Pair; // 热力综合能耗（当量值, tce）
  heatOutput: Pair; // 热力产量（百万千焦）
};

const demo: PowerGenDemo = {
  coalForGen: { curr: 142800, last: 138600 },
  supply: { curr: 56200, last: 54100 },
  generation: { curr: 60800, last: 58400 },
  capacity: { curr: 1320, last: 1320 },
  plantUse: { curr: 4600, last: 4300 },
  toGrid: { curr: 56200, last: 54100 },
  coalForHeat: { curr: 18600, last: 17900 },
  heatSupply: { curr: 28400, last: 27200 },
  cogenEff: { curr: 78.6, last: 77.2 },
  purchasedElec: { curr: 320, last: 280 },
  elecEnergyEq: { curr: 152400, last: 147800 },
  elecOutput: { curr: 60800, last: 58400 },
  heatEnergyStd: { curr: 19200, last: 18400 },
  heatOutput: { curr: 28400, last: 27200 },
};

// ============= 详情页只读版 =============
export function PowerGenDetailSection() {
  const d = demo;
  // 计算项（按附件公式）
  // 注：附件中部分公式标注 "*100"/"*100%"，按"率/单位煤耗"惯例采用 ×100% 表示百分比
  const supplyCoalRateCurr = d.supply.curr ? (d.coalForGen.curr / d.supply.curr) * 100 : 0; // gce/kWh 等价（演示用 %）
  const supplyCoalRateLast = d.supply.last ? (d.coalForGen.last / d.supply.last) * 100 : 0;
  const genCoalRateCurr = d.generation.curr ? (d.coalForGen.curr / d.generation.curr) * 100 : 0;
  const genCoalRateLast = d.generation.last ? (d.coalForGen.last / d.generation.last) * 100 : 0;
  const avgHoursCurr = d.capacity.curr ? d.generation.curr / d.capacity.curr : 0;
  const avgHoursLast = d.capacity.last ? d.generation.last / d.capacity.last : 0;
  const plantUseRateCurr = d.generation.curr ? (d.plantUse.curr / d.generation.curr) * 100 : 0;
  const plantUseRateLast = d.generation.last ? (d.plantUse.last / d.generation.last) * 100 : 0;
  const compUseRateCurr = d.generation.curr ? (1 - d.toGrid.curr / d.generation.curr) * 100 : 0;
  const compUseRateLast = d.generation.last ? (1 - d.toGrid.last / d.generation.last) * 100 : 0;
  const heatCoalRateCurr = d.heatSupply.curr ? (d.coalForHeat.curr / d.heatSupply.curr) * 100 : 0;
  const heatCoalRateLast = d.heatSupply.last ? (d.coalForHeat.last / d.heatSupply.last) * 100 : 0;
  const elecUnitCurr = d.elecOutput.curr ? d.elecEnergyEq.curr / d.elecOutput.curr : 0;
  const elecUnitLast = d.elecOutput.last ? d.elecEnergyEq.last / d.elecOutput.last : 0;
  const heatUnitCurr = d.heatOutput.curr ? d.heatEnergyStd.curr / d.heatOutput.curr : 0;
  const heatUnitLast = d.heatOutput.last ? d.heatEnergyStd.last / d.heatOutput.last : 0;

  return (
    <div className="space-y-4">
      <PowerSection icon={Zap} title="发电与供电指标" subtitle="电力生产企业 专属">
        <div className="space-y-3">
          <SubGroup title="① 煤耗与电量" desc="发电耗用煤量与上下游电量之间的派生煤耗指标">
            <InputsBlock>
              <DualField label="发电耗用标准煤量" unit="吨标煤" kind="input" current={d.coalForGen.curr} last={d.coalForGen.last} rate={rate(d.coalForGen.curr, d.coalForGen.last)} />
              <DualField label="发电量" unit="万kWh" kind="input" current={d.generation.curr} last={d.generation.last} rate={rate(d.generation.curr, d.generation.last)} />
              <DualField label="供电量" unit="万kWh" kind="input" current={d.supply.curr} last={d.supply.last} rate={rate(d.supply.curr, d.supply.last)} />
            </InputsBlock>
            <ComputedBlock>
              <DualField
                label="发电标准煤耗"
                unit="gce/kWh"
                kind="computed"
                current={round(genCoalRateCurr, 2)}
                last={round(genCoalRateLast, 2)}
                rate={rate(genCoalRateCurr, genCoalRateLast)}
                formula="发电耗用标准煤量 ÷ 发电量 × 100"
                source={`${d.coalForGen.curr} ÷ ${d.generation.curr} × 100`}
              />
              <DualField
                label="供电标准煤耗"
                unit="gce/kWh"
                kind="computed"
                current={round(supplyCoalRateCurr, 2)}
                last={round(supplyCoalRateLast, 2)}
                rate={rate(supplyCoalRateCurr, supplyCoalRateLast)}
                formula="发电耗用标准煤量 ÷ 供电量 × 100"
                source={`${d.coalForGen.curr} ÷ ${d.supply.curr} × 100`}
              />
            </ComputedBlock>
          </SubGroup>

          <SubGroup title="② 装机与利用小时" desc="装机容量与发电量决定设备平均利用小时">
            <InputsBlock>
              <DualField label="发电设备装机容量" unit="MW" kind="input" current={d.capacity.curr} last={d.capacity.last} rate={rate(d.capacity.curr, d.capacity.last)} />
              <DualField label="发电量（参与计算）" unit="万kWh" kind="input" current={d.generation.curr} last={d.generation.last} rate={rate(d.generation.curr, d.generation.last)} />
            </InputsBlock>
            <ComputedBlock>
              <DualField
                label="发电设备平均利用小时"
                unit="h"
                kind="computed"
                current={round(avgHoursCurr, 2)}
                last={round(avgHoursLast, 2)}
                rate={rate(avgHoursCurr, avgHoursLast)}
                formula="发电量 ÷ 发电设备装机容量"
                source={`${d.generation.curr} ÷ ${d.capacity.curr}`}
              />
            </ComputedBlock>
          </SubGroup>

          <SubGroup title="③ 厂用电与上网电量" desc="发电厂自用电与外送上网电量推导厂用电率">
            <InputsBlock>
              <DualField label="发电厂用电量" unit="万kWh" kind="input" current={d.plantUse.curr} last={d.plantUse.last} rate={rate(d.plantUse.curr, d.plantUse.last)} />
              <DualField label="上网电量" unit="万kWh" kind="input" current={d.toGrid.curr} last={d.toGrid.last} rate={rate(d.toGrid.curr, d.toGrid.last)} />
            </InputsBlock>
            <ComputedBlock>
              <DualField
                label="发电厂用电率"
                unit="%"
                kind="computed"
                current={round(plantUseRateCurr, 2)}
                last={round(plantUseRateLast, 2)}
                rate={rate(plantUseRateCurr, plantUseRateLast)}
                formula="发电厂用电量 ÷ 发电量 × 100%"
                source={`${d.plantUse.curr} ÷ ${d.generation.curr} × 100%`}
              />
              <DualField
                label="综合厂用电率"
                unit="%"
                kind="computed"
                current={round(compUseRateCurr, 2)}
                last={round(compUseRateLast, 2)}
                rate={rate(compUseRateCurr, compUseRateLast)}
                formula="(1 − 上网电量 ÷ 发电量) × 100%"
                source={`(1 − ${d.toGrid.curr} ÷ ${d.generation.curr}) × 100%`}
              />
            </ComputedBlock>
          </SubGroup>
        </div>
      </PowerSection>

      <PowerSection icon={Flame} title="供热指标">
        <SubGroup title="供热煤耗与效率" desc="供热耗煤量与供热量推导煤耗，热电联产效率独立填报">
          <InputsBlock>
            <DualField label="供热耗用标准煤量" unit="吨标煤" kind="input" current={d.coalForHeat.curr} last={d.coalForHeat.last} rate={rate(d.coalForHeat.curr, d.coalForHeat.last)} />
            <DualField label="供热量" unit="百万千焦" kind="input" current={d.heatSupply.curr} last={d.heatSupply.last} rate={rate(d.heatSupply.curr, d.heatSupply.last)} />
            <DualField label="热电联产综合效率" unit="%" kind="input" current={d.cogenEff.curr} last={d.cogenEff.last} rate={rate(d.cogenEff.curr, d.cogenEff.last)} />
          </InputsBlock>
          <ComputedBlock>
            <DualField
              label="供热标准煤耗"
              unit="kgce/GJ"
              kind="computed"
              current={round(heatCoalRateCurr, 2)}
              last={round(heatCoalRateLast, 2)}
              rate={rate(heatCoalRateCurr, heatCoalRateLast)}
              formula="供热耗用标准煤量 ÷ 供热量 × 100%"
              source={`${d.coalForHeat.curr} ÷ ${d.heatSupply.curr} × 100%`}
            />
          </ComputedBlock>
        </SubGroup>
      </PowerSection>

      <PowerSection icon={Bolt} title="外购电量与单位产量综合能耗">
        <div className="space-y-3">
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <div className="text-xs font-semibold text-foreground">外购电量</div>
            <div className="mt-2">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <DualField label="外购电量" unit="万kWh" kind="input" current={d.purchasedElec.curr} last={d.purchasedElec.last} rate={rate(d.purchasedElec.curr, d.purchasedElec.last)} />
              </div>
            </div>
          </div>

          <SubGroup title="① 电力单位产量综合能耗" desc="电力综合能耗与电力产量推导单位产量能耗（等价值）">
            <InputsBlock>
              <DualField label="电力综合能耗（等价值）" unit="tce" kind="input" current={d.elecEnergyEq.curr} last={d.elecEnergyEq.last} rate={rate(d.elecEnergyEq.curr, d.elecEnergyEq.last)} />
              <DualField label="电力产量" unit="万kWh" kind="input" current={d.elecOutput.curr} last={d.elecOutput.last} rate={rate(d.elecOutput.curr, d.elecOutput.last)} />
            </InputsBlock>
            <ComputedBlock>
              <DualField
                label="电力单位产量综合能耗（等价值）"
                unit="tce/万kWh"
                kind="computed"
                current={round(elecUnitCurr, 4)}
                last={round(elecUnitLast, 4)}
                rate={rate(elecUnitCurr, elecUnitLast)}
                formula="电力综合能耗（等价值） ÷ 电力产量"
                source={`${d.elecEnergyEq.curr} ÷ ${d.elecOutput.curr}`}
              />
            </ComputedBlock>
          </SubGroup>

          <SubGroup title="② 热力单位产量综合能耗" desc="热力综合能耗与热力产量推导单位产量能耗（当量值）">
            <InputsBlock>
              <DualField label="热力综合能耗（当量值）" unit="tce" kind="input" current={d.heatEnergyStd.curr} last={d.heatEnergyStd.last} rate={rate(d.heatEnergyStd.curr, d.heatEnergyStd.last)} />
              <DualField label="热力产量" unit="百万千焦" kind="input" current={d.heatOutput.curr} last={d.heatOutput.last} rate={rate(d.heatOutput.curr, d.heatOutput.last)} />
            </InputsBlock>
            <ComputedBlock>
              <DualField
                label="热力单位产量综合能耗（当量值）"
                unit="tce/GJ"
                kind="computed"
                current={round(heatUnitCurr, 4)}
                last={round(heatUnitLast, 4)}
                rate={rate(heatUnitCurr, heatUnitLast)}
                formula="热力综合能耗（当量值） ÷ 热力产量"
                source={`${d.heatEnergyStd.curr} ÷ ${d.heatOutput.curr}`}
              />
            </ComputedBlock>
          </SubGroup>
        </div>
      </PowerSection>
    </div>
  );
}

function SubGroup({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-3">
      <div className="mb-2 flex items-baseline gap-2">
        <h4 className="text-xs font-semibold text-foreground">{title}</h4>
        {desc ? <span className="text-[11px] text-muted-foreground">{desc}</span> : null}
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        {children}
      </div>
    </div>
  );
}

function InputsBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-success">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
        填报项
      </div>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function ComputedBlock({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="hidden self-center text-primary lg:flex">
        <ArrowRight className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-primary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          系统计算
        </div>
        <div className="grid gap-2 sm:grid-cols-2">{children}</div>
      </div>
    </>
  );
}

function PowerSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="panel scroll-mt-24">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {subtitle ? (
                <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
                  {subtitle}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <Separator />
        {children}
      </CardContent>
    </Card>
  );
}

// ============= 填报页可编辑版 =============
type PgState = {
  coalForGenCurr: number; coalForGenLast: number;
  supplyCurr: number; supplyLast: number;
  generationCurr: number; generationLast: number;
  capacityCurr: number; capacityLast: number;
  plantUseCurr: number; plantUseLast: number;
  toGridCurr: number; toGridLast: number;
  coalForHeatCurr: number; coalForHeatLast: number;
  heatSupplyCurr: number; heatSupplyLast: number;
  cogenEffCurr: number; cogenEffLast: number;
  purchasedElecCurr: number; purchasedElecLast: number;
  elecEnergyEqCurr: number; elecEnergyEqLast: number;
  elecOutputCurr: number; elecOutputLast: number;
  heatEnergyStdCurr: number; heatEnergyStdLast: number;
  heatOutputCurr: number; heatOutputLast: number;
};

const initialPg: PgState = {
  coalForGenCurr: 0, coalForGenLast: 138600,
  supplyCurr: 0, supplyLast: 54100,
  generationCurr: 0, generationLast: 58400,
  capacityCurr: 0, capacityLast: 1320,
  plantUseCurr: 0, plantUseLast: 4300,
  toGridCurr: 0, toGridLast: 54100,
  coalForHeatCurr: 0, coalForHeatLast: 17900,
  heatSupplyCurr: 0, heatSupplyLast: 27200,
  cogenEffCurr: 0, cogenEffLast: 77.2,
  purchasedElecCurr: 0, purchasedElecLast: 280,
  elecEnergyEqCurr: 0, elecEnergyEqLast: 147800,
  elecOutputCurr: 0, elecOutputLast: 58400,
  heatEnergyStdCurr: 0, heatEnergyStdLast: 18400,
  heatOutputCurr: 0, heatOutputLast: 27200,
};

export function PowerGenFillingSection() {
  const [s, setS] = useState<PgState>(initialPg);
  const set = (k: keyof PgState) => (v: number) => setS((prev) => ({ ...prev, [k]: v }));

  const calc = useMemo(() => {
    const supplyCoal = s.supplyCurr ? (s.coalForGenCurr / s.supplyCurr) * 100 : 0;
    const genCoal = s.generationCurr ? (s.coalForGenCurr / s.generationCurr) * 100 : 0;
    const avgHours = s.capacityCurr ? s.generationCurr / s.capacityCurr : 0;
    const plantUseRate = s.generationCurr ? (s.plantUseCurr / s.generationCurr) * 100 : 0;
    const compUseRate = s.generationCurr ? (1 - s.toGridCurr / s.generationCurr) * 100 : 0;
    const heatCoal = s.heatSupplyCurr ? (s.coalForHeatCurr / s.heatSupplyCurr) * 100 : 0;
    const elecUnit = s.elecOutputCurr ? s.elecEnergyEqCurr / s.elecOutputCurr : 0;
    const heatUnit = s.heatOutputCurr ? s.heatEnergyStdCurr / s.heatOutputCurr : 0;
    return { supplyCoal, genCoal, avgHours, plantUseRate, compUseRate, heatCoal, elecUnit, heatUnit };
  }, [s]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-primary" /> 发电与供电指标
            <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
              电力生产企业 专属
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PgRow label="发电耗用标准煤量" unit="吨标煤" curr={s.coalForGenCurr} last={s.coalForGenLast} onCurr={set("coalForGenCurr")} onLast={set("coalForGenLast")} />
          <PgRow label="供电量" unit="万kWh" curr={s.supplyCurr} last={s.supplyLast} onCurr={set("supplyCurr")} onLast={set("supplyLast")} />
          <ComputedRow label="供电标准煤耗" value={`${round(calc.supplyCoal, 2)} gce/kWh`} formula="发电耗用标准煤量 ÷ 供电量 × 100" />
          <PgRow label="发电量" unit="万kWh" curr={s.generationCurr} last={s.generationLast} onCurr={set("generationCurr")} onLast={set("generationLast")} />
          <ComputedRow label="发电标准煤耗" value={`${round(calc.genCoal, 2)} gce/kWh`} formula="发电耗用标准煤量 ÷ 发电量 × 100" />
          <PgRow label="发电设备装机容量" unit="MW" curr={s.capacityCurr} last={s.capacityLast} onCurr={set("capacityCurr")} onLast={set("capacityLast")} />
          <ComputedRow label="发电设备平均利用小时" value={`${round(calc.avgHours, 2)} h`} formula="发电量 ÷ 发电设备装机容量" />
          <PgRow label="发电厂用电量" unit="万kWh" curr={s.plantUseCurr} last={s.plantUseLast} onCurr={set("plantUseCurr")} onLast={set("plantUseLast")} />
          <ComputedRow label="发电厂用电率" value={`${round(calc.plantUseRate, 2)} %`} formula="发电厂用电量 ÷ 发电量 × 100%" />
          <PgRow label="上网电量" unit="万kWh" curr={s.toGridCurr} last={s.toGridLast} onCurr={set("toGridCurr")} onLast={set("toGridLast")} />
          <ComputedRow label="综合厂用电率" value={`${round(calc.compUseRate, 2)} %`} formula="(1 − 上网电量 ÷ 发电量) × 100%" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-4 w-4 text-primary" /> 供热指标
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PgRow label="供热耗用标准煤量" unit="吨标煤" curr={s.coalForHeatCurr} last={s.coalForHeatLast} onCurr={set("coalForHeatCurr")} onLast={set("coalForHeatLast")} />
          <PgRow label="供热量" unit="百万千焦" curr={s.heatSupplyCurr} last={s.heatSupplyLast} onCurr={set("heatSupplyCurr")} onLast={set("heatSupplyLast")} />
          <ComputedRow label="供热标准煤耗" value={`${round(calc.heatCoal, 2)} kgce/GJ`} formula="供热耗用标准煤量 ÷ 供热量 × 100%" />
          <PgRow label="热电联产综合效率" unit="%" curr={s.cogenEffCurr} last={s.cogenEffLast} onCurr={set("cogenEffCurr")} onLast={set("cogenEffLast")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bolt className="h-4 w-4 text-primary" /> 外购电量与单位产量综合能耗
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PgRow label="外购电量" unit="万kWh" curr={s.purchasedElecCurr} last={s.purchasedElecLast} onCurr={set("purchasedElecCurr")} onLast={set("purchasedElecLast")} />
          <PgRow label="电力综合能耗（等价值）" unit="tce" curr={s.elecEnergyEqCurr} last={s.elecEnergyEqLast} onCurr={set("elecEnergyEqCurr")} onLast={set("elecEnergyEqLast")} />
          <PgRow label="电力产量" unit="万kWh" curr={s.elecOutputCurr} last={s.elecOutputLast} onCurr={set("elecOutputCurr")} onLast={set("elecOutputLast")} />
          <ComputedRow label="电力单位产量综合能耗（等价值）" value={`${round(calc.elecUnit, 4)} tce/万kWh`} formula="电力综合能耗（等价值） ÷ 电力产量" />
          <PgRow label="热力综合能耗（当量值）" unit="tce" curr={s.heatEnergyStdCurr} last={s.heatEnergyStdLast} onCurr={set("heatEnergyStdCurr")} onLast={set("heatEnergyStdLast")} />
          <PgRow label="热力产量" unit="百万千焦" curr={s.heatOutputCurr} last={s.heatOutputLast} onCurr={set("heatOutputCurr")} onLast={set("heatOutputLast")} />
          <ComputedRow label="热力单位产量综合能耗（当量值）" value={`${round(calc.heatUnit, 4)} tce/GJ`} formula="热力综合能耗（当量值） ÷ 热力产量" />
        </CardContent>
      </Card>
    </div>
  );
}

function PgRow({
  label,
  unit,
  curr,
  last,
  onCurr,
  onLast,
}: {
  label: string;
  unit: string;
  curr: number;
  last: number;
  onCurr: (v: number) => void;
  onLast: (v: number) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <FieldBox
        label={`${label}（今年累计）`}
        unit={unit}
        value={curr}
        onChange={onCurr}
        kind="input"
      />
      <FieldBox
        label={`${label}（去年同期）`}
        unit={unit}
        value={last}
        onChange={onLast}
        kind="muted"
      />
    </div>
  );
}

function FieldBox({
  label,
  unit,
  value,
  onChange,
  kind,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  kind: "input" | "muted";
}) {
  const muted = kind === "muted";
  return (
    <div
      className={
        muted
          ? "rounded-md border border-border bg-muted/30 p-3"
          : "rounded-md border border-success/40 bg-success/[0.06] p-3"
      }
    >
      <div className="flex items-center justify-between">
        <Label className="text-xs text-foreground">{label}</Label>
        {muted ? null : (
          <Badge variant="outline" className="h-5 border-success/40 bg-success/10 px-1.5 text-[10px] text-success">
            企业填报
          </Badge>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder={muted ? "" : "本月填写"}
          className={muted ? "h-9 font-mono text-muted-foreground" : "h-9 font-mono"}
        />
        <span className="shrink-0 text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
function ComputedRow({ label, value, formula }: { label: string; value: string; formula: string }) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/[0.05] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-3.5 w-3.5 text-primary" />
          <Label className="text-sm font-medium text-foreground">{label}</Label>
          <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
            系统计算
          </Badge>
        </div>
        <div className="font-mono text-base font-semibold text-primary">{value}</div>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">公式：{formula}</div>
    </div>
  );
}
