import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Boxes, Download, Eye, Flame, Leaf, Link2, Search, Upload, Users, FilterX } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ImportDialog } from "@/components/assets/ImportDialog";
import { LinkEnterpriseDialog } from "@/components/assets/LinkEnterpriseDialog";
import { ProjectDetailView } from "@/components/assets/ProjectDetailView";
import { contacts, linkStatusStyle, projects, type InvestmentProject } from "@/components/assets/assetsData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const fmt = (n: number, d = 0) => n.toLocaleString(undefined, { maximumFractionDigits: d });

export default function Assets() {
  const [detail, setDetail] = useState<InvestmentProject | null>(null);
  const [keyword, setKeyword] = useState("");
  const [creditCode, setCreditCode] = useState("");
  const [contactFilter, setContactFilter] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState<InvestmentProject | null>(null);

  const filtered = useMemo(() => {
    const list = projects.filter((p) => {
      const kw = !keyword || p.name.includes(keyword) || p.unitName.includes(keyword);
      const cc = !creditCode || p.creditCode.includes(creditCode);
      const ct = contactFilter.length === 0 || contactFilter.includes(p.contact);
      return kw && cc && ct;
    });
    if (contactFilter.length > 1) {
      return [...list].sort((a, b) => contactFilter.indexOf(a.contact) - contactFilter.indexOf(b.contact));
    }
    return list;
  }, [keyword, creditCode, contactFilter]);

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

  const reset = () => { setKeyword(""); setCreditCode(""); setContactFilter([]); };
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

  // ============ 详情子页面 ============
  if (detail) {
    return (
      <AppLayout title="固定资产管理" subtitle="项目详情">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setDetail(null)}>
              <ArrowLeft className="h-4 w-4" />返回项目列表
            </Button>
            <div className="text-xs text-muted-foreground">
              当前查看：<span className="text-foreground">{detail.name}</span>
            </div>
          </div>
          <ProjectDetailView project={detail} onLink={() => openLink(detail)} />
        </div>
        <LinkEnterpriseDialog open={linkOpen} onOpenChange={setLinkOpen} project={linkTarget ?? detail} />
      </AppLayout>
    );
  }

  // ============ 列表页 ============
  return (
    <AppLayout title="固定资产管理" subtitle="政府侧普通固定资产投资项目统一视图、检索与企业关联">
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

            <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_220px_200px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="项目名称 / 单位名称模糊搜索" className="h-9 pl-9" />
              </div>
              <Input value={creditCode} onChange={(e) => setCreditCode(e.target.value)} placeholder="统一社会信用代码（精准）" className="h-9 font-mono" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 justify-start gap-1">
                    <Users className="h-3.5 w-3.5" />
                    对口人 {contactFilter.length > 0 && <Badge variant="secondary" className="ml-auto h-5 px-1.5">{contactFilter.length}</Badge>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2" align="start">
                  <div className="mb-1 px-2 py-1 text-xs text-muted-foreground">多选后将按对口人临近排序</div>
                  {contacts.map((c) => {
                    const checked = contactFilter.includes(c);
                    return (
                      <label key={c} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                        <Checkbox checked={checked} onCheckedChange={(v) => setContactFilter((arr) => v ? [...arr, c] : arr.filter((x) => x !== c))} />
                        <span>{c}</span>
                      </label>
                    );
                  })}
                </PopoverContent>
              </Popover>
              <Button size="sm" variant="ghost" className="h-9 gap-1" onClick={reset}>
                <FilterX className="h-3.5 w-3.5" />重置
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-[640px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="w-12">序号</TableHead>
                    <TableHead>项目名称</TableHead>
                    <TableHead>所属单位</TableHead>
                    <TableHead className="w-20">所属区</TableHead>
                    <TableHead className="text-right">批复能耗</TableHead>
                    <TableHead className="text-right">采集能耗</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p, i) => {
                    const over = p.collectedEnergy > p.approvedEnergy && p.collectedEnergy > 0;
                    return (
                      <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetail(p)}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{p.id}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.unitName}</TableCell>
                        <TableCell className="text-xs">{p.district}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{fmt(p.approvedEnergy)}</TableCell>
                        <TableCell className={cn("text-right font-mono text-sm", over && "text-destructive font-semibold")}>
                          <div className="flex items-center justify-end gap-1">
                            {over && <AlertTriangle className="h-3.5 w-3.5" />}
                            {fmt(p.collectedEnergy)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setDetail(p); }}>
                            <Eye className="h-3.5 w-3.5" />查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">暂无匹配项目</TableCell></TableRow>
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
