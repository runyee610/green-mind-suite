import { useMemo, useState } from "react";
import { Calculator, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DualField } from "./FieldDisplay";

const round = (n: number, d = 2) => {
  if (!isFinite(n)) return 0;
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};
const rate = (a: number, b: number): number | null => (b ? round(((a - b) / b) * 100, 2) : null);

// ============= 演示数据（详情页只读） =============
type Pair = { curr: number; last: number };
const demo: { sold: Pair; grid: Pair } = {
  sold: { curr: 48600, last: 46200 }, // 售电量（万kWh）
  grid: { curr: 51200, last: 48900 }, // 供电量（电网, 万kWh）
};

export function PowerSupplyDetailSection() {
  const d = demo;
  const lossCurr = d.grid.curr ? (1 - d.sold.curr / d.grid.curr) * 100 : 0;
  const lossLast = d.grid.last ? (1 - d.sold.last / d.grid.last) * 100 : 0;

  return (
    <Card className="panel scroll-mt-24">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">供电量与线损指标</h3>
            <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
              供电企业 专属
            </Badge>
          </div>
        </div>
        <Separator />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DualField label="售电量" unit="万kWh" kind="input" current={d.sold.curr} last={d.sold.last} rate={rate(d.sold.curr, d.sold.last)} />
          <DualField label="供电量（电网）" unit="万kWh" kind="input" current={d.grid.curr} last={d.grid.last} rate={rate(d.grid.curr, d.grid.last)} />
          <DualField
            label="综合线损率"
            unit="%"
            kind="computed"
            current={round(lossCurr, 2)}
            last={round(lossLast, 2)}
            rate={rate(lossCurr, lossLast)}
            formula="(1 − 售电量 ÷ 供电量) × 100%"
            source={`(1 − ${d.sold.curr} ÷ ${d.grid.curr}) × 100%`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============= 填报页可编辑版 =============
type PsState = {
  soldCurr: number; soldLast: number;
  gridCurr: number; gridLast: number;
};

const initialPs: PsState = {
  soldCurr: 0, soldLast: 46200,
  gridCurr: 0, gridLast: 48900,
};

export function PowerSupplyFillingSection() {
  const [s, setS] = useState<PsState>(initialPs);
  const set = (k: keyof PsState) => (v: number) => setS((prev) => ({ ...prev, [k]: v }));
  const calc = useMemo(() => {
    const loss = s.gridCurr ? (1 - s.soldCurr / s.gridCurr) * 100 : 0;
    return { loss };
  }, [s]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-primary" /> 供电量与线损指标
          <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
            供电企业 专属
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PsRow label="售电量" unit="万kWh" curr={s.soldCurr} last={s.soldLast} onCurr={set("soldCurr")} onLast={set("soldLast")} />
        <PsRow label="供电量（电网）" unit="万kWh" curr={s.gridCurr} last={s.gridLast} onCurr={set("gridCurr")} onLast={set("gridLast")} />
        <ComputedRow label="综合线损率" value={`${round(calc.loss, 2)} %`} formula="(1 − 售电量 ÷ 供电量) × 100%" />
      </CardContent>
    </Card>
  );
}

function PsRow({
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
    <div className="rounded-md border border-success/40 bg-success/[0.04] p-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-foreground">{label}</Label>
          <span className="ml-2 text-[11px] text-muted-foreground">单位：{unit}</span>
        </div>
        <Badge variant="outline" className="h-5 border-success/40 bg-success/10 px-1.5 text-[10px] text-success">
          企业填报
        </Badge>
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <div>
          <div className="text-[11px] text-muted-foreground">今年累计</div>
          <Input
            type="number"
            value={curr || ""}
            onChange={(e) => onCurr(Number(e.target.value) || 0)}
            placeholder="本月填写"
            className="mt-1 h-9 font-mono"
          />
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">去年同期</div>
          <Input
            type="number"
            value={last || ""}
            onChange={(e) => onLast(Number(e.target.value) || 0)}
            className="mt-1 h-9 font-mono text-muted-foreground"
          />
        </div>
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
