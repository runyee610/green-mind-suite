import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  MOCK_RISKS,
  RiskWarning,
  riskLevelClass,
  riskStatusClass,
} from "./dynamicExtData";

type Mode = "gov" | "ent";

interface Props {
  mode: Mode;
  /** 当 mode = ent 时用于过滤当前企业的预警 */
  creditCode?: string;
}

export function RiskWarningPanel({ mode, creditCode }: Props) {
  const [data, setData] = useState<RiskWarning[]>(MOCK_RISKS);
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [active, setActive] = useState<RiskWarning | null>(null);
  const [remark, setRemark] = useState("");

  const list = useMemo(() => {
    let arr = data;
    if (mode === "ent" && creditCode) arr = arr.filter((r) => r.creditCode === creditCode);
    const k = keyword.trim();
    if (k) arr = arr.filter((r) => r.enterpriseName.includes(k) || r.title.includes(k));
    if (levelFilter !== "all") arr = arr.filter((r) => r.level === levelFilter);
    if (statusFilter !== "all") arr = arr.filter((r) => r.status === statusFilter);
    return arr;
  }, [data, keyword, levelFilter, statusFilter, mode, creditCode]);

  // 统计卡
  const stats = useMemo(() => {
    const scope = mode === "ent" && creditCode ? data.filter((r) => r.creditCode === creditCode) : data;
    return {
      total: scope.length,
      high: scope.filter((r) => r.level === "高").length,
      open: scope.filter((r) => r.status !== "已关闭").length,
      ai: scope.filter((r) => r.source === "AI 算法").length,
    };
  }, [data, mode, creditCode]);

  const handleNotify = (r: RiskWarning) => {
    setData((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "已通知企业" } : x));
    toast.success(`已下发预警通知给「${r.enterpriseName}」`);
  };
  const handleClose = (r: RiskWarning) => {
    setData((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "已关闭" } : x));
    toast.success(`预警「${r.title}」已关闭`);
    setActive(null);
  };
  const handleAck = (r: RiskWarning) => {
    setData((prev) => prev.map((x) => x.id === r.id ? {
      ...x,
      entAck: true,
      status: "整改中",
      entRemark: remark || x.entRemark || "已确认，启动整改流程。",
    } : x));
    toast.success("已确认预警，进入整改中");
    setRemark("");
    setActive(null);
  };

  return (
    <div className="space-y-4">
      {/* 统计卡 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={<Bell className="h-4 w-4" />} label="预警总数" value={stats.total} accent="primary" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="高风险" value={stats.high} accent="destructive" />
        <StatCard icon={<ShieldAlert className="h-4 w-4" />} label="未关闭" value={stats.open} accent="warning" />
        <StatCard icon={<Sparkles className="h-4 w-4" />} label="AI 智能识别" value={stats.ai} accent="secondary" />
      </div>

      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                {mode === "gov" ? "全市风险预警清单" : "我的风险预警"}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                由 AI 算法 + GB/T 36132 标准规则联合识别；
                {mode === "gov" ? "可下发通知至企业并跟踪整改。" : "请及时确认并完成整改反馈。"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={mode === "gov" ? "搜索企业 / 预警标题" : "搜索预警标题"}
                  className="h-8 w-56 pl-8 text-xs"
                />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-8 w-24 text-xs"><Filter className="mr-1 h-3 w-3" /><SelectValue placeholder="级别" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="状态" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="待处置">待处置</SelectItem>
                  <SelectItem value="已通知企业">已通知企业</SelectItem>
                  <SelectItem value="整改中">整改中</SelectItem>
                  <SelectItem value="已关闭">已关闭</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-16">级别</TableHead>
                <TableHead>预警标题 / 详情</TableHead>
                {mode === "gov" && <TableHead>企业</TableHead>}
                <TableHead className="text-center">分类</TableHead>
                <TableHead className="text-center">来源</TableHead>
                <TableHead>识别时间</TableHead>
                <TableHead className="text-center">状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer border-border/40"
                  onClick={() => { setActive(r); setRemark(r.entRemark ?? ""); }}
                >
                  <TableCell>
                    <Badge variant="outline" className={cn("font-semibold", riskLevelClass(r.level))}>{r.level}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm font-medium leading-tight">{r.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.detail}</p>
                  </TableCell>
                  {mode === "gov" && (
                    <TableCell className="text-xs">
                      <p>{r.enterpriseName}</p>
                      <p className="text-muted-foreground">{r.district}</p>
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {r.source === "AI 算法" ? (
                      <span className="inline-flex items-center"><Sparkles className="mr-0.5 h-3 w-3 text-secondary" />{r.source}</span>
                    ) : r.source}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{r.detectedAt}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={riskStatusClass(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {mode === "gov" ? (
                      r.status === "待处置" ? (
                        <Button size="sm" variant="outline" className="h-7" onClick={(e) => { e.stopPropagation(); handleNotify(r); }}>
                          <Send className="mr-1 h-3 w-3" />下发通知
                        </Button>
                      ) : r.status !== "已关闭" ? (
                        <Button size="sm" variant="outline" className="h-7" onClick={(e) => { e.stopPropagation(); setActive(r); }}>
                          <ChevronRight className="mr-1 h-3 w-3" />跟踪
                        </Button>
                      ) : (
                        <span className="text-xs text-success inline-flex items-center"><CheckCircle2 className="mr-1 h-3 w-3" />已关闭</span>
                      )
                    ) : (
                      r.entAck ? (
                        <Button size="sm" variant="outline" className="h-7" onClick={(e) => { e.stopPropagation(); setActive(r); }}>
                          <ChevronRight className="mr-1 h-3 w-3" />查看
                        </Button>
                      ) : (
                        <Button size="sm" className="h-7 bg-gradient-primary text-primary-foreground" onClick={(e) => { e.stopPropagation(); setActive(r); }}>
                          <ShieldCheck className="mr-1 h-3 w-3" />确认整改
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={mode === "gov" ? 8 : 7} className="py-10 text-center text-sm text-muted-foreground">
                    <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-success" />
                    暂无预警，绿色合规状态良好
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 详情 Sheet */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("font-semibold", riskLevelClass(active.level))}>{active.level}风险</Badge>
                  <Badge variant="outline">{active.category}</Badge>
                  <Badge variant="outline" className={riskStatusClass(active.status)}>{active.status}</Badge>
                </div>
                <SheetTitle className="text-base mt-2">{active.title}</SheetTitle>
                <SheetDescription className="text-xs">
                  {active.enterpriseName} · {active.district} · 识别于 {active.detectedAt}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <Section label="风险详情">{active.detail}</Section>
                <Section label="触发依据">
                  <span className="inline-flex items-center"><Sparkles className="mr-1 h-3 w-3 text-secondary" />{active.source} · {active.trigger}</span>
                </Section>
                <Section label="AI 处置建议" highlight>
                  {active.suggestion}
                </Section>
                {active.entRemark && (
                  <Section label="企业整改反馈">{active.entRemark}</Section>
                )}
                {mode === "ent" && active.status !== "已关闭" && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium">整改备注</p>
                    <Textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder="请填写整改计划或处置说明……"
                      className="min-h-[80px] text-xs"
                    />
                  </div>
                )}
              </div>
              <SheetFooter className="mt-4">
                {mode === "gov" ? (
                  <>
                    {active.status === "待处置" && (
                      <Button onClick={() => handleNotify(active)}>
                        <Send className="mr-1 h-4 w-4" />下发通知
                      </Button>
                    )}
                    {active.status !== "已关闭" && (
                      <Button variant="outline" onClick={() => handleClose(active)}>
                        <CheckCircle2 className="mr-1 h-4 w-4" />关闭预警
                      </Button>
                    )}
                  </>
                ) : (
                  active.status !== "已关闭" && (
                    <Button onClick={() => handleAck(active)} className="bg-gradient-primary text-primary-foreground">
                      <ShieldCheck className="mr-1 h-4 w-4" />确认并启动整改
                    </Button>
                  )
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Section({ label, children, highlight }: { label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn("rounded-md border p-3", highlight ? "border-primary/40 bg-primary/5" : "border-border/60 bg-muted/20")}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: number;
  accent: "primary" | "destructive" | "warning" | "secondary";
}) {
  const accentMap = {
    primary: "text-primary border-primary/30 bg-primary/5",
    destructive: "text-destructive border-destructive/30 bg-destructive/5",
    warning: "text-warning border-warning/30 bg-warning/5",
    secondary: "text-info border-info/30 bg-info/5",
  };
  return (
    <div className={cn("rounded-lg border p-3", accentMap[accent])}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
