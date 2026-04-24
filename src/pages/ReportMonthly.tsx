import { useMemo, useState } from "react";
import { CheckCircle2, Download, Eye, FileDown, FileSpreadsheet, Search, XCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ReportDetailView } from "@/components/report-monthly/ReportDetailView";
import { exportFields, reports, statusDot, statusStyle, type MonthlyReport, type ReportStatus } from "@/components/report-monthly/monthlyReportData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const fmt = (value: number, digits = 1) => value.toLocaleString(undefined, { maximumFractionDigits: digits });

export default function ReportMonthly() {
  const [selected, setSelected] = useState<MonthlyReport>(reports[0]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([reports[0].code]);
  const [filters, setFilters] = useState({ keyword: "", status: "全部", industry: "全部", district: "全部", month: "2026-03" });
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkedFields, setCheckedFields] = useState(exportFields);

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const keywordHit = !filters.keyword || report.name.includes(filters.keyword) || report.code.includes(filters.keyword) || report.industry.includes(filters.keyword);
        return keywordHit && (filters.status === "全部" || report.status === filters.status) && (filters.industry === "全部" || report.industry === filters.industry) && (filters.district === "全部" || report.district === filters.district) && report.month === filters.month;
      }),
    [filters],
  );

  const stats = useMemo(() => {
    const submitted = reports.filter((item) => item.status !== "未填报").length;
    const pending = reports.filter((item) => item.status === "待审核").length;
    const overdue = reports.filter((item) => item.status === "未填报" || item.status === "已驳回").length;
    return [
      { label: "已报企业", value: `${submitted}/${reports.length}`, hint: "含待审、驳回与通过" },
      { label: "待审企业", value: pending, hint: "需监管人员处理" },
      { label: "逾期率", value: `${Math.round((overdue / reports.length) * 100)}%`, hint: "未填报及驳回待补正" },
    ];
  }, []);

  const allVisibleSelected = filteredReports.length > 0 && filteredReports.every((report) => selectedCodes.includes(report.code));

  const toggleReport = (code: string, checked: boolean) => setSelectedCodes((codes) => (checked ? Array.from(new Set([...codes, code])) : codes.filter((item) => item !== code)));
  const toggleVisible = (checked: boolean) => setSelectedCodes((codes) => (checked ? Array.from(new Set([...codes, ...filteredReports.map((item) => item.code)])) : codes.filter((code) => !filteredReports.some((item) => item.code === code))));

  const startExport = () => {
    setExporting(true);
    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer);
          setExporting(false);
          return 100;
        }
        return Math.min(100, value + 18);
      });
    }, 320);
  };

  return (
    <AppLayout title="节能月度报告" subtitle="政府侧重点用能单位企业节能月报监管、审核与全量字段导出">
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.12fr)_minmax(560px,0.88fr)]">
        <section className="min-w-0 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {stats.map((item) => <Card key={item.label} className="panel"><CardContent className="p-4"><p className="text-xs text-muted-foreground">{item.label}</p><div className="mt-2 text-2xl font-semibold font-mono text-secondary">{item.value}</div><p className="mt-1 text-xs text-muted-foreground">{item.hint}</p></CardContent></Card>)}
          </div>

          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base"><FileSpreadsheet className="h-4 w-4 text-secondary" />月报管理列表</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">全区企业填报进度、综合能耗与审核操作</p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setExportOpen(true)} disabled={selectedCodes.length === 0}><Download className="h-4 w-4" />一键导出 Excel</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className="relative xl:col-span-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="bg-muted/30 pl-9" placeholder="企业名称 / 信用代码 / 行业" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} /></div>
                <Select value={filters.status} onValueChange={(status) => setFilters({ ...filters, status })}><SelectTrigger className="bg-muted/30"><SelectValue placeholder="填报状态" /></SelectTrigger><SelectContent><SelectItem value="全部">全部状态</SelectItem><SelectItem value="未填报">未填报</SelectItem><SelectItem value="待审核">待审核</SelectItem><SelectItem value="已驳回">已驳回</SelectItem><SelectItem value="已通过">已通过</SelectItem></SelectContent></Select>
                <Select value={filters.industry} onValueChange={(industry) => setFilters({ ...filters, industry })}><SelectTrigger className="bg-muted/30"><SelectValue placeholder="所属行业" /></SelectTrigger><SelectContent><SelectItem value="全部">全部行业</SelectItem><SelectItem value="装备制造">装备制造</SelectItem><SelectItem value="化工新材料">化工新材料</SelectItem><SelectItem value="电子信息">电子信息</SelectItem></SelectContent></Select>
                <Select value={filters.district} onValueChange={(district) => setFilters({ ...filters, district })}><SelectTrigger className="bg-muted/30"><SelectValue placeholder="行政区划" /></SelectTrigger><SelectContent><SelectItem value="全部">全部区划</SelectItem><SelectItem value="高新区">高新区</SelectItem><SelectItem value="江北新区">江北新区</SelectItem><SelectItem value="雨花台区">雨花台区</SelectItem><SelectItem value="浦口区">浦口区</SelectItem></SelectContent></Select>
                <Input type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} className="bg-muted/30" />
              </div>

              <div className="overflow-x-auto rounded-md border border-border/70">
                <Table>
                  <TableHeader><TableRow className="bg-muted/45 hover:bg-muted/45"><TableHead className="w-10"><Checkbox checked={allVisibleSelected} onCheckedChange={(checked) => toggleVisible(Boolean(checked))} /></TableHead><TableHead className="min-w-52">企业名称</TableHead><TableHead>行政区划</TableHead><TableHead>统计月份</TableHead><TableHead className="min-w-44 text-right">综合能源消费总量</TableHead><TableHead>填报状态</TableHead><TableHead className="min-w-44">操作</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => <TableRow key={report.code} className="cursor-pointer" onClick={() => setSelected(report)} data-state={selected.code === report.code ? "selected" : undefined}><TableCell onClick={(event) => event.stopPropagation()}><Checkbox checked={selectedCodes.includes(report.code)} onCheckedChange={(checked) => toggleReport(report.code, Boolean(checked))} /></TableCell><TableCell><div className="font-medium">{report.name}</div><div className="mt-1 font-mono text-xs text-muted-foreground">{report.code}</div></TableCell><TableCell>{report.district}</TableCell><TableCell>{report.month}</TableCell><TableCell className="text-right font-mono"><div>{fmt(report.totalEquivalent)} tce</div><div className="text-xs text-muted-foreground">当量 {fmt(report.totalStandard)} tce</div></TableCell><TableCell><ReportStatusBadge status={report.status} /></TableCell><TableCell onClick={(event) => event.stopPropagation()}><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelected(report)}><Eye className="h-3.5 w-3.5" />查看</Button><Button variant="ghost" size="sm" className="gap-1" onClick={() => { setSelectedCodes([report.code]); setExportOpen(true); }}><Download className="h-3.5 w-3.5" />导出</Button>{report.status === "待审核" ? <Button variant="ghost" size="sm" className="gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" />通过</Button> : null}{report.status === "待审核" ? <Button variant="ghost" size="sm" className="gap-1 text-destructive"><XCircle className="h-3.5 w-3.5" />驳回</Button> : null}</div></TableCell></TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="min-w-0"><ReportDetailView report={selected} /></aside>
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="border-border bg-popover">
          <DialogHeader><DialogTitle>月报数据导出模块</DialogTitle><DialogDescription>已选择 {selectedCodes.length} 家企业，可导出标准 Excel 的基础字段或全量明细字段。</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {exportFields.map((field) => <label key={field} className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/25 p-3 text-sm"><Checkbox checked={checkedFields.includes(field)} onCheckedChange={(checked) => setCheckedFields((fields) => checked ? [...fields, field] : fields.filter((item) => item !== field))} />{field}</label>)}
            </div>
            {exporting || progress > 0 ? <div className="space-y-2"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>正在生成 Excel 表头、填报项与系统计算项</span><span>{progress}%</span></div><Progress value={progress} /></div> : null}
            <Button className="w-full gap-2" onClick={startExport} disabled={exporting || checkedFields.length === 0 || selectedCodes.length === 0}><FileDown className="h-4 w-4" />导出标准 Excel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge variant="outline" className={cn("gap-2", statusStyle[status])}><span className={cn("h-2 w-2 rounded-full", statusDot[status])} />{status}</Badge>;
}
