import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Search, Filter, Sparkles, ClipboardList, Building2, AlertTriangle, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_SELF_ASSESS, type SelfAssessRecord } from "@/components/green-mfg/data";
import { ALL_INDUSTRIES } from "@/components/green-mfg/data";
import { cn } from "@/lib/utils";

interface AggregatedRow extends SelfAssessRecord {
  totalCount: number;
}

export default function GreenMfgGovSelfAssess() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");

  // 按企业（creditCode）聚合，取最新一次
  const aggregated = useMemo<AggregatedRow[]>(() => {
    const map = new Map<string, AggregatedRow>();
    for (const r of MOCK_SELF_ASSESS) {
      const exist = map.get(r.creditCode);
      if (!exist) {
        map.set(r.creditCode, { ...r, totalCount: 1 });
      } else {
        exist.totalCount += 1;
        if (r.date > exist.date) {
          map.set(r.creditCode, { ...r, totalCount: exist.totalCount });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, []);

  const districts = useMemo(
    () => Array.from(new Set(aggregated.map((r) => r.district))).sort(),
    [aggregated],
  );

  const rows = useMemo(
    () =>
      aggregated.filter((r) => {
        const k = keyword.trim();
        if (k && !r.enterpriseName.includes(k) && !r.creditCode.includes(k)) return false;
        if (industryFilter !== "all" && r.industry !== industryFilter) return false;
        if (districtFilter !== "all" && r.district !== districtFilter) return false;
        return true;
      }),
    [aggregated, keyword, industryFilter, districtFilter],
  );

  // KPI
  const totalEnt = aggregated.length;
  const totalAssess = MOCK_SELF_ASSESS.length;
  const avgScore = Math.round(aggregated.reduce((s, r) => s + r.aiScore, 0) / Math.max(totalEnt, 1));
  const weakEntCount = aggregated.filter((r) => r.weakCount >= 5).length;

  return (
    <AppLayout
      title="企业模拟评价"
      subtitle="查看辖区企业已完成的 AI 模拟自我评价情况"
    >
      {/* KPI */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-4">
        <KpiCard title="参评企业数" value={totalEnt} icon={Building2} accent="primary" />
        <KpiCard title="评价总次数" value={totalAssess} icon={ClipboardList} accent="cyan" />
        <KpiCard title="平均模拟分数" value={avgScore} icon={BarChart3} accent="success" />
        <KpiCard title="薄弱项 ≥5 的企业" value={weakEntCount} icon={AlertTriangle} accent="warning" />
      </div>

      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base">参评企业列表 · 共 {rows.length} 家</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索企业名称 / 信用代码"
                  className="h-8 w-60 pl-8 text-xs"
                />
              </div>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <Filter className="mr-1 h-3 w-3" />
                  <SelectValue placeholder="所属区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部区</SelectItem>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <Filter className="mr-1 h-3 w-3" />
                  <SelectValue placeholder="行业" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部行业</SelectItem>
                  {ALL_INDUSTRIES.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>企业名称</TableHead>
                <TableHead>所属区</TableHead>
                <TableHead>行业 / 子行业</TableHead>
                <TableHead>评价批次</TableHead>
                <TableHead className="text-center">最近评价日期</TableHead>
                <TableHead className="text-center">模拟分数</TableHead>
                <TableHead className="text-center">指标数</TableHead>
                <TableHead className="text-center">薄弱项</TableHead>
                <TableHead className="text-center">评价次数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.creditCode} className="h-12 border-border/40">
                  <TableCell className="text-sm font-medium">{r.enterpriseName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.district}</TableCell>
                  <TableCell>
                    <div className="text-xs">{r.industry}</div>
                    {r.subIndustry && (
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{r.subIndustry}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">{r.date}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center font-mono text-sm font-semibold text-primary">
                      <Sparkles className="mr-1 h-3 w-3 text-secondary" />
                      {r.aiScore}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">{r.indicatorCount}</TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    <span className={cn(r.weakCount >= 5 ? "text-warning font-semibold" : "")}>{r.weakCount}</span>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">{r.totalCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      onClick={() => navigate(`/green-mfg/gov/self-assess/${r.creditCode}`)}
                    >
                      <Eye className="mr-1 h-3 w-3" />详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-xs text-muted-foreground">
                    暂无符合条件的企业
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number | string;
  icon: typeof ClipboardList;
  accent: "primary" | "cyan" | "warning" | "success";
}) {
  const map = {
    primary: { bg: "bg-primary/15", text: "text-primary", value: "text-primary" },
    cyan: { bg: "bg-cyan-500/15", text: "text-cyan-600 dark:text-cyan-300", value: "text-cyan-600 dark:text-cyan-300" },
    warning: { bg: "bg-warning/15", text: "text-warning", value: "text-warning" },
    success: { bg: "bg-success/15", text: "text-success", value: "text-success" },
  } as const;
  const c = map[accent];
  return (
    <Card className="panel">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", c.bg, c.text)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">{title}</div>
            <div className="mt-0.5 text-2xl font-bold tracking-tight">
              <span className={c.value}>{value}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
