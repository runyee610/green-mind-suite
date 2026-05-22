import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Boxes, ChevronDown, Download, Eye, Flame, Leaf, Search, Upload, MapPin, Activity, Factory, FilterX, SlidersHorizontal, X, Percent, TrendingUp, ClipboardCheck } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ImportDialog } from "@/components/assets/ImportDialog";
import { LinkEnterpriseDialog } from "@/components/assets/LinkEnterpriseDialog";
import { ProjectDetailView } from "@/components/assets/ProjectDetailView";
import { districts, projects, type InvestmentProject, type ProjectStatus } from "@/components/assets/assetsData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ALL_STATUSES: ProjectStatus[] = ["筹建中", "建设中", "已竣工", "已暂停"];
const statusBadgeStyle: Record<ProjectStatus, string> = {
  筹建中: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
  建设中: "border-primary/40 bg-primary/10 text-primary",
  已竣工: "border-success/40 bg-success/10 text-success",
  已暂停: "border-destructive/40 bg-destructive/10 text-destructive",
};

type RatioBucket = "0-90" | "90-110" | "110+";
type DeltaBucket = "neg" | "0-1000" | "1000+";
type OnSiteBucket = "yes" | "no";
const RATIO_OPTIONS: { v: RatioBucket; label: string }[] = [
  { v: "0-90", label: "0-90%" },
  { v: "90-110", label: "90-110%（标黄）" },
  { v: "110+", label: ">110%（标红）" },
];
const DELTA_OPTIONS: { v: DeltaBucket; label: string }[] = [
  { v: "neg", label: "<0 吨标煤" },
  { v: "0-1000", label: "0-1000 吨标煤（标黄）" },
  { v: "1000+", label: ">1000 吨标煤（标红）" },
];

function computeYtdApproved(p: InvestmentProject) {
  const updated = new Date(p.collectedUpdatedAt);
  const year = updated.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const daysInYear = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const dayOfYear = Math.round((updated.getTime() - start.getTime()) / 86400000) + 1;
  return p.approvedEnergy * (dayOfYear / daysInYear);
}
function computeYtdRatio(p: InvestmentProject) {
  const ytdApproved = computeYtdApproved(p);
  return ytdApproved > 0 ? (p.collectedEnergy / ytdApproved) * 100 : 0;
}
function computeDelta(p: InvestmentProject) {
  return p.collectedEnergy - computeYtdApproved(p);
}
function ratioBucketOf(r: number): RatioBucket {
  if (r > 110) return "110+";
  if (r >= 90) return "90-110";
  return "0-90";
}
function deltaBucketOf(d: number): DeltaBucket {
  if (d < 0) return "neg";
  if (d <= 1000) return "0-1000";
  return "1000+";
}

const fmt = (n: number, d = 0) => n.toLocaleString(undefined, { maximumFractionDigits: d });

