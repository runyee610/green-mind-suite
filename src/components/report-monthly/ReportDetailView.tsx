import { ArrowLeft, Database, Factory, FileEdit, Flame, Leaf, Pencil, Printer, Sigma, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DualField, SingleField } from "./FieldDisplay";
import {
  buildDetailForReport,
  changeRate,
  isAbnormal,
  round,
  sumEquivalent,
  sumGreenEquivalent,
  sumGreenStandard,
  sumStandard,
} from "./detailFields";
import type { MonthlyReport } from "./monthlyReportData";
import { ENTERPRISE_TYPES, SpecialFieldsPlaceholder, TYPE_HAS_STEAM, type EnterpriseTypeId } from "./EnterpriseTypeSwitcher";
import { PowerGenDetailSection } from "./PowerGenFields";
import { PowerSupplyDetailSection } from "./PowerSupplyFields";
import { NonEnergyDetailSection } from "./NonEnergyFields";
import { TelecomDetailSection } from "./TelecomFields";
import { DataCenterDetailSection } from "./DataCenterFields";

export function ReportDetailView({ report, onBack, onFill, enterpriseType = TYPE_HAS_STEAM }: { report: MonthlyReport; onBack?: () => void; onFill?: () => void; enterpriseType?: EnterpriseTypeId }) {
  const showSteam = enterpriseType === TYPE_HAS_STEAM;
  const showPowerGen = enterpriseType === "power_gen";
  const showPowerSupply = enterpriseType === "power_supply";
  const showNonEnergy = enterpriseType === "non_energy";
  const showTelecom = enterpriseType === "telecom";
  const enterpriseTypeLabel = ENTERPRISE_TYPES.find((t) => t.id === enterpriseType)?.label ?? "";
  const detail = buildDetailForReport(report.name);
  const v = detail.energyVarieties;

  // === 合计（总量等价值/当量值）===
  const sumConsEqCurr = sumEquivalent(v, "consumptionYTD");
  const sumConsEqLast = sumEquivalent(v, "consumptionYTDLast");
  const sumConsStCurr = sumStandard(v, "consumptionYTD");
  const sumConsStLast = sumStandard(v, "consumptionYTDLast");

  const sumOutEqCurr = sumEquivalent(v, "outputYTD");
  const sumOutEqLast = sumEquivalent(v, "outputYTDLast");
  const sumOutStCurr = sumStandard(v, "outputYTD");
  const sumOutStLast = sumStandard(v, "outputYTDLast");

  // === 综合能耗（等价值/当量值）= 消费总量 - 外供总量 ===
  const totalEqCurr = sumConsEqCurr - sumOutEqCurr;
  const totalEqLast = sumConsEqLast - sumOutEqLast;
  const totalStCurr = sumConsStCurr - sumOutStCurr;
  const totalStLast = sumConsStLast - sumOutStLast;

  // === 扣除绿电/绿证/可再生能源后的综合能耗 ===
  const greenEqCurr = sumGreenEquivalent(v, "consumptionYTD");
  const greenEqLast = sumGreenEquivalent(v, "consumptionYTDLast");
  const greenStCurr = sumGreenStandard(v, "consumptionYTD");
  const greenStLast = sumGreenStandard(v, "consumptionYTDLast");

  const totalEqExGreenCurr = totalEqCurr - greenEqCurr;
  const totalEqExGreenLast = totalEqLast - greenEqLast;
  const totalStExGreenCurr = totalStCurr - greenStCurr;
  const totalStExGreenLast = totalStLast - greenStLast;

  // === 万元产值能耗 ===
  const outputCurr = detail.industrialOutputYTD;
  const outputLast = detail.industrialOutputYTDLast;
  const unitEqCurr = outputCurr ? totalEqCurr / outputCurr : 0;
  const unitEqLast = outputLast ? totalEqLast / outputLast : 0;
  const unitStCurr = outputCurr ? totalStCurr / outputCurr : 0;
  const unitStLast = outputLast ? totalStLast / outputLast : 0;

  // === 万元产值碳排放量 ===
  const carbonCurr = detail.carbonYTD;
  const carbonLast = detail.carbonYTDLast;
  const unitCarbonCurr = carbonCurr && outputCurr ? carbonCurr / outputCurr : null;
  const unitCarbonLast = carbonLast && outputLast ? carbonLast / outputLast : null;

  // === 蒸汽单位产量综合能耗（等价值）===
  const steamUnitCurr = detail.steamOutputYTD ? detail.steamEnergyYTD / detail.steamOutputYTD : 0;
  const steamUnitLast = detail.steamOutputYTDLast ? detail.steamEnergyYTDLast / detail.steamOutputYTDLast : 0;

  return (
    <div className="space-y-4">
      {/* === 顶部信息条：放大企业名 + 副标题 + 右侧返回按钮 === */}
      <Card className="panel-glow">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight text-foreground lg:text-3xl">
              {report.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                {detail.enterpriseType}
              </Badge>
              <span className="font-mono text-muted-foreground">{report.code}</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">{report.district}</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">
                统计月份：<span className="font-mono text-foreground">{report.month}</span>
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              导出报告
            </Button>
            {onBack ? (
              <Button size="sm" className="gap-2" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                返回月度管理
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* === 图例 === */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
        <span className="text-muted-foreground">字段类型：</span>
        <Badge variant="outline" className="gap-1 border-success/40 bg-success/10 text-success">
          <Pencil className="h-3 w-3" />
          企业填报项
        </Badge>
        <Badge variant="outline" className="gap-1 border-primary/40 bg-primary/10 text-primary">
          <Sigma className="h-3 w-3" />
          系统计算项（hover 查看公式与数据来源）
        </Badge>
        <span className="ml-auto text-muted-foreground">
          ⓘ 同比变化率绝对值 &gt; 10% 自动告警
        </span>
      </div>

      {/* === 能源品种明细表 === */}
      <DetailSection id="section-energy-detail" icon={Flame} title="能源品种消费明细" subtitle="能源品种与计量单位继承自企业基本信息所勾选的能源品种">
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="text-foreground">能源品种</TableHead>
                <TableHead className="text-foreground">计量单位</TableHead>
                <TableHead className="text-foreground">企业消费量<br /><span className="text-[10px] text-muted-foreground">今年/去年累计</span></TableHead>
                <TableHead className="text-foreground">同比变化率</TableHead>
                <TableHead className="text-foreground">用于原材料<br /><span className="text-[10px] text-muted-foreground">今年/去年</span></TableHead>
                <TableHead className="text-foreground">非工业累计消费<br /><span className="text-[10px] text-muted-foreground">今年/去年</span></TableHead>
                <TableHead className="text-foreground">外供量<br /><span className="text-[10px] text-muted-foreground">今年/去年</span></TableHead>
                <TableHead className="text-foreground">折标系数<br /><span className="text-[10px] text-muted-foreground">等价值/当量值</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {v.map((item) => {
                const rate = changeRate(item.consumptionYTD, item.consumptionYTDLast);
                const abnormal = isAbnormal(rate);
                return (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{item.name}</span>
                        {item.isGreen ? (
                          <Badge variant="outline" className="h-5 gap-1 border-success/40 bg-success/10 px-1.5 text-[10px] text-success">
                            <Leaf className="h-2.5 w-2.5" />
                            绿色
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="text-success">{item.consumptionYTD.toLocaleString()}</div>
                      <div className="text-muted-foreground">{item.consumptionYTDLast.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs",
                          abnormal
                            ? "border-destructive/40 bg-destructive/10 text-destructive"
                            : "border-border bg-muted/40 text-muted-foreground",
                        )}
                      >
                        {rate === null ? "—" : `${rate > 0 ? "+" : ""}${rate.toFixed(2)}%`}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="text-success">{item.materialYTD.toLocaleString()}</div>
                      <div className="text-muted-foreground">{item.materialYTDLast.toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="text-success">{item.nonIndustrialYTD.toLocaleString()}</div>
                      <div className="text-muted-foreground">{item.nonIndustrialYTDLast.toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="text-success">{item.outputYTD.toLocaleString()}</div>
                      <div className="text-muted-foreground">{item.outputYTDLast.toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <div>等价 {item.coefEquivalent}</div>
                      <div>当量 {item.coefStandard}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          注：折标系数（等价值/当量值）来源于<strong className="text-foreground">企业信息 - 能源品种</strong>，由企业在基本信息中维护。
        </p>
      </DetailSection>

      {/* === 综合能耗 === */}
      <DetailSection id="section-total-energy" icon={Database} title="综合能耗">
        <div className="grid gap-3 md:grid-cols-2">
          <DualField
            label="综合能耗（等价值）"
            unit="吨标准煤"
            kind="computed"
            current={round(totalEqCurr)}
            last={round(totalEqLast)}
            rate={changeRate(totalEqCurr, totalEqLast)}
            formula="企业消费等价值总量 − 外供等价值总量"
            source={`企业消费等价值总量 ${round(sumConsEqCurr)} − 外供等价值总量 ${round(sumOutEqCurr)}`}
          />
          <DualField
            label="综合能耗（当量值）"
            unit="吨标准煤"
            kind="computed"
            current={round(totalStCurr)}
            last={round(totalStLast)}
            rate={changeRate(totalStCurr, totalStLast)}
            formula="企业消费当量值总量 − 外供当量值总量"
            source={`企业消费当量值总量 ${round(sumConsStCurr)} − 外供当量值总量 ${round(sumOutStCurr)}`}
          />
          <DualField
            label="综合能耗（扣除绿电绿证可再生能源 - 等价值）"
            unit="吨标准煤"
            kind="computed"
            current={round(totalEqExGreenCurr)}
            last={round(totalEqExGreenLast)}
            rate={changeRate(totalEqExGreenCurr, totalEqExGreenLast)}
            formula="综合能耗等价值 − ∑(绿电+绿证+可再生能源) × 等价值折标系数"
            source={`综合能耗等价值 ${round(totalEqCurr)} − 绿色能源等价值合计 ${round(greenEqCurr)}`}
          />
          <DualField
            label="综合能耗（扣除绿电绿证可再生能源 - 当量值）"
            unit="吨标准煤"
            kind="computed"
            current={round(totalStExGreenCurr)}
            last={round(totalStExGreenLast)}
            rate={changeRate(totalStExGreenCurr, totalStExGreenLast)}
            formula="综合能耗当量值 − ∑(绿电+绿证+可再生能源) × 当量值折标系数"
            source={`综合能耗当量值 ${round(totalStCurr)} − 绿色能源当量值合计 ${round(greenStCurr)}`}
          />
        </div>
      </DetailSection>

      {/* === 工业产值 / 电信业务总量 与单位能耗 === */}
      {showTelecom ? (
        <DetailSection id="section-output" icon={Factory} title="电信业务总量与单位能耗">
          <TelecomDetailSection />
        </DetailSection>
      ) : (
        <DetailSection id="section-output" icon={Factory} title="工业产值与单位能耗">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DualField
              label="工业生产总值"
              unit="万元"
              kind="input"
              current={detail.industrialOutputYTD}
              last={detail.industrialOutputYTDLast}
              rate={changeRate(detail.industrialOutputYTD, detail.industrialOutputYTDLast)}
            />
            <DualField
              label="万元产值能耗（等价值）"
              unit="吨标煤/万元"
              kind="computed"
              current={round(unitEqCurr, 4)}
              last={round(unitEqLast, 4)}
              rate={changeRate(unitEqCurr, unitEqLast)}
              formula="综合能耗（等价值） ÷ 工业生产总值"
              source={`综合能耗等价值 ${round(totalEqCurr)} tce ÷ 工业生产总值 ${detail.industrialOutputYTD.toLocaleString()} 万元`}
            />
            <DualField
              label="万元产值能耗（当量值）"
              unit="吨标煤/万元"
              kind="computed"
              current={round(unitStCurr, 4)}
              last={round(unitStLast, 4)}
              rate={changeRate(unitStCurr, unitStLast)}
              formula="综合能耗（当量值） ÷ 工业生产总值"
              source={`综合能耗当量值 ${round(totalStCurr)} tce ÷ 工业生产总值 ${detail.industrialOutputYTD.toLocaleString()} 万元`}
            />
          </div>
        </DetailSection>
      )}

      {/* === 碳排放 === */}
      <DetailSection id="section-carbon" icon={Sparkles} title="碳排放（选填）">
        <div className="grid gap-3 md:grid-cols-2">
          <DualField
            label="综合碳排放量"
            unit="吨二氧化碳"
            kind="input"
            current={detail.carbonYTD ?? "—"}
            last={detail.carbonYTDLast ?? "—"}
            rate={carbonCurr && carbonLast ? changeRate(carbonCurr, carbonLast) : undefined}
          />
          <DualField
            label="万元产值碳排放量"
            unit="吨二氧化碳/万元"
            kind="computed"
            current={unitCarbonCurr === null ? "—" : round(unitCarbonCurr, 4)}
            last={unitCarbonLast === null ? "—" : round(unitCarbonLast, 4)}
            rate={unitCarbonCurr !== null && unitCarbonLast !== null ? changeRate(unitCarbonCurr, unitCarbonLast) : undefined}
            formula={showTelecom ? "综合碳排放量 ÷ 电信业务总量" : "综合碳排放量 ÷ 工业生产总值"}
            source={showTelecom ? "综合碳排放量 ÷ 电信业务总量" : "综合碳排放量 ÷ 工业生产总值"}
          />
        </div>
      </DetailSection>

      {/* === 特殊字段：按企业类型差异化 === */}
      {showSteam ? (
        <DetailSection id="section-steam" icon={Flame} title={`蒸汽相关指标（${enterpriseTypeLabel} 专属）`}>
          <div className="grid gap-3 md:grid-cols-3">
            <DualField
              label="蒸汽综合能耗（等价值）"
              unit="tce"
              kind="input"
              current={detail.steamEnergyYTD}
              last={detail.steamEnergyYTDLast}
              rate={changeRate(detail.steamEnergyYTD, detail.steamEnergyYTDLast)}
            />
            <DualField
              label="蒸汽产量"
              unit="吨"
              kind="input"
              current={detail.steamOutputYTD}
              last={detail.steamOutputYTDLast}
              rate={changeRate(detail.steamOutputYTD, detail.steamOutputYTDLast)}
            />
            <DualField
              label="蒸汽单位产量综合能耗（等价值）"
              unit="tce/吨"
              kind="computed"
              current={round(steamUnitCurr, 6)}
              last={round(steamUnitLast, 6)}
              rate={changeRate(steamUnitCurr, steamUnitLast)}
              formula="蒸汽综合能耗（等价值） ÷ 蒸汽产量"
              source={`蒸汽综合能耗 ${detail.steamEnergyYTD} tce ÷ 蒸汽产量 ${detail.steamOutputYTD.toLocaleString()} 吨`}
            />
          </div>
        </DetailSection>
      ) : showPowerGen ? (
        <PowerGenDetailSection />
      ) : showPowerSupply ? (
        <PowerSupplyDetailSection />
      ) : showNonEnergy ? (
        <NonEnergyDetailSection />
      ) : showTelecom ? (
        <DataCenterDetailSection />
      ) : (
        <SpecialFieldsPlaceholder typeLabel={enterpriseTypeLabel} />
      )}

      {/* 兼容防止未使用警告 */}
      <span className="hidden">{SingleField.name}</span>
    </div>
  );
}

function DetailSection({
  id,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card id={id} className="panel scroll-mt-24">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle ? <p className="text-[11px] text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        <Separator />
        {children}
      </CardContent>
    </Card>
  );
}

