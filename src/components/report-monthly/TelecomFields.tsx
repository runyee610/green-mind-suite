import { useState } from "react";
import { Calculator, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DualField } from "./FieldDisplay";

const round = (n: number, d = 2) => {
  if (!isFinite(n)) return 0;
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};
const rate = (a: number, b: number): number | null => (b ? round(((a - b) / b) * 100, 2) : null);

// ============= 详情页只读 =============
type Demo = {
  totalCurr: number; totalLast: number; // 电信业务总量（万元）
  totalEqEnergyCurr: number; totalEqEnergyLast: number; // 综合能耗等价值（吨标煤）
  totalStEnergyCurr: number; totalStEnergyLast: number; // 综合能耗当量值（吨标煤）
};

const demo: Demo = {
  totalCurr: 286500, totalLast: 254300,
  totalEqEnergyCurr: 18620, totalEqEnergyLast: 17400,
  totalStEnergyCurr: 14820, totalStEnergyLast: 13880,
};

export function TelecomDetailSection() {
  const d = demo;
  const unitEqCurr = d.totalCurr ? d.totalEqEnergyCurr / d.totalCurr : 0;
  const unitEqLast = d.totalLast ? d.totalEqEnergyLast / d.totalLast : 0;
  const unitStCurr = d.totalCurr ? d.totalStEnergyCurr / d.totalCurr : 0;
  const unitStLast = d.totalLast ? d.totalStEnergyLast / d.totalLast : 0;

  return (
    <Card className="panel scroll-mt-24">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Radio className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">电信业务总量与单位能耗</h3>
          <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
            电信企业 专属
          </Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DualField
            label="电信业务总量"
            unit="万元"
            kind="input"
            current={d.totalCurr}
            last={d.totalLast}
            rate={rate(d.totalCurr, d.totalLast)}
          />
          <DualField
            label="单位电信业务总量能耗（等价值）"
            unit="吨标煤/万元"
            kind="computed"
            current={round(unitEqCurr, 4)}
            last={round(unitEqLast, 4)}
            rate={rate(unitEqCurr, unitEqLast)}
            formula="综合能耗等价值量 ÷ 电信业务总量"
            source={`${d.totalEqEnergyCurr} ÷ ${d.totalCurr}`}
          />
          <DualField
            label="单位电信业务总量能耗（当量值）"
            unit="吨标煤/万元"
            kind="computed"
            current={round(unitStCurr, 4)}
            last={round(unitStLast, 4)}
            rate={rate(unitStCurr, unitStLast)}
            formula="综合能耗当量值量 ÷ 电信业务总量"
            source={`${d.totalStEnergyCurr} ÷ ${d.totalCurr}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============= 填报页可编辑版（替换“工业产值”步骤） =============
export function TelecomFillingSection({
  totalCurr,
  totalLast,
  onTotalCurr,
  onTotalLast,
  unitEq,
  unitSt,
}: {
  totalCurr: number;
  totalLast: number;
  onTotalCurr: (v: number) => void;
  onTotalLast: (v: number) => void;
  unitEq: number;
  unitSt: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="h-4 w-4 text-primary" /> 电信业务总量
          <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
            电信企业 专属
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <FieldBox label="电信业务总量（今年累计）" unit="万元" value={totalCurr} onChange={onTotalCurr} />
          <FieldBox label="电信业务总量（去年累计）" unit="万元" value={totalLast} onChange={onTotalLast} muted />
        </div>
        <ComputedRow
          label="单位电信业务总量能耗（等价值）"
          value={`${round(unitEq, 4)} 吨标煤/万元`}
          formula="综合能耗等价值量 ÷ 电信业务总量"
        />
        <ComputedRow
          label="单位电信业务总量能耗（当量值）"
          value={`${round(unitSt, 4)} 吨标煤/万元`}
          formula="综合能耗当量值量 ÷ 电信业务总量"
        />
      </CardContent>
    </Card>
  );
}

function FieldBox({
  label, unit, value, onChange, muted,
}: { label: string; unit: string; value: number; onChange: (v: number) => void; muted?: boolean }) {
  return (
    <div className={muted ? "rounded-md border border-border bg-muted/30 p-3" : "rounded-md border border-success/40 bg-success/[0.06] p-3"}>
      <div className="flex items-center justify-between gap-2">
        <Label className="whitespace-nowrap text-xs text-foreground">{label}</Label>
        {!muted && (
          <Badge variant="outline" className="h-5 shrink-0 border-success/40 bg-success/10 px-1.5 text-[10px] text-success">
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Calculator className="h-3.5 w-3.5 shrink-0 text-primary" />
          <Label className="whitespace-nowrap text-sm font-medium text-foreground">{label}</Label>
          <Badge variant="outline" className="h-5 shrink-0 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
            系统计算
          </Badge>
        </div>
        <div className="shrink-0 font-mono text-sm font-semibold text-primary">{value}</div>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">公式：{formula}</div>
    </div>
  );
}
