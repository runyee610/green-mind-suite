import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileDown,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ReportStatus = "未填报" | "待审核" | "已驳回" | "已通过";

const reports = [
  {
    name: "华东精密制造有限公司",
    code: "91320100MA1Q8E2X7A",
    month: "2026-03",
    industry: "装备制造",
    district: "高新区",
    totalEquivalent: 12860.4,
    totalStandard: 10234.8,
    status: "待审核" as ReportStatus,
    updatedAt: "2026-04-12 16:42",
    coal: 2860,
    electricity: 836.5,
    gas: 142.8,
    output: 18520,
    unitEnergy: 0.552,
    yoy: 12.6,
  },
  {
    name: "江北新材料集团",
    code: "91320191MA2B6F1L9C",
    month: "2026-03",
    industry: "化工新材料",
    district: "江北新区",
    totalEquivalent: 28640.2,
    totalStandard: 24118.6,
    status: "已通过" as ReportStatus,
    updatedAt: "2026-04-10 09:18",
    coal: 7120,
    electricity: 1492.7,
    gas: 318.2,
    output: 40280,
    unitEnergy: 0.599,
    yoy: -8.4,
  },
  {
    name: "金陵电子材料股份有限公司",
    code: "91320115MA7C3N8K2D",
    month: "2026-03",
    industry: "电子信息",
    district: "雨花台区",
    totalEquivalent: 8940.7,
    totalStandard: 7012.5,
    status: "已驳回" as ReportStatus,
    updatedAt: "2026-04-11 14:03",
    coal: 940,
    electricity: 1190.2,
    gas: 86.1,
    output: 22160,
    unitEnergy: 0.316,
    yoy: 18.9,
  },
  {
    name: "浦口智能装备产业园",
    code: "91320111MA3E5R6T0P",
    month: "2026-03",
    industry: "装备制造",
    district: "浦口区",
    totalEquivalent: 0,
    totalStandard: 0,
    status: "未填报" as ReportStatus,
    updatedAt: "—",
    coal: 0,
    electricity: 0,
    gas: 0,
    output: 0,
    unitEnergy: 0,
    yoy: 0,
  },
];

const statusStyle: Record<ReportStatus, string> = {
  未填报: "bg-muted text-muted-foreground border-border",
  待审核: "bg-warning/15 text-warning border-warning/40",
  已驳回: "bg-destructive/15 text-destructive border-destructive/40",
  已通过: "bg-success/15 text-success border-success/40",
};

const statusDot: Record<ReportStatus, string> = {
  未填报: "bg-muted-foreground",
  待审核: "bg-warning",
  已驳回: "bg-destructive",
  已通过: "bg-success",
};

const exportFields = ["基础信息", "能源消费明细", "折标准煤计算", "产品产量", "单位产品能耗", "同比/环比变化", "节能措施"];

