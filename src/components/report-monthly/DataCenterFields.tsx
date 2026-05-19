import { useMemo, useState } from "react";
import { Calculator, Plus, Server, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const round = (n: number, d = 2) => {
  if (!isFinite(n)) return 0;
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

// 折标系数（等价值）
const COEF_ELEC_EQ = 1.229; // 万kWh -> 吨标煤
const COEF_DIESEL = 1.4571; // 吨柴油 -> 吨标煤

type DataCenter = {
  id: number;
  name: string;
  racks: number; // 在用机架数
  itLoadRate: number; // IT设备负荷使用率 %
  itEnergy: number; // IT信息设备电能消耗 万kWh
  totalEnergy: number; // 数据中心总电能消耗 万kWh
  diesel: number; // 柴油用量 吨
  cpue: number; // 综合电能利用效率 CPUE（选填）
};

let _idCounter = 1;
const newDC = (name = ""): DataCenter => ({
  id: _idCounter++,
  name,
  racks: 0,
  itLoadRate: 0,
  itEnergy: 0,
  totalEnergy: 0,
  diesel: 0,
  cpue: 0,
});

const initialDCs: DataCenter[] = [newDC("电信信息园区 B1 数据中心"), newDC("华京数据中心")];

export function DataCenterFillingSection() {
  const [list, setList] = useState<DataCenter[]>(initialDCs);
  const update = (id: number, k: keyof DataCenter, v: string | number) =>
    setList((prev) => prev.map((d) => (d.id === id ? { ...d, [k]: v } : d)));
  const add = () => setList((prev) => [...prev, newDC(`数据中心 ${prev.length + 1}`)]);
  const remove = (id: number) => setList((prev) => prev.filter((d) => d.id !== id));

  const totals = useMemo(() => {
    const eq = list.reduce((a, d) => a + d.totalEnergy * COEF_ELEC_EQ + d.diesel * COEF_DIESEL, 0);
    return { eq };
  }, [list]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Server className="h-4 w-4 text-primary" /> 数据中心明细
          <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
            电信企业 专属
          </Badge>
          <span className="ml-auto flex items-center gap-2 text-[11px] font-normal text-muted-foreground">
            合计综合能耗（等价值）
            <span className="font-mono text-sm font-semibold text-primary">{round(totals.eq)} 吨标煤</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.map((dc, idx) => {
          const compEq = dc.totalEnergy * COEF_ELEC_EQ + dc.diesel * COEF_DIESEL;
          const pue = dc.itEnergy ? dc.totalEnergy / dc.itEnergy : 0;
          return (
            <div key={dc.id} className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="h-6 border-primary/40 bg-primary/10 px-2 text-xs text-primary">
                  数据中心 #{idx + 1}
                </Badge>
                <div className="flex flex-1 items-center gap-2 min-w-[260px]">
                  <Label className="shrink-0 text-xs text-muted-foreground">名称</Label>
                  <Input
                    value={dc.name}
                    onChange={(e) => update(dc.id, "name", e.target.value)}
                    placeholder="请输入数据中心名称"
                    className="h-8"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(dc.id)}
                  disabled={list.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </Button>
              </div>

              {/* 填报项 */}
              <div className="grid gap-2 md:grid-cols-3">
                <NumField label="在用机架数" unit="个" value={dc.racks} onChange={(v) => update(dc.id, "racks", v)} />
                <NumField label="IT设备负荷使用率" unit="%" value={dc.itLoadRate} onChange={(v) => update(dc.id, "itLoadRate", v)} />
                <NumField label="IT信息设备电能消耗" unit="万kWh" value={dc.itEnergy} onChange={(v) => update(dc.id, "itEnergy", v)} />
                <NumField label="数据中心总电能消耗" unit="万kWh" value={dc.totalEnergy} onChange={(v) => update(dc.id, "totalEnergy", v)} />
                <NumField label="柴油用量" unit="吨" value={dc.diesel} onChange={(v) => update(dc.id, "diesel", v)} />
                <NumField label="数据中心综合电能利用效率 CPUE" unit="（选填）" value={dc.cpue} onChange={(v) => update(dc.id, "cpue", v)} optional />
              </div>

              {/* 系统计算 */}
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <ComputedField
                  label="数据中心综合能耗（等价值）"
                  value={`${round(compEq)} 吨标煤`}
                  formula={`总电能 × ${COEF_ELEC_EQ} + 柴油 × ${COEF_DIESEL}`}
                />
                <ComputedField
                  label="数据中心电能利用效率 PUE"
                  value={round(pue, 3).toString()}
                  formula="总电能消耗 ÷ IT信息设备电能消耗"
                />
              </div>
            </div>
          );
        })}

        <Button variant="outline" size="sm" className="w-full gap-1.5 border-dashed" onClick={add}>
          <Plus className="h-4 w-4" />
          新增数据中心
        </Button>
      </CardContent>
    </Card>
  );
}

// ============= 详情页只读 =============
export function DataCenterDetailSection() {
  const list = initialDCs.map((d, i) => ({
    ...d,
    name: i === 0 ? "电信信息园区 B1 数据中心" : "华京数据中心",
    racks: i === 0 ? 820 : 540,
    itLoadRate: i === 0 ? 68 : 72,
    itEnergy: i === 0 ? 1860 : 1240,
    totalEnergy: i === 0 ? 2780 : 1920,
    diesel: i === 0 ? 18 : 12,
    cpue: i === 0 ? 1.42 : 1.5,
  }));

  return (
    <Card className="panel scroll-mt-24">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Server className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">数据中心明细</h3>
          <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
            电信企业 专属
          </Badge>
        </div>
        <div className="space-y-3">
          {list.map((dc, idx) => {
            const eq = dc.totalEnergy * COEF_ELEC_EQ + dc.diesel * COEF_DIESEL;
            const pue = dc.itEnergy ? dc.totalEnergy / dc.itEnergy : 0;
            return (
              <div key={idx} className="rounded-md border border-border bg-muted/10 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
                    #{idx + 1}
                  </Badge>
                  <span className="font-semibold text-foreground text-lg">{dc.name}</span>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-3">
                  <ReadField label="在用机架数" value={`${dc.racks} 个`} />
                  <ReadField label="IT设备负荷使用率" value={`${dc.itLoadRate} %`} />
                  <ReadField label="IT信息设备电能消耗" value={`${dc.itEnergy} 万kWh`} />
                  <ReadField label="数据中心总电能消耗" value={`${dc.totalEnergy} 万kWh`} />
                  <ReadField label="柴油用量" value={`${dc.diesel} 吨`} />
                  <ReadField label="CPUE（选填）" value={dc.cpue ? dc.cpue.toString() : "—"} />
                  <ReadField label="综合能耗（等价值）" value={`${round(eq)} 吨标煤`} computed />
                  <ReadField label="电能利用效率 PUE" value={round(pue, 3).toString()} computed />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============= 子组件 =============
function NumField({
  label,
  unit,
  value,
  onChange,
  optional,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  optional?: boolean;
}) {
  return (
    <div className="rounded-md border border-success/40 bg-success/[0.06] p-2.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-foreground">{label}</Label>
        {optional ? (
          <Badge variant="outline" className="h-4 border-border bg-muted/40 px-1 text-[9px] text-muted-foreground">
            选填
          </Badge>
        ) : (
          <Badge variant="outline" className="h-4 border-success/40 bg-success/10 px-1 text-[9px] text-success">
            填报
          </Badge>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-8 font-mono text-sm"
        />
        <span className="shrink-0 text-[11px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function ComputedField({ label, value, formula }: { label: string; value: string; formula: string }) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/[0.06] p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Calculator className="h-3 w-3 text-primary" />
          <Label className="text-[11px] font-medium text-foreground">{label}</Label>
        </div>
        <Badge variant="outline" className="h-4 border-primary/40 bg-primary/10 px-1 text-[9px] text-primary">
          系统计算
        </Badge>
      </div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div className="text-[10px] text-muted-foreground">公式：{formula}</div>
        <div className="font-mono text-sm font-semibold text-primary">{value}</div>
      </div>
    </div>
  );
}

function ReadField({ label, value, computed }: { label: string; value: string; computed?: boolean }) {
  return (
    <div
      className={
        computed
          ? "rounded border border-primary/30 bg-primary/[0.06] px-2 py-1.5"
          : "rounded border border-border bg-background px-2 py-1.5"
      }
    >
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={computed ? "mt-0.5 font-mono text-xs font-semibold text-primary" : "mt-0.5 font-mono text-xs text-foreground"}>
        {value}
      </div>
    </div>
  );
}
