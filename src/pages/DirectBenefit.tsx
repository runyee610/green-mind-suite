import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, FileSearch, Workflow, Send, CircleDollarSign, Megaphone,
  CheckCircle2, Clock, Wallet, Sparkles, Building2, Database, Activity,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRole } from "@/contexts/RoleContext";
import { AgentStatusBar } from "@/components/direct-benefit/AgentStatusBar";
import {
  policies, enterprises, matches, disbursements, agentEvents, workflowSteps,
  CURRENT_ENTERPRISE_ID, findPolicy, findEnterprise, getEntMatches, getEntDisbursements,
  matchStatusStyle,
  type AgentEventKind,
} from "@/components/direct-benefit/directBenefitData";
import { cn } from "@/lib/utils";

const eventIcon: Record<AgentEventKind, typeof FileSearch> = {
  policy: FileSearch,
  profile: Database,
  match: Workflow,
  push: Megaphone,
  disburse: CircleDollarSign,
};

const eventColor: Record<AgentEventKind, string> = {
  policy: "text-info bg-info/10 border-info/30",
  profile: "text-primary bg-primary/10 border-primary/30",
  match: "text-warning bg-warning/10 border-warning/30",
  push: "text-info bg-info/10 border-info/30",
  disburse: "text-success bg-success/10 border-success/30",
};

export default function DirectBenefit() {
  const { role } = useRole();

  const govKpis = useMemo(() => {
    const pending = matches.filter((m) => m.status === "待公示").length;
    const awaiting = matches.filter((m) => m.status === "已推送" || m.status === "已公示").length;
    const disbursedAmount = disbursements.filter((d) => d.stage === "已到账").reduce((s, d) => s + d.amount, 0);
    return [
      { label: "在库政策", value: policies.length, sub: "智能体抓取 + 解析", icon: FileSearch, tone: "primary" as const },
      { label: "待公示名单", value: pending, sub: "需主管部门确认", icon: Workflow, tone: "warning" as const },
      { label: "待企业确认", value: awaiting, sub: "已推送 / 已公示", icon: Send, tone: "info" as const },
      { label: "本月已拨付", value: `${disbursedAmount} 万`, sub: `${disbursements.length} 笔`, icon: CircleDollarSign, tone: "success" as const },
    ];
  }, []);

  const entMatches = useMemo(() => getEntMatches(CURRENT_ENTERPRISE_ID), []);
  const entDisb = useMemo(() => getEntDisbursements(CURRENT_ENTERPRISE_ID), []);
  const entKpis = useMemo(() => {
    const matched = entMatches.length;
    const toConfirm = entMatches.filter((m) => m.status === "已推送" || m.status === "已公示").length;
    const inAudit = entMatches.filter((m) => m.status === "企业已确认").length;
    const arrived = entDisb.filter((d) => d.stage === "已到账").reduce((s, d) => s + d.amount, 0);
    return [
      { label: "为我匹配", value: matched, sub: "智能体已推荐", icon: Sparkles, tone: "primary" as const },
      { label: "待我确认", value: toConfirm, sub: "一键完成申领", icon: Send, tone: "warning" as const },
      { label: "审批中", value: inAudit, sub: "等待财政拨付", icon: Clock, tone: "info" as const },
      { label: "累计到账", value: `${arrived} 万`, sub: `${entDisb.filter((d) => d.stage === "已到账").length} 笔`, icon: Wallet, tone: "success" as const },
    ];
  }, [entMatches, entDisb]);

  const kpis = role === "gov" ? govKpis : entKpis;

  return (
    <AppLayout hideHeader>
      <div className="space-y-5">
        {/* 顶部 AI 智能体状态条 */}
        <AgentStatusBar
          policiesCount={policies.length}
          matchedEnterprises={role === "gov" ? new Set(matches.map((m) => m.enterpriseId)).size : entMatches.length}
          lastRunAt="2026-05-18 09:05"
        />

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            const toneMap = {
              primary: "border-primary/30 bg-primary/5 text-primary",
              warning: "border-warning/30 bg-warning/5 text-warning",
              info: "border-info/30 bg-info/5 text-info",
              success: "border-success/30 bg-success/5 text-success",
            } as const;
            return (
              <Card key={k.label} className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">{k.label}</div>
                      <div className="mt-1.5 font-mono text-2xl font-semibold text-foreground">{k.value}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{k.sub}</div>
                    </div>
                    <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg border", toneMap[k.tone])}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 主区域：左工作流时间轴 / 右动态 Feed */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* 工作流（占 3） */}
          <Card className="border-border/60 lg:col-span-3">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">智能体工作流</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    四步闭环：政策采集 → 企业画像 → 智能匹配 → 确认拨付。每一步均可追溯数据来源与产出。
                  </p>
                </div>
                <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-[10px]">
                  <Activity className="mr-1 h-2.5 w-2.5" />全链路在线
                </Badge>
              </div>

              <ol className="relative space-y-4 border-l-2 border-dashed border-border pl-5">
                {workflowSteps.map((s, i) => {
                  const Icon = [FileSearch, Database, Workflow, CircleDollarSign][i];
                  return (
                    <li key={s.key} className="relative">
                      <span className="absolute -left-[26px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Icon className="h-3 w-3" />
                      </span>
                      <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{i + 1}. {s.name}</span>
                          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-[10px]">
                            置信度 {(s.confidence * 100).toFixed(0)}%
                          </Badge>
                          <span className="ml-auto font-mono text-[10px] text-muted-foreground">{s.lastRunAt}</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.sources.map((src) => (
                            <span key={src} className="rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border">
                              {src}
                            </span>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          {/* 动态 Feed（占 2） */}
          <Card className="border-border/60 lg:col-span-2">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">今日动态</h3>
                <Badge variant="outline" className="border-border/60 bg-muted/40 text-[10px] text-muted-foreground">
                  智能体日志
                </Badge>
              </div>
              <ol className="space-y-3">
                {agentEvents.map((e) => {
                  const Icon = eventIcon[e.kind];
                  return (
                    <li key={e.id} className="flex gap-2.5">
                      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", eventColor[e.kind])}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-foreground">{e.title}</div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{e.detail}</p>
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{e.time}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* 快速入口 */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {role === "gov" ? (
            <>
              <QuickLink to="/direct-benefit/gov/policies" icon={FileSearch} title="政策图谱" desc="查看智能体抓取与解析的全部政策" />
              <QuickLink to="/direct-benefit/gov/matches" icon={Workflow} title="撮合名单" desc="审核匹配结果，公示或点对点推送" />
              <QuickLink to="/direct-benefit/gov/disburse" icon={CircleDollarSign} title="资金拨付" desc="跟踪已确认企业的拨付进度" />
            </>
          ) : (
            <>
              <QuickLink to="/direct-benefit/ent" icon={Sparkles} title="我的专属政策" desc="智能体匹配的政策一览" />
              <QuickLink to="/direct-benefit/ent/funds" icon={Wallet} title="资金到账" desc="查看拨付进度与凭证" />
              <QuickLink to="/direct-benefit/gov/policies" icon={FileSearch} title="政策图谱" desc="浏览全部在库政策" />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: typeof FileSearch; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
