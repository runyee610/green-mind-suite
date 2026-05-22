import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain, Send, Sparkles, Activity, Plus, FileSearch, Database,
  Workflow, CircleDollarSign, ChevronRight, MessageSquare, Trash2,
  CheckCircle2, XCircle, Wallet, Building2, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRole } from "@/contexts/RoleContext";
import {
  policies, matches, disbursements, workflowSteps, dataSources,
  CURRENT_ENTERPRISE_ID, findPolicy, findEnterprise, getEntCertificate,
  getEntMatches, getEntDisbursements, matchStatusStyle,
  type MatchRecord,
} from "@/components/direct-benefit/directBenefitData";
import { DataCertificateMini } from "@/components/direct-benefit/DataCertificateMini";
import { cn } from "@/lib/utils";

// ====== 消息模型 ======
type CardKind =
  | { kind: "policy-list"; ids: string[] }
  | { kind: "match-table"; ids: string[] }
  | { kind: "ent-certificate"; entId: string; matchId?: string }
  | { kind: "disburse-list"; ids: string[] }
  | { kind: "datasource-summary" }
  | { kind: "agent-action"; title: string; confidence: number; detail: string }
  | { kind: "kpi" };

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  time: string;
  text?: string;
  cards?: CardKind[];
}

const NOW = "09:12";

const stepIcon = { collect: FileSearch, profile: Database, match: Workflow, disburse: CircleDollarSign };