export default function ReportMonthly() {
  const [selected, setSelected] = useState(reports[0]);
  const [filters, setFilters] = useState({ status: "全部", industry: "全部", district: "全部", month: "2026-03" });
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkedFields, setCheckedFields] = useState(exportFields);

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          (filters.status === "全部" || report.status === filters.status) &&
          (filters.industry === "全部" || report.industry === filters.industry) &&
          (filters.district === "全部" || report.district === filters.district) &&
          report.month === filters.month,
      ),
    [filters],
  );

  const startExport = () => {
    setExporting(true);
    setProgress(12);
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer);
          setExporting(false);
          return 100;
        }
        return value + 22;
      });
    }, 360);
  };

  return (
    <AppLayout title="节能月度报告" subtitle="政府侧重点用能单位企业节能月报监管、审核与导出">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)] gap-4">
        <section className="space-y-4 min-w-0">
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-secondary" />
                    月报管理列表
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">辖区企业填报状态与核心能耗指标摘要</p>
                </div>
                <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Download className="h-4 w-4" /> 批量导出
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-popover border-border">
                    <DialogHeader>
                      <DialogTitle>月报数据导出模块</DialogTitle>
                      <DialogDescription>选择企业月报字段范围，生成标准 Excel 明细表。</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {exportFields.map((field) => (
                          <label key={field} className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/25 p-3 text-sm">
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
                            <span>正在汇总填报项与系统计算项</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>
                      ) : null}
                      <Button className="w-full gap-2" onClick={startExport} disabled={exporting || checkedFields.length === 0}>
                        <FileDown className="h-4 w-4" /> 导出标准 Excel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                <div className="relative xl:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 bg-muted/30" placeholder="企业名称 / 信用代码" />
                </div>
                <Select value={filters.status} onValueChange={(status) => setFilters({ ...filters, status })}>
                  <SelectTrigger className="bg-muted/30"><SelectValue placeholder="填报状态" /></SelectTrigger>
                  <SelectContent><SelectItem value="全部">全部状态</SelectItem><SelectItem value="未填报">未填报</SelectItem><SelectItem value="待审核">待审核</SelectItem><SelectItem value="已驳回">已驳回</SelectItem><SelectItem value="已通过">已通过</SelectItem></SelectContent>
                </Select>
                <Select value={filters.industry} onValueChange={(industry) => setFilters({ ...filters, industry })}>
                  <SelectTrigger className="bg-muted/30"><SelectValue placeholder="所属行业" /></SelectTrigger>
                  <SelectContent><SelectItem value="全部">全部行业</SelectItem><SelectItem value="装备制造">装备制造</SelectItem><SelectItem value="化工新材料">化工新材料</SelectItem><SelectItem value="电子信息">电子信息</SelectItem></SelectContent>
                </Select>
                <Select value={filters.district} onValueChange={(district) => setFilters({ ...filters, district })}>
                  <SelectTrigger className="bg-muted/30"><SelectValue placeholder="行政区划" /></SelectTrigger>
                  <SelectContent><SelectItem value="全部">全部区划</SelectItem><SelectItem value="高新区">高新区</SelectItem><SelectItem value="江北新区">江北新区</SelectItem><SelectItem value="雨花台区">雨花台区</SelectItem><SelectItem value="浦口区">浦口区</SelectItem></SelectContent>
                </Select>
                <Input type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} className="bg-muted/30" />
              </div>

              <div className="overflow-x-auto rounded-md border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/45 hover:bg-muted/45">
                      <TableHead className="min-w-52">企业名称</TableHead>
                      <TableHead className="min-w-48">统一社会信用代码</TableHead>
                      <TableHead>统计月份</TableHead>
                      <TableHead className="text-right min-w-36">等价值(tce)</TableHead>
                      <TableHead className="text-right min-w-36">当量值(tce)</TableHead>
                      <TableHead>填报状态</TableHead>
                      <TableHead className="min-w-36">最后更新时间</TableHead>
                      <TableHead className="min-w-56">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.code} className="cursor-pointer" onClick={() => setSelected(report)}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{report.code}</TableCell>
                        <TableCell>{report.month}</TableCell>
                        <TableCell className="text-right font-mono">{report.totalEquivalent.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">{report.totalStandard.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-2", statusStyle[report.status])}>
                            <span className={cn("h-2 w-2 rounded-full", statusDot[report.status])} />{report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{report.updatedAt}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelected(report)}><Eye className="h-3.5 w-3.5" />查看</Button>
                            <Button variant="ghost" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" />导出</Button>
                            {report.status === "待审核" ? <Button variant="ghost" size="sm" className="gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" />通过</Button> : null}
                            {report.status === "待审核" ? <Button variant="ghost" size="sm" className="gap-1 text-destructive"><XCircle className="h-3.5 w-3.5" />驳回</Button> : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4 min-w-0">
          <Card className="panel-glow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">月报详细查看</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{selected.name}</p>
                </div>
                <Badge variant="outline" className={cn("gap-2 shrink-0", statusStyle[selected.status])}>
                  <span className={cn("h-2 w-2 rounded-full", statusDot[selected.status])} />{selected.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 pt-3">
                <Button size="sm" className="gap-2"><ShieldCheck className="h-4 w-4" />审核通过</Button>
                <Button size="sm" variant="outline" className="gap-2"><RotateCcw className="h-4 w-4" />填写驳回意见</Button>
                <Button size="sm" variant="outline" className="gap-2"><Printer className="h-4 w-4" />打印PDF</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <nav className="grid grid-cols-4 gap-2 text-xs">
                {["基础信息", "能源结构", "产量强度", "节能措施"].map((item) => (
                  <a key={item} href={`#${item}`} className="rounded-md border border-border/70 bg-muted/25 px-2 py-2 text-center hover:bg-muted/50">{item}</a>
                ))}
              </nav>

              <DetailBlock id="基础信息" title="基础信息" rows={[["统一社会信用代码", selected.code], ["行政区划", selected.district], ["所属行业", selected.industry], ["统计月份", selected.month]]} />
              <DetailBlock id="能源结构" title="能源消费结构（企业填报项）" rows={[["原煤消费量", `${selected.coal.toLocaleString()} 吨`], ["电力消费量", `${selected.electricity.toLocaleString()} 万kWh`], ["天然气消费量", `${selected.gas.toLocaleString()} 万m³`], ["工业总产值", `${selected.output.toLocaleString()} 万元`]]} />

              <div id="产量强度" className="space-y-3">
                <h3 className="text-sm font-semibold text-secondary">产品产量与能耗强度（系统计算项）</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Metric label="综合能源消费量" value={`${selected.totalStandard.toLocaleString()} tce`} last="去年同期 9,086 tce" yoy={selected.yoy} />
                  <Metric label="单位产值能耗" value={`${selected.unitEnergy} tce/万元`} last="去年同期 0.491" yoy={selected.yoy} />
                  <Metric label="等价值能源消费量" value={`${selected.totalEquivalent.toLocaleString()} tce`} last="去年同期 11,421 tce" yoy={selected.yoy} />
                  <Metric label="单位产品能耗增减率" value={`${selected.yoy}%`} last="监管阈值 ±10%" yoy={selected.yoy} />
                </div>
              </div>

              <div id="节能措施" className="space-y-3">
                <h3 className="text-sm font-semibold text-secondary">节能措施</h3>
                <div className="rounded-md border border-border/70 bg-muted/20 p-3 text-sm leading-6 text-muted-foreground">
                  完成空压站余热回收改造，变频电机替换 18 台；本月预计节约电量 12.4 万kWh，折合节约标准煤 38.1 tce。
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}

function DetailBlock({ id, title, rows }: { id: string; title: string; rows: string[][] }) {
  return (
    <div id={id} className="space-y-3">
      <h3 className="text-sm font-semibold text-secondary">{title}</h3>
      <div className="rounded-md border border-border/70 overflow-hidden">
        {rows.map(([label, value], index) => (
          <div key={label} className="grid grid-cols-[130px_1fr] text-sm">
            <div className="bg-muted/35 px-3 py-2 text-muted-foreground">{label}</div>
            <div className="px-3 py-2 font-medium">{value}</div>
            {index < rows.length - 1 ? <Separator className="col-span-2" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, last, yoy }: { label: string; value: string; last: string; yoy: number }) {
  const warning = Math.abs(yoy) > 10;
  return (
    <div className="rounded-md border border-border/70 bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {warning ? <AlertTriangle className={cn("h-4 w-4", yoy > 0 ? "text-destructive" : "text-warning")} /> : null}
      </div>
      <div className="mt-2 text-lg font-semibold font-mono">{value}</div>
      <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{last}</span>
        <span className={cn("font-mono", warning ? (yoy > 0 ? "text-destructive" : "text-warning") : "text-success")}>同比 {yoy > 0 ? "+" : ""}{yoy}%</span>
      </div>
    </div>
  );
}
