import { Fragment, useMemo, useState } from "react";
import { Database, Plus, RefreshCw, Settings2, Copy, AlertTriangle, CheckCircle2, PauseCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataSources, dataSourceStatusStyle, syncLogs, type DataSource, type DataSourceCategory } from "@/components/direct-benefit/directBenefitData";
import { cn } from "@/lib/utils";

const CATS: Array<"全部" | DataSourceCategory> = ["全部", "政策渠道", "企业填报", "监管数据", "金融数据"];

export default function DirectBenefitDataSources() {
  const [cat, setCat] = useState<"全部" | DataSourceCategory>("全部");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => dataSources.filter((d) => cat === "全部" || d.category === cat), [cat]);

  const total = dataSources.length;
  const todaySync = syncLogs.filter((l) => l.time.startsWith("2026-05-18")).length;
  const errs = dataSources.filter((d) => d.status === "异常").length;

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">数据源配置</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              政府侧维护智能体所依赖的政策渠道、企业填报、监管与金融数据接入；点击行可就地编辑映射与刷新策略。
            </p>
          </div>
          <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />新增数据源</Button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-3">
          <Kpi label="接入数据源" value={total} icon={Database} />
          <Kpi label="今日同步次数" value={todaySync} icon={RefreshCw} tone="primary" />
          <Kpi label="异常源" value={errs} icon={AlertTriangle} tone={errs > 0 ? "danger" : "default"} />
        </div>

        {/* 分类筛选 */}
        <Tabs value={cat} onValueChange={(v) => setCat(v as typeof cat)}>
          <TabsList>
            {CATS.map((c) => <TabsTrigger key={c} value={c} className="text-xs">{c}</TabsTrigger>)}
          </TabsList>
        </Tabs>

        {/* 表格 */}
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>数据源</TableHead>
                  <TableHead className="w-24">类别</TableHead>
                  <TableHead className="w-32">主管部门</TableHead>
                  <TableHead className="w-24">刷新策略</TableHead>
                  <TableHead className="w-20">状态</TableHead>
                  <TableHead className="w-32">最近同步</TableHead>
                  <TableHead className="w-20">字段映射</TableHead>
                  <TableHead className="w-44 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((d) => {
                  const s = dataSourceStatusStyle[d.status];
                  const expanded = openId === d.id;
                  return (
                    <Fragment key={d.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/30" onClick={() => setOpenId(expanded ? null : d.id)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
                            <div>
                              <div className="font-medium text-foreground">{d.name}</div>
                              <div className="font-mono text-[10px] text-muted-foreground">{d.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{d.category}</TableCell>
                        <TableCell className="text-xs">{d.owner}</TableCell>
                        <TableCell className="text-xs">{d.refreshCron}</TableCell>
                        <TableCell>
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]", s.badge)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />{d.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{d.lastSync}</TableCell>
                        <TableCell className="font-mono text-xs text-foreground">{d.fieldsMapped}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => toast.success(`已触发 ${d.name} 立即同步`)}><RefreshCw className="mr-1 h-3 w-3" />同步</Button>
                          <Button variant="ghost" size="sm" onClick={() => setOpenId(expanded ? null : d.id)}><Settings2 className="mr-1 h-3 w-3" />配置</Button>
                        </TableCell>
                      </TableRow>
                      {expanded && (
                        <TableRow className="bg-muted/20">
                          <TableCell colSpan={8} className="p-4">
                            <InlineEditor d={d} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 同步日志 + 字段映射 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">同步日志（最近 10 条）</h3>
                <Button variant="ghost" size="sm" className="text-xs"><RefreshCw className="mr-1 h-3 w-3" />刷新</Button>
              </div>
              <ul className="space-y-1.5">
                {syncLogs.map((l) => {
                  const src = dataSources.find((d) => d.id === l.sourceId);
                  const iconCls = l.status === "成功" ? "text-success" : l.status === "失败" ? "text-destructive" : "text-warning";
                  const Icon = l.status === "成功" ? CheckCircle2 : l.status === "失败" ? AlertTriangle : RefreshCw;
                  return (
                    <li key={l.id} className="flex items-start gap-2 rounded-md border border-border/60 bg-card p-2 text-[11px]">
                      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", iconCls)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{src?.name ?? l.sourceId}</span>
                          <span className={cn("font-medium", iconCls)}>{l.status}</span>
                        </div>
                        <div className="mt-0.5 text-muted-foreground">{l.detail}</div>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">{l.time.slice(5)}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">字段映射规则（示例）</h3>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.success("已复制到剪贴板")}>
                  <Copy className="mr-1 h-3 w-3" />复制
                </Button>
              </div>
              <pre className="max-h-72 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-[10px] leading-relaxed text-foreground">
{`{
  "source": "DS04 经信委节能月报",
  "primaryKey": "credit_code + ym",
  "mapping": [
    { "from": "monthly.energy_total_tce", "to": "节能月报.total_tce" },
    { "from": "monthly.coal_tce",          "to": "节能月报.coal_tce" },
    { "from": "monthly.electricity_kwh",   "to": "节能月报.elec_kwh" },
    { "from": "monthly.submit_status",     "to": "节能月报.submit_status" }
  ],
  "validators": [
    { "field": "节能月报.total_tce", "rule": ">=0" },
    { "field": "节能月报.submit_status", "rule": "in: 已提交|审核中|已通过" }
  ],
  "writeTo": ["企业画像.energy_use", "智能体.match_evidence"]
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function InlineEditor({ d }: { d: DataSource }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div>
          <Label className="text-[10px] text-muted-foreground">名称</Label>
          <Input defaultValue={d.name} className="mt-1 h-8 text-xs" />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">接入端点</Label>
          <Input defaultValue={d.endpoint} className="mt-1 h-8 font-mono text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">刷新策略</Label>
            <Input defaultValue={d.refreshCron} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">字段映射数</Label>
            <Input defaultValue={d.fieldsMapped} readOnly className="mt-1 h-8 bg-muted/30 font-mono text-xs" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="rounded-md border border-border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground">
          <div className="font-semibold text-foreground">说明</div>
          <p className="mt-1">{d.note ?? "本数据源由智能体自动拉取并写入企业画像与撮合证据库。修改配置后将于下个调度周期生效。"}</p>
          <div className="mt-2 font-mono text-[10px]">记录数：{d.recordCount.toLocaleString()}</div>
        </div>
        <div className="flex items-center justify-end gap-2">
          {d.status === "暂停" ? (
            <Button size="sm" variant="outline" onClick={() => toast.success("已启用")}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />启用</Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => toast.success("已暂停")}><PauseCircle className="mr-1 h-3.5 w-3.5" />暂停</Button>
          )}
          <Button size="sm" onClick={() => toast.success("配置已保存")}>保存</Button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tone = "default" }: { label: string; value: number | string; icon: typeof Database; tone?: "default" | "primary" | "danger" }) {
  const tones = {
    default: "border-border/60 bg-card",
    primary: "border-primary/30 bg-primary/5",
    danger: "border-destructive/30 bg-destructive/5",
  } as const;
  return (
    <Card className={cn(tones[tone])}>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 font-mono text-xl font-semibold text-foreground">{value}</div>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
