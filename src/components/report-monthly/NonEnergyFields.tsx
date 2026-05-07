import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Package, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// ============= 数据结构 =============
export type NonEnergyProduct = {
  id: string;
  name: string; // 产品名称（如 A 产品）
  unit: string; // 产量计量单位（如 万磅、吨、件）
  energyCurr: number; // 综合能耗（当量值）今年累计 吨标准煤
  energyLast: number; // 综合能耗（当量值）去年同期 吨标准煤
  outputCurr: number; // 产量 今年累计
  outputLast: number; // 产量 去年同期
};

const demoProducts: NonEnergyProduct[] = [
  { id: "p-a", name: "A 产品", unit: "万磅", energyCurr: 2480, energyLast: 2360, outputCurr: 18.6, outputLast: 17.9 },
  { id: "p-b", name: "B 产品", unit: "吨", energyCurr: 1620, energyLast: 1540, outputCurr: 9200, outputLast: 8950 },
];

// ============= 详情页只读版 =============
export function NonEnergyDetailSection({ products = demoProducts }: { products?: NonEnergyProduct[] }) {
  return (
    <Card className="panel scroll-mt-24">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Package className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">分产品单位产量综合能耗</h3>
              <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
                非能源加工转换工业企业 专属
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              企业可按主要产品分别填报综合能耗与产量，系统自动计算单位产量综合能耗（当量值）
            </p>
          </div>
        </div>
        <Separator />

        {products.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/20 py-8 text-center text-sm text-muted-foreground">
            暂未填报产品数据
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p, idx) => {
              const unitCurr = p.outputCurr ? p.energyCurr / p.outputCurr : 0;
              const unitLast = p.outputLast ? p.energyLast / p.outputLast : 0;
              return (
                <div key={p.id} className="rounded-md border border-border/60 bg-muted/20 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
                      产品 {idx + 1}
                    </Badge>
                    <h4 className="text-sm font-semibold text-foreground">{p.name}</h4>
                    <span className="text-[11px] text-muted-foreground">产量单位：{p.unit}</span>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-success">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                        填报项
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <DualField
                          label={`${p.name}综合能耗（当量值）`}
                          unit="吨标准煤"
                          kind="input"
                          current={p.energyCurr}
                          last={p.energyLast}
                          rate={rate(p.energyCurr, p.energyLast)}
                        />
                        <DualField
                          label={`${p.name}产量`}
                          unit={p.unit}
                          kind="input"
                          current={p.outputCurr}
                          last={p.outputLast}
                          rate={rate(p.outputCurr, p.outputLast)}
                        />
                      </div>
                    </div>
                    <div className="hidden self-center text-primary lg:flex">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                        系统计算
                      </div>
                      <div className="grid gap-2">
                        <DualField
                          label={`${p.name}单位产量综合能耗`}
                          unit={`吨标准煤/${p.unit}`}
                          kind="computed"
                          current={round(unitCurr, 4)}
                          last={round(unitLast, 4)}
                          rate={rate(unitCurr, unitLast)}
                          formula={`${p.name}综合能耗（当量值） ÷ ${p.name}产量`}
                          source={`${p.energyCurr} ÷ ${p.outputCurr}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= 填报页可编辑版（支持自主增减产品） =============
let _idCounter = 1000;
const newProduct = (): NonEnergyProduct => ({
  id: `p-${++_idCounter}`,
  name: "",
  unit: "",
  energyCurr: 0,
  energyLast: 0,
  outputCurr: 0,
  outputLast: 0,
});

export function NonEnergyFillingSection() {
  const [products, setProducts] = useState<NonEnergyProduct[]>([
    { id: "p-a", name: "A 产品", unit: "万磅", energyCurr: 0, energyLast: 2360, outputCurr: 0, outputLast: 17.9 },
  ]);

  const updateField = <K extends keyof NonEnergyProduct>(id: string, key: K, value: NonEnergyProduct[K]) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  };

  const addProduct = () => setProducts((prev) => [...prev, newProduct()]);
  const removeProduct = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const totals = useMemo(() => {
    const sumEnergy = products.reduce((a, p) => a + (p.energyCurr || 0), 0);
    return { sumEnergy, count: products.length };
  }, [products]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-primary" /> 分产品单位产量综合能耗
            <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
              非能源加工转换工业企业 专属
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              共 <span className="font-mono text-foreground">{totals.count}</span> 个产品 · 合计能耗{" "}
              <span className="font-mono text-foreground">{round(totals.sumEnergy)}</span> 吨标准煤
            </span>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={addProduct}>
              <Plus className="h-3.5 w-3.5" />
              新增产品
            </Button>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          按主要产品分别填报，可自主增减；每个产品的单位产量综合能耗由系统自动计算。
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/20 py-8 text-center text-sm text-muted-foreground">
            暂无产品，请点击右上角「新增产品」开始填报
          </div>
        ) : (
          products.map((p, idx) => {
            const unit = p.outputCurr ? p.energyCurr / p.outputCurr : 0;
            const unitLast = p.outputLast ? p.energyLast / p.outputLast : 0;
            return (
              <div key={p.id} className="rounded-md border border-border bg-background p-3">
                {/* 产品头部：名称/单位/删除 */}
                <div className="grid gap-2 md:grid-cols-[auto_1fr_180px_auto] md:items-end">
                  <Badge variant="outline" className="h-7 self-center border-primary/40 bg-primary/10 px-2 text-xs text-primary">
                    产品 {idx + 1}
                  </Badge>
                  <div>
                    <Label className="text-xs text-muted-foreground">产品名称</Label>
                    <Input
                      className="mt-1 h-9"
                      placeholder="例如：A 产品 / 钢板 / 水泥熟料"
                      value={p.name}
                      onChange={(e) => updateField(p.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">产量计量单位</Label>
                    <Input
                      className="mt-1 h-9 font-mono"
                      placeholder="例如：万磅 / 吨 / 件"
                      value={p.unit}
                      onChange={(e) => updateField(p.id, "unit", e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeProduct(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    删除
                  </Button>
                </div>

                <Separator className="my-3" />

                {/* 综合能耗（当量值） */}
                <div className="grid gap-2 md:grid-cols-2">
                  <FieldBox
                    label={`${p.name || "该产品"}综合能耗（当量值）（今年累计）`}
                    unit="吨标准煤"
                    value={p.energyCurr}
                    onChange={(v) => updateField(p.id, "energyCurr", v)}
                    kind="input"
                  />
                  <FieldBox
                    label={`${p.name || "该产品"}综合能耗（当量值）（去年同期）`}
                    unit="吨标准煤"
                    value={p.energyLast}
                    onChange={(v) => updateField(p.id, "energyLast", v)}
                    kind="muted"
                  />
                </div>

                {/* 产量 */}
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <FieldBox
                    label={`${p.name || "该产品"}产量（今年累计）`}
                    unit={p.unit || "—"}
                    value={p.outputCurr}
                    onChange={(v) => updateField(p.id, "outputCurr", v)}
                    kind="input"
                  />
                  <FieldBox
                    label={`${p.name || "该产品"}产量（去年同期）`}
                    unit={p.unit || "—"}
                    value={p.outputLast}
                    onChange={(v) => updateField(p.id, "outputLast", v)}
                    kind="muted"
                  />
                </div>

                {/* 计算结果 */}
                <div className="mt-2">
                  <ComputedRow
                    label={`${p.name || "该产品"}单位产量综合能耗`}
                    value={`${round(unit, 4)} 吨标准煤/${p.unit || "—"}`}
                    secondary={`去年同期：${round(unitLast, 4)}`}
                    formula={`${p.name || "该产品"}综合能耗（当量值） ÷ ${p.name || "该产品"}产量`}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* 底部添加按钮 */}
        {products.length > 0 ? (
          <Button variant="outline" className="w-full gap-1.5 border-dashed" onClick={addProduct}>
            <Plus className="h-4 w-4" />
            继续新增产品
          </Button>
        ) : null}
      </CardContent>
    </Card>
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

function ComputedRow({
  label,
  value,
  secondary,
  formula,
}: {
  label: string;
  value: string;
  secondary?: string;
  formula: string;
}) {
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
        <div className="text-right">
          <div className="font-mono text-base font-semibold text-primary">{value}</div>
          {secondary ? <div className="text-[11px] text-muted-foreground">{secondary}</div> : null}
        </div>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">公式：{formula}</div>
    </div>
  );
}
