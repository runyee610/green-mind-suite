import { AlertTriangle, CheckCircle2, Printer, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FieldDisplay } from "./FieldDisplay";
import { energyIcons, fieldLegend, sectionAnchors, statusDot, statusStyle, type MonthlyReport } from "./monthlyReportData";

const fmt = (value: number, digits = 1) => value.toLocaleString(undefined, { maximumFractionDigits: digits });
const abnormal = (value: number) => Math.abs(value) > 10;

export function ReportDetailView({ report }: { report: MonthlyReport }) {
  return (
    <Card className="panel-glow overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-3">
        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div>
            <CardTitle className="text-base">月报全量详情</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{report.name} · {report.month}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("gap-2", statusStyle[report.status])}><span className={cn("h-2 w-2 rounded-full", statusDot[report.status])} />{report.status}</Badge>
            {fieldLegend.map((item) => <Badge key={item.kind} variant="outline" className={item.className}>{item.label}</Badge>)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-3">
          <Button size="sm" className="gap-2"><CheckCircle2 className="h-4 w-4" />审核通过</Button>
          <Button size="sm" variant="outline" className="gap-2"><RotateCcw className="h-4 w-4" />填写驳回意见</Button>
          <Button size="sm" variant="outline" className="gap-2"><Printer className="h-4 w-4" />打印PDF</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-0 xl:grid-cols-[148px_minmax(0,1fr)]">
        <nav className="sticky top-20 hidden h-fit space-y-1 border-r border-border/70 p-3 xl:block">
          {sectionAnchors.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`} className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground"><Icon className="h-3.5 w-3.5" />{label}</a>)}
        </nav>
        <div className="max-h-[calc(100vh-190px)] space-y-5 overflow-y-auto p-4">
          <DetailSection id="basic" title="A. 基础信息区"><div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3"><FieldDisplay label="企业名称" value={report.name} /><FieldDisplay label="统一社会信用代码" value={report.code} /><FieldDisplay label="行业分类" value={report.industry} /><FieldDisplay label="行政区划" value={report.district} /><FieldDisplay label="统计月份" value={report.month} /><FieldDisplay label="联系人" value={report.contact} /><FieldDisplay label="企业地址" value={report.address} /><FieldDisplay label="年度能耗限额" value={fmt(report.annualQuota, 0)} unit="tce" kind="computed" /></div></DetailSection>
          <DetailSection id="output" title="B. 工业产值区"><div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3"><FieldDisplay label="工业总产值" value={fmt(report.outputValue, 0)} unit="万元" /><FieldDisplay label="去年同期工业总产值" value={fmt(report.outputValueLast, 0)} unit="万元" kind="computed" /><FieldDisplay label="工业总产值增速" value={`${report.outputValueGrowth > 0 ? "+" : ""}${report.outputValueGrowth}%`} kind="computed" abnormal={abnormal(report.outputValueGrowth)} /><FieldDisplay label="工业增加值" value={fmt(report.addedValue, 0)} unit="万元" /><FieldDisplay label="去年同期工业增加值" value={fmt(report.addedValueLast, 0)} unit="万元" kind="computed" /><FieldDisplay label="工业增加值增速" value={`${report.addedValueGrowth > 0 ? "+" : ""}${report.addedValueGrowth}%`} kind="computed" abnormal={abnormal(report.addedValueGrowth)} /><FieldDisplay label="主要产品产量" value={fmt(report.productOutput, 0)} unit={report.productUnit} /></div></DetailSection>
          <DetailSection id="energy" title="C. 能源消费分类明细"><div className="grid gap-3 2xl:grid-cols-2">{report.energy.map((item) => { const Icon = energyIcons[item.name]; return <div key={item.name} className="rounded-md border border-border/70 bg-muted/15 p-3"><div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-secondary" />{item.name}</h4>{abnormal(item.yoy) ? <span className={cn("flex items-center gap-1 text-xs", item.yoy > 0 ? "text-destructive" : "text-warning")}><AlertTriangle className="h-3.5 w-3.5" />同比 {item.yoy > 0 ? "+" : ""}{item.yoy}%</span> : <span className="text-xs text-success">同比 {item.yoy > 0 ? "+" : ""}{item.yoy}%</span>}</div><div className="grid gap-3 sm:grid-cols-3"><FieldDisplay label="填报实物量" value={fmt(item.inputValue)} unit={item.unit} /><FieldDisplay label="等价值折标煤" value={fmt(item.equivalent)} unit="tce" kind="computed" /><FieldDisplay label="当量值折标煤" value={fmt(item.standard)} unit="tce" kind="computed" /></div></div>; })}</div></DetailSection>
          <DetailSection id="summary" title="D. 综合能耗汇总"><div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4"><FieldDisplay label="综合能源消费量（等价值）" value={fmt(report.totalEquivalent)} unit="tce" kind="computed" /><FieldDisplay label="综合能源消费量（当量值）" value={fmt(report.totalStandard)} unit="tce" kind="computed" /><FieldDisplay label="单位产值能耗" value={report.unitOutputEnergy} unit="tce/万元" kind="computed" /><FieldDisplay label="去年同期单位产值能耗" value={report.unitOutputEnergyLast} unit="tce/万元" kind="computed" /><FieldDisplay label="综合能耗去年同期值" value={fmt(report.totalLast)} unit="tce" kind="computed" /><FieldDisplay label="同比增减幅度" value={`${report.totalYoy > 0 ? "+" : ""}${report.totalYoy}%`} kind="computed" abnormal={abnormal(report.totalYoy)} /><FieldDisplay label="环比增减幅度" value={`${report.totalMom > 0 ? "+" : ""}${report.totalMom}%`} kind="computed" abnormal={abnormal(report.totalMom)} /></div></DetailSection>
          <DetailSection id="measures" title="E. 节能措施"><div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm leading-6 text-muted-foreground">{report.savingMeasure}</div></DetailSection>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-24 space-y-3"><div className="flex items-center gap-3"><h3 className="text-sm font-semibold text-secondary">{title}</h3><Separator className="flex-1" /></div>{children}</section>;
}