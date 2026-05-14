import { useMemo, useState } from "react";
import { ArrowLeft, Building2, Download, Eye, FileDown, FileSpreadsheet, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ReportDetailView } from "@/components/report-monthly/ReportDetailView";
import {
  exportFields,
  fillStatusDot,
  fillStatusStyle,
  reports,
  type FillStatus,
  type MonthlyReport,
} from "@/components/report-monthly/monthlyReportData";
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
import {
  ENTERPRISE_TYPES,
  EnterpriseTypeSwitcher,
  TYPE_HAS_STEAM,
  type EnterpriseTypeId,
} from "@/components/report-monthly/EnterpriseTypeSwitcher";

export default function ReportMonthly() {
  const [detailReport, setDetailReport] = useState<MonthlyReport | null>(null);
  const [enterpriseType, setEnterpriseType] = useState<EnterpriseTypeId>(TYPE_HAS_STEAM);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    keyword: "",
    industry: "全部",
    district: "全部",
    month: "2026-03",
  });
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkedFields, setCheckedFields] = useState(exportFields);

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const keywordHit =
          !filters.keyword ||
          report.name.includes(filters.keyword) ||
          report.code.includes(filters.keyword) ||
          report.industry.includes(filters.keyword);
        return (
          keywordHit &&
          (filters.industry === "全部" || report.industry === filters.industry) &&
          (filters.district === "全部" || report.district === filters.district) &&
          report.month === filters.month
        );
      }),
    [filters],
  );

  // KPI 跟随筛选结果联动
  const stats = useMemo(() => {
    const total = filteredReports.length;
    const submitted = filteredReports.filter((item) => item.status !== "未填报").length;
    const submittedKey = filteredReports.filter((item) => item.keyEnterprise && item.status !== "未填报").length;
    const totalKey = filteredReports.filter((item) => item.keyEnterprise).length;
    const warmFilled = filteredReports.filter((item) => item.warmStatus === "已填报").length;
    const quotaFilled = filteredReports.filter((item) => item.quotaStatus === "已填报").length;

    return [
      {
        label: "已报企业",
        value: `${submitted}/${total || 0}`,
        hint: total ? `应报 ${total} 家，已报 ${submitted} 家` : "当前筛选下无企业",
        accent: "text-primary",
      },
      {
        label: "已报重点企业",
        value: `${submittedKey}/${totalKey || 0}`,
        hint: totalKey ? `重点用能单位 ${totalKey} 家` : "当前筛选下无重点企业",
        accent: "text-secondary-foreground",
      },
      {
        label: "已填温报 / 节能指标月报",
        value: `${warmFilled} / ${quotaFilled}`,
        hint: `温报 ${warmFilled} 家、节能指标月报 ${quotaFilled} 家`,
        accent: "text-primary",
      },
    ];
  }, [filteredReports]);

  const allVisibleSelected =
    filteredReports.length > 0 && filteredReports.every((report) => selectedCodes.includes(report.code));

  const toggleReport = (code: string, checked: boolean) =>
    setSelectedCodes((codes) => (checked ? Array.from(new Set([...codes, code])) : codes.filter((item) => item !== code)));
  const toggleVisible = (checked: boolean) =>
    setSelectedCodes((codes) =>
      checked
        ? Array.from(new Set([...codes, ...filteredReports.map((item) => item.code)]))
        : codes.filter((code) => !filteredReports.some((item) => item.code === code)),
    );

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

  // 子页面：详情（不展示外层 title/subtitle，企业信息卡片贴顶）
  if (detailReport) {
    return (
      <AppLayout hideHeader>
        <div className="space-y-3">
          <EnterpriseTypeSwitcher value={enterpriseType} onChange={setEnterpriseType} />
          <ReportDetailView
            report={detailReport}
            onBack={() => setDetailReport(null)}
            enterpriseType={enterpriseType}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="节能月度报告">
      <section className="space-y-4">
        {/* KPI 卡片 */}
        <div className="grid gap-3 md:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label} className="panel">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <div className={cn("mt-2 font-mono text-2xl font-semibold tracking-tight", item.accent)}>
                  {item.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="panel">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  月度管理列表
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  上海市重点用能单位温报与节能指标月报填报情况
                </p>
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setExportOpen(true)}
                disabled={selectedCodes.length === 0}
              >
                <Download className="h-4 w-4" />
                一键导出 Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative xl:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="bg-background pl-9"
                  placeholder="企业名称 / 信用代码 / 行业"
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                />
              </div>
              <Select value={filters.industry} onValueChange={(industry) => setFilters({ ...filters, industry })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="所属行业" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部行业</SelectItem>
                  <SelectItem value="黑色金属冶炼">黑色金属冶炼</SelectItem>
                  <SelectItem value="石油化工">石油化工</SelectItem>
                  <SelectItem value="电子信息">电子信息</SelectItem>
                  <SelectItem value="装备制造">装备制造</SelectItem>
                  <SelectItem value="日化轻工">日化轻工</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.district} onValueChange={(district) => setFilters({ ...filters, district })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="行政区划" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部区划</SelectItem>
                  <SelectItem value="宝山区">宝山区</SelectItem>
                  <SelectItem value="金山区">金山区</SelectItem>
                  <SelectItem value="浦东新区">浦东新区</SelectItem>
                  <SelectItem value="嘉定区">嘉定区</SelectItem>
                  <SelectItem value="闵行区">闵行区</SelectItem>
                  <SelectItem value="青浦区">青浦区</SelectItem>
                  <SelectItem value="长兴岛">长兴岛</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="month"
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="bg-background"
              />
            </div>

            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={(checked) => toggleVisible(Boolean(checked))}
                      />
                    </TableHead>
                    <TableHead className="min-w-64 text-foreground">企业名称</TableHead>
                    <TableHead className="text-foreground">行政区划</TableHead>
                    <TableHead className="text-foreground">统计月份</TableHead>
                    <TableHead className="text-foreground">温报</TableHead>
                    <TableHead className="text-foreground">节能指标月报</TableHead>
                    <TableHead className="min-w-36 text-foreground">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        当前筛选条件下暂无企业月报数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow key={report.code} className="hover:bg-muted/30">
                        <TableCell onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={selectedCodes.includes(report.code)}
                            onCheckedChange={(checked) => toggleReport(report.code, Boolean(checked))}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary/70" />
                            <div>
                              <div className="font-medium text-foreground">{report.name}</div>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">{report.code}</span>
                                {report.keyEnterprise ? (
                                  <Badge
                                    variant="outline"
                                    className="h-5 border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary"
                                  >
                                    重点
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{report.district}</TableCell>
                        <TableCell className="font-mono text-foreground">{report.month}</TableCell>
                        <TableCell>
                          <FillStatusBadge status={report.warmStatus} />
                        </TableCell>
                        <TableCell>
                          <FillStatusBadge status={report.quotaStatus} />
                        </TableCell>
                        <TableCell onClick={(event) => event.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-primary hover:text-primary"
                              onClick={() => setDetailReport(report)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              查看
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                setSelectedCodes([report.code]);
                                setExportOpen(true);
                              }}
                            >
                              <Download className="h-3.5 w-3.5" />
                              导出
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="border-border bg-popover">
          <DialogHeader>
            <DialogTitle>月报数据导出模块</DialogTitle>
            <DialogDescription>
              已选择 {selectedCodes.length} 家企业，可导出标准 Excel 的基础字段或全量明细字段。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {exportFields.map((field) => (
                <label
                  key={field}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm"
                >
                  <Checkbox
                    checked={checkedFields.includes(field)}
                    onCheckedChange={(checked) =>
                      setCheckedFields((fields) =>
                        checked ? [...fields, field] : fields.filter((item) => item !== field),
                      )
                    }
                  />
                  {field}
                </label>
              ))}
            </div>
            {exporting || progress > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>正在生成 Excel 表头、填报项与系统计算项</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            ) : null}
            <Button
              className="w-full gap-2"
              onClick={startExport}
              disabled={exporting || checkedFields.length === 0 || selectedCodes.length === 0}
            >
              <FileDown className="h-4 w-4" />
              导出标准 Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function FillStatusBadge({ status }: { status: FillStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-2", fillStatusStyle[status])}>
      <span className={cn("h-2 w-2 rounded-full", fillStatusDot[status])} />
      {status}
    </Badge>
  );
}