export default function DirectBenefit() {
  const { role } = useRole();
  const navigate = useNavigate();

  // 预设对话
  const initial: ChatMessage[] = useMemo(
    () => buildInitial(role),
    [role],
  );

  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMessages(initial), [initial]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  const quicks = role === "gov"
    ? ["今日新增政策", "本周高置信撮合", "拨付进度", "配置数据源"]
    : ["我适用哪些政策", "我的数据确权证书", "我的资金到账"];

  const sendUser = (text: string) => {
    const user: ChatMessage = { id: `u-${Date.now()}`, role: "user", text, time: NOW };
    setMessages((m) => [...m, user]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = buildReply(role, text);
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 700);
  };

  return (
    <AppLayout hideHeader>
      <div className="grid h-[calc(100vh-7rem)] grid-cols-[260px_1fr] gap-4">
        {/* 左栏：会话 + 能力面板 */}
        <aside className="flex flex-col gap-3 overflow-hidden">
          {/* 智能体头像 */}
          <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Brain className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground text-lg">免审即享智能体</div>
              <div className="text-[10px] text-muted-foreground">
                <Activity className="mr-0.5 inline h-2.5 w-2.5" />运行中 · GPT-5.2
              </div>
            </div>
          </div>

          {/* 会话列表 */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="font-semibold text-foreground text-base">功能</div>
              <button className="text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <div className="px-1.5 py-1.5">
              <div className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-xs text-foreground">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                <span className="flex-1 truncate text-sm">今日工作台</span>
                <span className="font-mono text-[9px] text-muted-foreground">{NOW}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/40">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="flex-1 truncate text-sm">{role === "gov" ? "上周拨付复盘" : "Q1 政策匹配"}</span>
                <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </div>

          {/* 智能体能力面板 — 政府侧四大子能力入口 */}
          {role === "gov" && (
            <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card">
              <div className="border-b border-border px-3 py-2 font-semibold text-foreground text-base">
                智能体能力面板
              </div>
              <div className="space-y-1.5 p-2">
                {[
                  { label: "政策图谱", desc: "政策抓取/解析/对比", icon: FileSearch, to: "/direct-benefit/gov/policies" },
                  { label: "企业画像", desc: "画像 / 数据确权证书", icon: Database, to: "/direct-benefit/gov/entprofile" },
                  { label: "撮合名单", desc: "智能撮合 / 公示流程", icon: Workflow, to: "/direct-benefit/gov/matches" },
                  { label: "资金拨付", desc: "金额核定 / 拨付看板", icon: CircleDollarSign, to: "/direct-benefit/gov/disburse" },
                ].map((f) => (
                  <button
                    key={f.label}
                    onClick={() => navigate(f.to)}
                    className="group flex w-full items-center gap-2.5 rounded-md border border-border/60 bg-muted/20 px-2.5 py-2 text-left transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-foreground">{f.label}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{f.desc}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </button>
                ))}
              </div>
              <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
                所有子能力均由智能体编排 · 数据源实时同步
              </div>
            </div>
          )}

          {/* 企业侧保留原工作流面板 */}
          {role === "ent" && (
            <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card">
              <div className="border-b border-border px-3 py-2 font-semibold text-foreground text-base">
                智能体能力面板
              </div>
              <div className="space-y-2 p-2.5">
                {workflowSteps.map((s) => {
                  const Icon = stepIcon[s.key];
                  return (
                    <div key={s.key} className="rounded-md border border-border/60 bg-muted/20 p-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Icon className="h-3 w-3 text-primary" />
                        <span className="text-[11px] font-medium text-foreground">{s.name}</span>
                        <span className={cn("ml-auto h-1.5 w-1.5 rounded-full", s.confidence >= 0.9 ? "bg-success" : "bg-warning")} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>置信度</span>
                        <span className="font-mono text-foreground">{(s.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* 主区：对话 */}
        <section className="flex min-h-0 flex-col rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground text-lg">
              {role === "gov" ? "政府工作台 · 智能对话" : "我的免审即享 · 智能对话"}
            </span>
            <Badge variant="outline" className="ml-auto border-success/40 bg-success/10 text-success text-[10px]">
              <Activity className="mr-1 h-2.5 w-2.5" />全链路在线
            </Badge>
          </div>



          {/* 滚动区 */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} msg={m} navigate={navigate} />
              ))}
              {thinking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span className="inline-flex items-center gap-1">
                    思考中
                    <span className="inline-flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-1 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: `${i * 120}ms` }} />
                      ))}
                    </span>
                  </span>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          {/* 输入 */}
          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quicks.map((q) => (
                <button
                  key={q}
                  onClick={() => sendUser(q)}
                  className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] text-foreground transition hover:border-primary/40 hover:bg-primary/5"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim()) return;
                sendUser(input.trim());
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={role === "gov" ? "向智能体提问，例如：今天有哪些待审核的撮合？" : "向智能体提问，例如：我现在有哪些可领的资金？"}
                className="h-10 text-xs"
              />
              <Button type="submit" size="sm" className="h-10 px-3" disabled={!input.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

// ========== 消息气泡 ==========

function MessageBubble({ msg, navigate }: { msg: ChatMessage; navigate: ReturnType<typeof useNavigate> }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-lg rounded-tr-sm bg-primary px-3 py-2 text-xs text-primary-foreground">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
        <Brain className="h-3.5 w-3.5 text-primary" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        {msg.text && (
          <div className="inline-block max-w-full rounded-lg rounded-tl-sm bg-muted/40 px-3 py-2 text-xs leading-relaxed text-foreground">
            {msg.text}
          </div>
        )}
        {msg.cards?.map((c, i) => (
          <CardRenderer key={i} card={c} navigate={navigate} />
        ))}
        <div className="font-mono text-[9px] text-muted-foreground">{msg.time}</div>
      </div>
    </div>
  );
}

function CardRenderer({ card, navigate }: { card: CardKind; navigate: ReturnType<typeof useNavigate> }) {
  if (card.kind === "agent-action") {
    return (
      <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">{card.title}</span>
          <Badge variant="outline" className="ml-auto border-primary/40 bg-background text-[10px] text-primary">
            置信度 {(card.confidence * 100).toFixed(0)}%
          </Badge>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{card.detail}</p>
      </div>
    );
  }

  if (card.kind === "kpi") {
    const arrived = disbursements.filter((d) => d.stage === "已到账").reduce((s, d) => s + d.amount, 0);
    const cells = [
      { label: "在库政策", v: policies.length },
      { label: "撮合数", v: matches.length },
      { label: "拨付笔数", v: disbursements.length },
      { label: "已到账", v: `${arrived} 万` },
    ];
    return (
      <div className="grid grid-cols-4 gap-2 rounded-md border border-border bg-muted/20 p-2.5">
        {cells.map((c) => (
          <div key={c.label} className="text-center">
            <div className="text-[10px] text-muted-foreground">{c.label}</div>
            <div className="mt-0.5 font-mono font-semibold text-foreground text-lg">{c.v}</div>
          </div>
        ))}
      </div>
    );
  }

  if (card.kind === "policy-list") {
    return (
      <div className="space-y-1.5">
        {card.ids.map((id) => {
          const p = findPolicy(id);
          if (!p) return null;
          return (
            <button
              key={id}
              onClick={() => navigate(`/direct-benefit/gov/policies/${id}`)}
              className="flex w-full items-start gap-2 rounded-md border border-border bg-card p-2.5 text-left transition hover:border-primary/40"
            >
              <FileSearch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-foreground line-clamp-1">{p.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{p.docNo}</span>
                  <span>·</span>
                  <span>{p.issuer}</span>
                  <span>·</span>
                  <span className="font-mono">{p.fundingMin}-{p.fundingMax} 万</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    );
  }

  if (card.kind === "match-table") {
    return (
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 text-left">企业</th>
              <th className="px-2 py-1.5 text-left">政策</th>
              <th className="px-2 py-1.5 text-left w-16">命中</th>
              <th className="px-2 py-1.5 text-left w-20">金额</th>
              <th className="px-2 py-1.5 text-left w-20">状态</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {card.ids.map((id) => {
              const m = matches.find((x) => x.id === id);
              if (!m) return null;
              return <MatchRow key={id} m={m} navigate={navigate} />;
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (card.kind === "ent-certificate") {
    const cert = getEntCertificate(card.entId);
    if (!cert) return null;
    return (
      <DataCertificateMini
        certificate={cert}
        href={`/direct-benefit/gov/entprofile/${card.entId}`}
      />
    );
  }

  if (card.kind === "disburse-list") {
    return (
      <div className="space-y-1.5">
        {card.ids.map((id) => {
          const d = disbursements.find((x) => x.id === id);
          if (!d) return null;
          const p = findPolicy(d.policyId);
          const e = findEnterprise(d.enterpriseId);
          const ms = matchStatusStyle["已拨付"];
          const stageColor = d.stage === "已到账" ? "text-success" : d.stage === "财政划拨中" ? "text-warning" : "text-info";
          return (
            <button
              key={id}
              onClick={() => navigate("/direct-benefit/gov/disburse")}
              className="flex w-full items-center gap-3 rounded-md border border-border bg-card p-2.5 text-left transition hover:border-primary/40"
            >
              <Wallet className="h-4 w-4 shrink-0 text-warning" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-foreground line-clamp-1">{e?.name} · {p?.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className={cn("font-medium", stageColor)}>{d.stage}</span>
                  <span>·</span>
                  <span className="font-mono">{d.timeline[d.timeline.length - 1].time}</span>
                  {d.certificateId && (
                    <>
                      <span>·</span>
                      <span className="font-mono">证书 {d.certificateId}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="font-mono text-sm font-semibold text-warning">{d.amount} 万</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (card.kind === "datasource-summary") {
    return (
      <div className="rounded-md border border-border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">数据源 · 当前 {dataSources.length} 个</span>
          <Link to="/direct-benefit/gov/sources" className="text-[10px] text-primary hover:underline">
            前往配置 →
          </Link>
        </div>
        <div className="space-y-1">
          {dataSources.slice(0, 4).map((d) => (
            <div key={d.id} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-xs">
                <span className={cn("h-1.5 w-1.5 rounded-full", d.status === "已连接" ? "bg-success" : d.status === "异常" ? "bg-destructive" : "bg-muted-foreground")} />
                <span className="text-foreground">{d.name}</span>
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">{d.lastSync}</span>
            </div>
          ))}
          <div className="pt-1 text-[10px] text-muted-foreground">… 共 {dataSources.length} 项</div>
        </div>
      </div>
    );
  }

  return null;
}

function MatchRow({ m, navigate }: { m: MatchRecord; navigate: ReturnType<typeof useNavigate> }) {
  const e = findEnterprise(m.enterpriseId);
  const p = findPolicy(m.policyId);
  const hit = m.hits.filter((h) => h.hit).length;
  const s = matchStatusStyle[m.status];
  return (
    <tr
      className="cursor-pointer border-t border-border hover:bg-muted/30"
      onClick={() => navigate(`/direct-benefit/gov/matches/${m.id}`)}
    >
      <td className="px-2 py-1.5 text-foreground">{e?.name}</td>
      <td className="px-2 py-1.5 text-muted-foreground line-clamp-1">{p?.name}</td>
      <td className="px-2 py-1.5 font-mono text-foreground">{hit}/{m.hits.length}</td>
      <td className="px-2 py-1.5 font-mono font-semibold text-warning">{m.estimatedFunding} 万</td>
      <td className="px-2 py-1.5">
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[10px]", s.badge)}>
          <span className={cn("h-1 w-1 rounded-full", s.dot)} />
          {m.status}
        </span>
      </td>
      <td className="px-1"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
    </tr>
  );
}

// ========== 预设对话脚本 ==========

function buildInitial(role: "gov" | "ent"): ChatMessage[] {
  if (role === "gov") {
    return [
      {
        id: "m1", role: "agent", time: NOW,
        text: "早上好，我是免审即享智能体。我已完成今日例行作业，要点如下：",
        cards: [{ kind: "kpi" }],
      },
      {
        id: "m2", role: "agent", time: NOW,
        cards: [
          { kind: "agent-action", title: "政策采集 · 新增 3 项", confidence: 0.94, detail: "从市经信委、市发改委、浦东发改委抓取并完成结构化解析，置信度 88%-98%。" },
          { kind: "policy-list", ids: policies.slice(0, 3).map((p) => p.id) },
        ],
      },
      {
        id: "m3", role: "agent", time: NOW,
        cards: [
          { kind: "agent-action", title: "智能撮合 · 高置信 4 条", confidence: 0.92, detail: "已结合企业数据确权证书生成撮合证据，请优先复核以下两条。" },
          { kind: "match-table", ids: ["M001", "M002"] },
        ],
      },
      {
        id: "m4", role: "agent", time: NOW,
        text: "如需查看任一企业的数据确权证书（如下示意），可点击进入企业画像。",
        cards: [{ kind: "ent-certificate", entId: "E001" }],
      },
      {
        id: "m5", role: "agent", time: NOW,
        cards: [
          { kind: "agent-action", title: "资金拨付 · 待跟进 3 笔", confidence: 1, detail: "财政直达通道 3 笔在途、1 笔已到账。" },
          { kind: "disburse-list", ids: disbursements.map((d) => d.id) },
        ],
      },
    ];
  }
  // ent
  const ms = getEntMatches(CURRENT_ENTERPRISE_ID).map((m) => m.id);
  const ds = getEntDisbursements(CURRENT_ENTERPRISE_ID).map((d) => d.id);
  return [
    {
      id: "m1", role: "agent", time: NOW,
      text: "您好！我是免审即享智能体。我已根据您企业在平台上填报的数据，自动匹配到适用政策，并为您生成了数据确权证书：",
      cards: [{ kind: "ent-certificate", entId: CURRENT_ENTERPRISE_ID }],
    },
    {
      id: "m2", role: "agent", time: NOW,
      text: "以下是为您匹配的政策，命中条件均来自上方证书内的确权数据项，您无需再次提交申报书。",
      cards: [{ kind: "match-table", ids: ms }],
    },
    {
      id: "m3", role: "agent", time: NOW,
      cards: [
        { kind: "agent-action", title: "资金到账提醒", confidence: 1, detail: "您本月有 4 笔资金在流转，其中 1 笔已到账。" },
        { kind: "disburse-list", ids: ds },
      ],
    },
  ];
}

function buildReply(role: "gov" | "ent", text: string): ChatMessage {
  const t = text.toLowerCase();
  if (text.includes("数据源") || text.includes("source")) {
    return {
      id: `a-${Date.now()}`, role: "agent", time: NOW,
      text: "当前数据源运行情况如下，您可前往「数据源配置」页面新增/修改/启停：",
      cards: [{ kind: "datasource-summary" }],
    };
  }
  if (text.includes("政策")) {
    return {
      id: `a-${Date.now()}`, role: "agent", time: NOW,
      text: role === "gov" ? "以下是近期抓取并解析的政策，点击可查看详情、推送企业：" : "以下是与您适用的政策：",
      cards: [{ kind: "policy-list", ids: policies.map((p) => p.id) }],
    };
  }
  if (text.includes("撮合") || text.includes("匹配") || text.includes("适用")) {
    const ids = role === "gov" ? matches.map((m) => m.id) : getEntMatches(CURRENT_ENTERPRISE_ID).map((m) => m.id);
    return {
      id: `a-${Date.now()}`, role: "agent", time: NOW,
      text: "已为您准备撮合明细：",
      cards: [{ kind: "match-table", ids }],
    };
  }
  if (text.includes("证书") || text.includes("确权")) {
    return {
      id: `a-${Date.now()}`, role: "agent", time: NOW,
      text: "这是当前企业的数据确权证书：",
      cards: [{ kind: "ent-certificate", entId: CURRENT_ENTERPRISE_ID }],
    };
  }
  if (text.includes("拨付") || text.includes("到账") || text.includes("资金")) {
    const ids = role === "gov" ? disbursements.map((d) => d.id) : getEntDisbursements(CURRENT_ENTERPRISE_ID).map((d) => d.id);
    return {
      id: `a-${Date.now()}`, role: "agent", time: NOW,
      text: "资金拨付情况：",
      cards: [{ kind: "disburse-list", ids }],
    };
  }
  return {
    id: `a-${Date.now()}`, role: "agent", time: NOW,
    text: "我可以帮您查看政策、撮合、数据确权证书、资金拨付等。试试下方快捷指令或直接输入关键词。",
  };
}
