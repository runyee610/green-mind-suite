import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Search, Sprout, AlertTriangle, Filter } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_DECLARATIONS, ALL_INDUSTRIES } from "@/components/green-mfg/data";

export default function GreenMfgGovIncubator() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");

  // 培育库 = 未达标进入培育中的企业
  const incubating = MOCK_DECLARATIONS.filter((r) => r.stage === "培育中" || r.level === "区级培育");

  const rows = incubating.filter((r) => {
    const k = keyword.trim();
    if (k && !r.enterpriseName.includes(k) && !r.creditCode.includes(k)) return false;
    if (industryFilter !== "all" && r.industry !== industryFilter) return false;
    return true;
  });

  return (
    <AppLayout title="绿色工厂培育库 · 政府侧" subtitle="未达标申报企业的培育跟踪与管理">
      <div className="grid gap-3 md:grid-cols-3 mb-4">
        <Card className="panel">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/15 text-warning">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">培育中企业</div>
              <div className="text-xl font-semibold">{incubating.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="panel">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">平均得分</div>
              <div className="text-xl font-semibold">
                {incubating.length
                  ? Math.round(incubating.reduce((s, r) => s + r.score, 0) / incubating.length)
                  : 0}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="panel">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/15 text-success">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">本年度新进入</div>
              <div className="text-xl font-semibold">{incubating.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base">培育企业列表</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索企业名称 / 信用代码"
                  className="h-8 w-64 pl-8 text-xs"
                />
              </div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-8 w-40 text-xs">
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
                <TableHead>企业名称 / 信用代码</TableHead>
                <TableHead>所属区</TableHead>
                <TableHead>行业 / 子行业</TableHead>
                <TableHead className="text-right">产值（万元）</TableHead>
                <TableHead className="text-right">智能打分</TableHead>
                <TableHead>申报批次</TableHead>
                <TableHead>责任审核员</TableHead>
                <TableHead className="text-center">培育状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="h-12 border-border/40">
                  <TableCell>
                    <div className="text-sm">{r.enterpriseName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{r.creditCode}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.district}</TableCell>
                  <TableCell>
                    <div className="text-xs">{r.industry}</div>
                    {r.subIndustry && (
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{r.subIndustry}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{r.outputValue.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{r.score}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.batch}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.reviewer ?? "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">培育中</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      onClick={() => navigate(`/green-mfg/gov/declaration/${r.id}`)}
                    >
                      <Eye className="mr-1 h-3 w-3" />企业详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-xs text-muted-foreground">
                    暂无培育中企业
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
