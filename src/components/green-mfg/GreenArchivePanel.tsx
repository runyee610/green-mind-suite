import { useMemo, useState } from "react";
import {
  Archive,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Eye,
  FileBarChart,
  History,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  GreenArchive,
  MOCK_ARCHIVES,
  MOCK_RISKS,
  certifyLevelClass,
} from "./dynamicExtData";

type Mode = "gov" | "ent";

interface Props {
  mode: Mode;
  /** 当 mode = ent 时用于过滤当前企业档案 */
  creditCode?: string;
}

export function GreenArchivePanel({ mode, creditCode }: Props) {
  const [keyword, setKeyword] = useState("");
  const [active, setActive] = useState<GreenArchive | null>(null);

  const list = useMemo(() => {
    let arr = MOCK_ARCHIVES;
    if (mode === "ent" && creditCode) arr = arr.filter((a) => a.creditCode === creditCode);
    const k = keyword.trim();
    if (k) {
      arr = arr.filter(
        (a) =>
          a.enterpriseName.includes(k) ||
          a.creditCode.includes(k) ||
          a.industry.includes(k),
      );
    }
    return arr;
  }, [keyword, mode, creditCode]);

  // 企业侧只有自己一条 → 直接展开档案视图
  if (mode === "ent") {
    const my = list[0];
    return my ? (
      <ArchiveDetailCard archive={my} embedded />
    ) : (
      <Card className="panel">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          <Archive className="mx-auto mb-2 h-8 w-8 opacity-50" />
          暂无绿色档案数据
        </CardContent>
      </Card>
    );
  }

  // 政府侧：列表 + Sheet 详情
  return (
    <>
      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Archive className="h-4 w-4 text-primary" />企业绿色制造数字化档案
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                自动归集历史申报、年度动态、整改与预警；点击行查看完整档案。
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索企业 / 信用代码 / 行业"
                className="h-8 w-72 pl-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>企业名称</TableHead>
                <TableHead>所属区 / 行业</TableHead>
                <TableHead className="text-center">认定等级</TableHead>
                <TableHead className="text-center">最近得分</TableHead>
                <TableHead className="text-center">申报次数</TableHead>
                <TableHead className="text-center">动态填报</TableHead>
                <TableHead className="text-center">整改</TableHead>
                <TableHead className="text-center">未关闭预警</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((a) => (
                <TableRow
                  key={a.creditCode}
                  className="h-12 cursor-pointer border-border/40"
                  onClick={() => setActive(a)}
                >
                  <TableCell className="text-sm font-medium">{a.enterpriseName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {a.district} · {a.industry}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={certifyLevelClass(a.certifyLevel)}>
                      {a.certifyLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    {a.latestScore ?? "—"}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">{a.declarationCount}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{a.dynamicReportCount}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{a.rectificationCount}</TableCell>
                  <TableCell className="text-center">
                    {a.riskOpenCount > 0 ? (
                      <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
                        {a.riskOpenCount}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="h-7" onClick={(e) => { e.stopPropagation(); setActive(a); }}>
                      <Eye className="mr-1 h-3 w-3" />档案
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    无匹配档案
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <Archive className="h-5 w-5 text-primary" />
                  {active.enterpriseName}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {active.creditCode} · {active.district} · {active.industry}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <ArchiveDetailCard archive={active} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ArchiveDetailCard({ archive, embedded = false }: { archive: GreenArchive; embedded?: boolean }) {
  return (
    <div className="space-y-4">
      {/* 认定信息 + KPI */}
      <Card className="panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-success" />认定信息
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiBlock label="认定等级" value={archive.certifyLevel} accent="primary" />
          <KpiBlock label="首次获评" value={archive.certifyDate ?? "—"} />
          <KpiBlock label="证书有效期" value={archive.validUntil ?? "—"} />
          <KpiBlock label="最近综合得分" value={String(archive.latestScore ?? "—")} accent="success" />
          <KpiBlock label="累计申报" value={String(archive.declarationCount)} />
          <KpiBlock label="动态填报" value={String(archive.dynamicReportCount)} />
          <KpiBlock label="整改记录" value={String(archive.rectificationCount)} />
          <KpiBlock label="未关闭预警" value={String(archive.riskOpenCount)} accent={archive.riskOpenCount > 0 ? "destructive" : undefined} />
        </CardContent>
      </Card>

      {/* 历年趋势 */}
      <Card className="panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileBarChart className="h-4 w-4 text-primary" />历年关键指标
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>年度</TableHead>
                <TableHead className="text-right">综合能耗</TableHead>
                <TableHead className="text-right">碳排放</TableHead>
                <TableHead className="text-right">固废利用率</TableHead>
                <TableHead className="text-right">综合得分</TableHead>
                <TableHead className="text-center">同比</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archive.trend.map((t, i) => {
                const prev = archive.trend[i - 1];
                const delta = prev?.score != null && t.score != null ? t.score - prev.score : null;
                return (
                  <TableRow key={t.year} className="h-10 border-border/40">
                    <TableCell className="font-mono text-xs">{t.year}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{t.energy?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{t.carbon?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{t.wasteRecycleRate != null ? `${t.wasteRecycleRate}%` : "—"}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">{t.score ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      {delta == null ? <span className="text-muted-foreground">—</span> : delta >= 0 ? (
                        <span className="inline-flex items-center text-xs text-success"><TrendingUp className="mr-0.5 h-3 w-3" />+{delta}</span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-destructive"><TrendingDown className="mr-0.5 h-3 w-3" />{delta}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 时间轴 */}
      <Card className="panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />档案时间轴
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l border-border/60 pl-5">
            {archive.timeline.map((n, i) => (
              <li key={i} className="relative">
                <span className={cn(
                  "absolute -left-[26px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background",
                  typeBadgeBg(n.type),
                )}>
                  <span className="h-1.5 w-1.5 rounded-full bg-background" />
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                  <span className="text-sm font-medium">{n.title}</span>
                  {n.score != null && (
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                      <Sparkles className="mr-0.5 h-3 w-3" />{n.score} 分
                    </Badge>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />{n.date}
                  {n.source && <><span>·</span><span>{n.source}</span></>}
                  {n.result && <><span>·</span><span>{n.result}</span></>}
                </p>
                {n.detail && <p className="mt-1 text-xs text-muted-foreground">{n.detail}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* 关联预警速览 */}
      {(() => {
        const related = MOCK_RISKS.filter((r) => r.creditCode === archive.creditCode && r.status !== "已关闭");
        if (related.length === 0) return null;
        return (
          <Card className="panel border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />当前未关闭预警 ({related.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {related.map((r) => (
                <div key={r.id} className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/20 p-2 text-xs">
                  <Badge variant="outline" className="mt-0.5 shrink-0">{r.category}</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{r.title}</p>
                    <p className="text-muted-foreground">{r.detail}</p>
                  </div>
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}

function KpiBlock({ label, value, accent }: { label: string; value: string; accent?: "primary" | "success" | "destructive" }) {
  const cls =
    accent === "primary" ? "text-primary" :
    accent === "success" ? "text-success" :
    accent === "destructive" ? "text-destructive" :
    "text-foreground";
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm font-semibold", cls)}>{value}</p>
    </div>
  );
}

function typeBadgeBg(t: string) {
  switch (t) {
    case "证书": return "bg-success";
    case "评价": return "bg-primary";
    case "动态填报": return "bg-secondary";
    case "整改": return "bg-warning";
    case "预警": return "bg-destructive";
    default: return "bg-muted-foreground";
  }
}