export default function Assets() {
  const [detail, setDetail] = useState<InvestmentProject | null>(null);
  const [keyword, setKeyword] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([]);
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [ratioFilter, setRatioFilter] = useState<RatioBucket[]>([]);
  const [deltaFilter, setDeltaFilter] = useState<DeltaBucket[]>([]);
  const [onSiteFilter, setOnSiteFilter] = useState<OnSiteBucket[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState<InvestmentProject | null>(null);

  const linkedIndustries = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => { if (p.linkedEnterpriseName) set.add(p.industry); });
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const kw = !keyword || p.name.includes(keyword) || p.unitName.includes(keyword);
      const dt = districtFilter.length === 0 || districtFilter.includes(p.district);
      const st = statusFilter.length === 0 || statusFilter.includes(p.status);
      const ind = industryFilter.length === 0 || (!!p.linkedEnterpriseName && industryFilter.includes(p.industry));
      const rt = ratioFilter.length === 0 || (p.collectedEnergy > 0 && ratioFilter.includes(ratioBucketOf(computeYtdRatio(p))));
      const dl = deltaFilter.length === 0 || (p.collectedEnergy > 0 && deltaFilter.includes(deltaBucketOf(computeDelta(p))));
      const os = onSiteFilter.length === 0 || onSiteFilter.includes(p.onSiteCheck ? "yes" : "no");
      return kw && dt && st && ind && rt && dl && os;
    });
  }, [keyword, districtFilter, statusFilter, industryFilter, ratioFilter, deltaFilter, onSiteFilter]);

  const totalActive = districtFilter.length + statusFilter.length + industryFilter.length + ratioFilter.length + deltaFilter.length + onSiteFilter.length;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; value: string; remove: () => void }[] = [];
    districtFilter.forEach((d) => chips.push({ key: `d-${d}`, label: "区", value: d, remove: () => setDistrictFilter((arr) => arr.filter((x) => x !== d)) }));
    statusFilter.forEach((s) => chips.push({ key: `s-${s}`, label: "状态", value: s, remove: () => setStatusFilter((arr) => arr.filter((x) => x !== s)) }));
    industryFilter.forEach((i) => chips.push({ key: `i-${i}`, label: "行业", value: i, remove: () => setIndustryFilter((arr) => arr.filter((x) => x !== i)) }));
    ratioFilter.forEach((r) => chips.push({ key: `r-${r}`, label: "占比", value: RATIO_OPTIONS.find((o) => o.v === r)!.label, remove: () => setRatioFilter((arr) => arr.filter((x) => x !== r)) }));
    deltaFilter.forEach((d) => chips.push({ key: `dl-${d}`, label: "增量", value: DELTA_OPTIONS.find((o) => o.v === d)!.label, remove: () => setDeltaFilter((arr) => arr.filter((x) => x !== d)) }));
    onSiteFilter.forEach((o) => chips.push({ key: `os-${o}`, label: "现场检查", value: o === "yes" ? "已检查" : "未检查", remove: () => setOnSiteFilter((arr) => arr.filter((x) => x !== o)) }));
    return chips;
  }, [districtFilter, statusFilter, industryFilter, ratioFilter, deltaFilter, onSiteFilter]);

  const stats = useMemo(() => {
    const total = projects.length;
    return [
      {
        label: "普通固定资产投资项目",
        value: total,
        unit: "个",
        hint: "本年度纳入管理的全部投资项目",
        icon: Boxes,
        tone: "primary" as const,
      },
      {
        label: "两高项目数量",
        value: 12,
        unit: "个",
        hint: "高耗能、高排放项目",
        icon: Flame,
        tone: "warning" as const,
      },
      {
        label: "节能项目数量",
        value: 26,
        unit: "个",
        hint: "节能技改 / 绿色低碳项目",
        icon: Leaf,
        tone: "success" as const,
      },
    ];
  }, []);

  const reset = () => { setKeyword(""); setDistrictFilter([]); setStatusFilter([]); setIndustryFilter([]); setRatioFilter([]); setDeltaFilter([]); setOnSiteFilter([]); };
  const openLink = (p: InvestmentProject) => { setLinkTarget(p); setLinkOpen(true); };

  const toneClass = (tone: "primary" | "warning" | "success") => {
    switch (tone) {
      case "primary":
        return { value: "text-primary", iconBg: "bg-primary/10 text-primary border-primary/20", ring: "from-primary/8 via-primary/0 to-primary/0" };
      case "warning":
        return { value: "text-warning", iconBg: "bg-warning/10 text-warning border-warning/20", ring: "from-warning/8 via-warning/0 to-warning/0" };
      case "success":
        return { value: "text-success", iconBg: "bg-success/10 text-success border-success/20", ring: "from-success/8 via-success/0 to-success/0" };
    }
  };

  useEffect(() => {
    if (detail) {
      const main = document.querySelector("main");
      if (main) main.scrollTo({ top: 0, behavior: "auto" });
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [detail]);

  // ============ 详情子页面 ============
  if (detail) {
    return (
      <AppLayout hideHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              当前查看：<span className="text-foreground">{detail.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setDetail(null)}>
              <ArrowLeft className="h-4 w-4" />返回项目列表
            </Button>
          </div>
          <ProjectDetailView project={detail} onLink={() => openLink(detail)} />
        </div>
        <LinkEnterpriseDialog open={linkOpen} onOpenChange={setLinkOpen} project={linkTarget ?? detail} />
      </AppLayout>
    );
  }

  // ============ 列表页 ============
  return (
    <AppLayout title="固定资产投资项目管理">
      <div className="space-y-4">
        {/* KPI */}
        <div className="grid gap-3 md:grid-cols-3">
          {stats.map((s) => {
            const t = toneClass(s.tone);
            return (
              <Card key={s.label} className="panel relative overflow-hidden">
                <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", t.ring)} />
                <CardContent className="relative flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className={cn("font-mono text-3xl font-bold tracking-tight", t.value)}>{fmt(s.value)}</span>
                      <span className="text-xs text-muted-foreground">{s.unit}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{s.hint}</p>
                  </div>
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border", t.iconBg)}>
                    <s.icon className="h-6 w-6" strokeWidth={2.2} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 列表 */}
        <Card className="panel">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Boxes className="h-4 w-4 text-primary" />普通固定资产投资项目
                <Badge variant="outline" className="ml-1">{filtered.length} 条</Badge>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1"><Download className="h-3.5 w-3.5" />批量导出</Button>
                <Button size="sm" className="gap-1" onClick={() => setImportOpen(true)}>
                  <Upload className="h-3.5 w-3.5" />导入项目
                </Button>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {/* 顶部紧凑行：搜索 + 激活芯片 + 控制 */}
              <div className="flex items-center gap-3">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜索项目名称 / 单位名称…"
                    className="h-9 rounded-lg bg-muted/40 pl-9 focus-visible:bg-background"
                  />
                </div>

                {activeChips.length > 0 && (
                  <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
                    {activeChips.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={c.remove}
                        className="group flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] text-primary hover:bg-primary/15"
                      >
                        <span className="opacity-70">{c.label}:</span>
                        <span className="font-medium">{c.value}</span>
                        <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex shrink-0 items-center gap-1 border-l border-border/60 pl-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-primary"
                    onClick={reset}
                    title="重置筛选"
                    disabled={activeChips.length === 0 && !keyword}
                  >
                    <FilterX className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={filtersOpen ? "secondary" : "outline"}
                    className="h-9 gap-1.5"
                    onClick={() => setFiltersOpen((v) => !v)}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    高级筛选
                    {totalActive > 0 && (
                      <Badge variant="secondary" className="ml-0.5 h-5 bg-primary/15 px-1.5 text-primary">{totalActive}</Badge>
                    )}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", filtersOpen && "rotate-180")} />
                  </Button>
                </div>
              </div>

              {/* 可折叠面板 */}
              {filtersOpen && (
                <div className="grid gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 p-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="ml-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">所属区</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-full justify-between bg-background font-normal">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={cn(districtFilter.length === 0 && "text-muted-foreground")}>
                              {districtFilter.length === 0 ? "全部区" : `已选 ${districtFilter.length} 项`}
                            </span>
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="start">
                        {districts.map((d) => {
                          const checked = districtFilter.includes(d);
                          return (
                            <label key={d} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                              <Checkbox checked={checked} onCheckedChange={(v) => setDistrictFilter((arr) => v ? [...arr, d] : arr.filter((x) => x !== d))} />
                              <span>{d}</span>
                            </label>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">状态</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-full justify-between bg-background font-normal">
                          <span className="flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={cn(statusFilter.length === 0 && "text-muted-foreground")}>
                              {statusFilter.length === 0 ? "全部状态" : `已选 ${statusFilter.length} 项`}
                            </span>
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2" align="start">
                        {ALL_STATUSES.map((s) => {
                          const checked = statusFilter.includes(s);
                          return (
                            <label key={s} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                              <Checkbox checked={checked} onCheckedChange={(v) => setStatusFilter((arr) => v ? [...arr, s] : arr.filter((x) => x !== s))} />
                              <span>{s}</span>
                            </label>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">关联企业行业</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-full justify-between bg-background font-normal">
                          <span className="flex items-center gap-2 truncate">
                            <Factory className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className={cn("truncate", industryFilter.length === 0 && "text-muted-foreground")}>
                              {industryFilter.length === 0 ? "全部行业" : `已选 ${industryFilter.length} 项`}
                            </span>
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-2" align="start">
                        <div className="mb-1 px-2 py-1 text-[11px] text-muted-foreground">仅在有关联企业的项目中筛选</div>
                        {linkedIndustries.map((ind) => {
                          const checked = industryFilter.includes(ind);
                          return (
                            <label key={ind} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                              <Checkbox checked={checked} onCheckedChange={(v) => setIndustryFilter((arr) => v ? [...arr, ind] : arr.filter((x) => x !== ind))} />
                              <span className="truncate">{ind}</span>
                            </label>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">同期采集占比</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-full justify-between bg-background font-normal">
                          <span className="flex items-center gap-2">
                            <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={cn(ratioFilter.length === 0 && "text-muted-foreground")}>
                              {ratioFilter.length === 0 ? "全部区间" : `已选 ${ratioFilter.length} 项`}
                            </span>
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="start">
                        {RATIO_OPTIONS.map((o) => {
                          const checked = ratioFilter.includes(o.v);
                          return (
                            <label key={o.v} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                              <Checkbox checked={checked} onCheckedChange={(v) => setRatioFilter((arr) => v ? [...arr, o.v] : arr.filter((x) => x !== o.v))} />
                              <span>{o.label}</span>
                            </label>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">同期采集增量</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-full justify-between bg-background font-normal">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={cn(deltaFilter.length === 0 && "text-muted-foreground")}>
                              {deltaFilter.length === 0 ? "全部区间" : `已选 ${deltaFilter.length} 项`}
                            </span>
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2" align="start">
                        {DELTA_OPTIONS.map((o) => {
                          const checked = deltaFilter.includes(o.v);
                          return (
                            <label key={o.v} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                              <Checkbox checked={checked} onCheckedChange={(v) => setDeltaFilter((arr) => v ? [...arr, o.v] : arr.filter((x) => x !== o.v))} />
                              <span>{o.label}</span>
                            </label>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">是否现场检查</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-full justify-between bg-background font-normal">
                          <span className="flex items-center gap-2">
                            <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={cn(onSiteFilter.length === 0 && "text-muted-foreground")}>
                              {onSiteFilter.length === 0 ? "全部" : `已选 ${onSiteFilter.length} 项`}
                            </span>
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2" align="start">
                        {([{ v: "yes" as OnSiteBucket, label: "已现场检查" }, { v: "no" as OnSiteBucket, label: "未现场检查" }]).map((o) => {
                          const checked = onSiteFilter.includes(o.v);
                          return (
                            <label key={o.v} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                              <Checkbox checked={checked} onCheckedChange={(v) => setOnSiteFilter((arr) => v ? [...arr, o.v] : arr.filter((x) => x !== o.v))} />
                              <span>{o.label}</span>
                            </label>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-[640px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="w-14 px-3">序号</TableHead>
                    <TableHead className="min-w-[260px] px-3 pr-1">项目名称</TableHead>
                    <TableHead className="min-w-[200px] px-1">所属单位</TableHead>
                    <TableHead className="w-24 pl-1 pr-3">所属区</TableHead>
                    <TableHead className="w-24 px-3">状态</TableHead>
                    <TableHead className="w-32 px-3 text-right">批复能耗</TableHead>
                    <TableHead className="w-32 px-3 text-right">采集能耗</TableHead>
                    <TableHead className="w-32 px-3 text-right">同期采集占比</TableHead>
                    <TableHead className="w-36 px-3 text-right">同期采集增量</TableHead>
                    <TableHead className="w-24 px-3 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p, i) => {
                    const over = p.collectedEnergy > p.approvedEnergy && p.collectedEnergy > 0;
                    const ratio = computeYtdRatio(p);
                    const ratioWarn = ratio > 110;
                    const ratioMid = ratio >= 90 && ratio <= 110;
                    const delta = computeDelta(p);
                    const deltaBucket = deltaBucketOf(delta);
                    return (
                      <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetail(p)}>
                        <TableCell className="px-3 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</TableCell>
                        <TableCell className="px-3 pr-1">
                          <div className="font-medium text-foreground">{p.name}</div>
                        </TableCell>
                        <TableCell className="px-1 text-xs text-muted-foreground">{p.unitName}</TableCell>
                        <TableCell className="pl-1 pr-3 text-xs">{p.district}</TableCell>
                        <TableCell className="px-3">
                          <Badge variant="outline" className={cn(statusBadgeStyle[p.status])}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="px-3 text-right font-mono text-sm tabular-nums">{fmt(p.approvedEnergy)}</TableCell>
                        <TableCell className={cn("px-3 text-right font-mono text-sm tabular-nums", over && "text-destructive font-semibold")}>
                          <div className="flex items-center justify-end gap-1">
                            {over && <AlertTriangle className="h-3.5 w-3.5" />}
                            {fmt(p.collectedEnergy)}
                          </div>
                        </TableCell>
                        <TableCell className={cn(
                          "px-3 text-right font-mono text-sm tabular-nums",
                          p.collectedEnergy === 0 && "text-muted-foreground",
                          p.collectedEnergy > 0 && ratioMid && "text-warning font-semibold",
                          p.collectedEnergy > 0 && ratioWarn && "text-destructive font-semibold",
                        )}>
                          {p.collectedEnergy > 0 ? `${ratio.toFixed(1)}%` : "—"}
                        </TableCell>
                        <TableCell className={cn(
                          "px-3 text-right font-mono text-sm tabular-nums",
                          p.collectedEnergy === 0 && "text-muted-foreground",
                          p.collectedEnergy > 0 && deltaBucket === "0-1000" && "text-warning font-semibold",
                          p.collectedEnergy > 0 && deltaBucket === "1000+" && "text-destructive font-semibold",
                        )}>
                          {p.collectedEnergy > 0 ? `${delta > 0 ? "+" : ""}${fmt(delta, 0)}` : "—"}
                        </TableCell>
                        <TableCell className="px-3 text-right">
                          <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setDetail(p); }}>
                            <Eye className="h-3.5 w-3.5" />查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="h-32 text-center text-sm text-muted-foreground">暂无匹配项目</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <LinkEnterpriseDialog open={linkOpen} onOpenChange={setLinkOpen} project={linkTarget ?? projects[0]} />
    </AppLayout>
  );
}
