import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Brain, Send, Sparkles, Activity, Plus, FileSearch, Workflow, Users,
  ChevronRight, MessageSquare, BarChart3, ShieldCheck, Building2, Wand2,
  TrendingUp, MapPin, Layers, GitCompare, CircleDollarSign, Wallet, Compass,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  policies, matches, enterprises, disbursements, findPolicy, findEnterprise,
  getEntCertificate, matchStatusStyle, domainStyle,
  type Disbursement,
} from "@/components/direct-benefit/directBenefitData";
import { DataCertificateMini } from "@/components/direct-benefit/DataCertificateMini";
import { ChatHero } from "@/components/direct-benefit/ChatHero";
import { cn } from "@/lib/utils";

export type Topic = "policies" | "enterprises" | "matches" | "disburse";

const TOPIC_META: Record<Topic, {
  title: string;
  subtitle: string;
  icon: typeof FileSearch;
  placeholder: string;
  quicks: string[];
  heroSuggestions: string[];
  welcome: string;
}> = {
  policies: {
    title: "政策图谱",
    subtitle: "用自然语言查询、对比、推送政策。无需翻报表，直接问。",
    icon: FileSearch,
    placeholder: "例如：列出节能技改类已公示政策；对比 P-2025-001 和 P-2025-002；按发文机关统计…",
    quicks: ["今天新增了哪些政策？", "按支持方向分组统计", "对比工业节能两项政策", "解析置信度最低的政策"],
    heroSuggestions: ["今天新增了哪些政策？", "按支持方向分组统计", "对比 P-2025-001 和 P-2025-002", "解析置信度最低的政策"],
    welcome: "我已抓取并解析全市最新政策。请直接用自然语言告诉我您想看什么 — 政策清单、对比、聚合统计都能即时生成。",
  },
  enterprises: {
    title: "企业画像",
    subtitle: "向智能体提问，自动生成画像清单、确权证书与分布报告。",
    icon: Users,
    placeholder: "例如：筛选浦东重点用能企业；展示某企业的数据确权证书；按行政区统计画像数量…",
    quicks: ["按行政区分布画像", "列出重点用能单位", "查看 E001 的数据确权证书", "完整度 < 100% 的企业"],
    heroSuggestions: ["按行政区分布画像", "重点用能单位有哪些？", "E001 的数据确权证书", "画像完整度不足的企业"],
    welcome: "我已为辖区企业生成画像与数据确权证书。试试问「按行政区分布」「重点用能企业」或「某企业的证书」。",
  },
  matches: {
    title: "撮合名单",
    subtitle: "智能体随问随答 — 高置信撮合、企业聚合、状态漏斗都能即时生成。",
    icon: Workflow,
    placeholder: "例如：本周高置信撮合；按状态分布；某企业的全部撮合记录；待公示的有哪些…",
    quicks: ["本周高置信撮合", "按状态统计撮合", "金额 Top 5 的撮合", "待公示的撮合明细"],
    heroSuggestions: ["本周高置信撮合", "按状态分布", "金额 Top 5", "待公示的撮合"],
    welcome: "我已基于企业数据确权证书与政策条件完成本期撮合。直接问 — 高置信、状态分布、Top N、待公示都行。",
  },
  disburse: {
    title: "资金拨付",
    subtitle: "直接说一个时间段，智能体即时生成拨付看板、阶段漏斗、政策与行政区报表。",
    icon: CircleDollarSign,
    placeholder: "例如：本月拨付看板；2026 年 5 月按政策汇总；近 30 天按行政区分布；已到账明细…",
    quicks: ["本月拨付看板", "近 30 天按行政区", "按政策汇总", "已到账明细"],
    heroSuggestions: ["本月拨付看板", "近 30 天按行政区", "按政策汇总金额", "已到账明细"],
    welcome: "告诉我一个时间周期（如「本月」「近 30 天」「2026 Q2」），我会立刻生成资金拨付看板与明细。",
  },
};

const TOPIC_ROUTE: Record<Topic, string> = {
  policies: "/direct-benefit/gov/policies",
  enterprises: "/direct-benefit/gov/entprofile",
  matches: "/direct-benefit/gov/matches",
  disburse: "/direct-benefit/gov/disburse",
};

// ---------- 卡片模型 ----------
type Card =
  | { kind: "policy-list"; ids: string[] }
  | { kind: "policy-compare"; ids: [string, string] }
  | { kind: "ent-list"; ids: string[] }
  | { kind: "ent-certificate"; entId: string }
  | { kind: "match-table"; ids: string[] }
  | { kind: "disburse-list"; ids: string[] }
  | { kind: "kpi-grid"; title?: string; cells: Array<{ label: string; value: string; tone?: "primary" | "success" | "warning" | "info" }> }
  | { kind: "group-bar"; title: string; rows: Array<{ label: string; value: number; tone?: "primary" | "success" | "warning" | "info" }> }
  | { kind: "action"; title: string; detail: string; confidence: number };

interface Msg {
  id: string;
  role: "user" | "agent";
  text?: string;
  cards?: Card[];
  time: string;
  hero?: boolean;
}

const NOW = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// ---------- 主组件 ----------
export function GovChatConsole({ topic }: { topic: Topic }) {
  const meta = TOPIC_META[topic];
  const navigate = useNavigate();
  const location = useLocation();
  const stateAny = location.state as { policyId?: string; query?: string } | null;
  const seedQuery = stateAny?.query;
  const initial = useMemo(() => buildInitial(topic), [topic]);

  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  useEffect(() => setMessages(buildInitial(topic)), [topic]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  useEffect(() => {
    if (seededRef.current) return;
    if (seedQuery) {
      seededRef.current = true;
      setTimeout(() => send(seedQuery), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedQuery]);

  const send = (text: string) => {
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text, time: NOW() }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = buildReply(topic, text);
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 650);
  };

  const HeaderIcon = meta.icon;

  return (
    <AppLayout hideHeader>
      <div className="grid h-[calc(100vh-7rem)] grid-cols-[240px_1fr] gap-4">
        {/* 左栏：会话历史 / 智能体能力 */}
        <aside className="flex flex-col gap-3 overflow-hidden">
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

          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="font-semibold text-foreground text-base">功能</div>
              <button className="text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <div className="px-1.5 py-1.5">
              <div className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-xs text-foreground">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                <span className="flex-1 truncate text-sm">{meta.title}</span>
              </div>
              {(["policies", "enterprises", "matches", "disburse"] as Topic[])
                .filter((t) => t !== topic)
                .map((t) => (
                  <button
                    key={t}
                    onClick={() => navigate(TOPIC_ROUTE[t])}
                    className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/40"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="flex-1 truncate text-left text-sm">{TOPIC_META[t].title}</span>
                  </button>
                ))}
              <button
                onClick={() => navigate("/direct-benefit/gov/all-policies")}
                className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/40"
              >
                <Compass className="h-3.5 w-3.5" />
                <span className="flex-1 truncate text-left text-sm">全部政策</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card">
            <div className="border-b border-border px-3 py-2 font-semibold text-foreground text-base">智能体可生成</div>
            <ul className="space-y-1.5 p-2.5 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-1.5 text-xs"><BarChart3 className="h-3 w-3 text-primary" />分组统计图表</li>
              <li className="flex items-center gap-1.5 text-xs"><Layers className="h-3 w-3 text-primary" />筛选明细清单</li>
              <li className="flex items-center gap-1.5 text-xs"><GitCompare className="h-3 w-3 text-primary" />多对象对比表</li>
              <li className="flex items-center gap-1.5 text-xs"><ShieldCheck className="h-3 w-3 text-primary" />数据确权证书</li>
              <li className="flex items-center gap-1.5 text-xs"><MapPin className="h-3 w-3 text-primary" />行政区/行业分布</li>
              <li className="flex items-center gap-1.5 text-xs"><TrendingUp className="h-3 w-3 text-primary" />Top-N 排行</li>
            </ul>
            <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
              所有结果均基于政府侧数据源即时生成，无需配置报表。
            </div>
          </div>
        </aside>

        {/* 主区：对话 */}
        <section className="flex min-h-0 flex-col rounded-lg border border-border bg-card">
          <div className="flex items-start gap-3 border-b border-border px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <HeaderIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-lg">{meta.title}</span>
                <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-[10px]">
                  <Activity className="mr-1 h-2.5 w-2.5" />即时生成
                </Badge>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{meta.subtitle}</div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4 py-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((m) => (
                <Bubble key={m.id} msg={m} navigate={navigate} />
              ))}
              {thinking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span className="inline-flex items-center gap-1">
                    智能体正在根据数据源生成结果
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

          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {meta.quicks.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] text-foreground transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <Wand2 className="h-2.5 w-2.5 text-primary" />{q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim()) return;
                send(input.trim());
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={meta.placeholder}
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

// ---------- Bubble & Renderers ----------
function Bubble({ msg, navigate }: { msg: Msg; navigate: ReturnType<typeof useNavigate> }) {
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
        {msg.cards?.map((c, i) => <CardView key={i} card={c} navigate={navigate} />)}
        <div className="font-mono text-[9px] text-muted-foreground">{msg.time}</div>
      </div>
    </div>
  );
}

function CardView({ card, navigate }: { card: Card; navigate: ReturnType<typeof useNavigate> }) {
  if (card.kind === "action") {
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

  if (card.kind === "policy-list") {
    return (
      <div className="space-y-1.5">
        {card.ids.map((id) => {
          const p = findPolicy(id);
          if (!p) return null;
          const ds = domainStyle[p.domain];
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
                  <span>{p.docNo}</span><span>·</span><span>{p.issuer}</span><span>·</span>
                  <span className="font-mono">{p.fundingMin}-{p.fundingMax} 万</span>
                  <span className={cn("ml-auto inline-flex items-center gap-1 rounded-full border px-1.5 py-0", ds.badge)}>
                    <span className={cn("h-1 w-1 rounded-full", ds.dot)} />{p.domain}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    );
  }

  if (card.kind === "policy-compare") {
    const [a, b] = card.ids.map((id) => findPolicy(id));
    if (!a || !b) return null;
    const rows: Array<{ k: string; a: string; b: string }> = [
      { k: "文号", a: a.docNo, b: b.docNo },
      { k: "发文机关", a: a.issuer, b: b.issuer },
      { k: "支持方向", a: a.domain, b: b.domain },
      { k: "资助区间", a: `${a.fundingMin}-${a.fundingMax} 万`, b: `${b.fundingMin}-${b.fundingMax} 万` },
      { k: "计算口径", a: a.fundingFormula, b: b.fundingFormula },
      { k: "条件数量", a: `${a.conditions.length} 条`, b: `${b.conditions.length} 条` },
      { k: "解析置信度", a: `${(a.parseConfidence * 100).toFixed(0)}%`, b: `${(b.parseConfidence * 100).toFixed(0)}%` },
    ];
    return (
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="w-24 px-2 py-1.5 text-left">维度</th>
              <th className="px-2 py-1.5 text-left">{a.id}</th>
              <th className="px-2 py-1.5 text-left">{b.id}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} className="border-t border-border">
                <td className="px-2 py-1.5 text-muted-foreground">{r.k}</td>
                <td className="px-2 py-1.5 text-foreground">{r.a}</td>
                <td className="px-2 py-1.5 text-foreground">{r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (card.kind === "ent-list") {
    return (
      <div className="space-y-1.5">
        {card.ids.map((id) => {
          const e = findEnterprise(id);
          if (!e) return null;
          const cert = getEntCertificate(id);
          return (
            <button
              key={id}
              onClick={() => navigate(`/direct-benefit/gov/entprofile/${id}`)}
              className="flex w-full items-start gap-2 rounded-md border border-border bg-card p-2.5 text-left transition hover:border-primary/40"
            >
              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-foreground line-clamp-1">{e.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{e.district}</span><span>·</span><span>{e.industry}</span>
                  {e.isKeyUnit && (
                    <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">重点用能</Badge>
                  )}
                  {cert && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-sm border border-[hsl(0_65%_35%/0.5)] bg-[hsl(45_60%_92%)] px-1.5 py-0 font-mono text-[10px] text-[hsl(0_70%_25%)]">
                      <ShieldCheck className="h-2.5 w-2.5" />{cert.id}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    );
  }

  if (card.kind === "ent-certificate") {
    const cert = getEntCertificate(card.entId);
    if (!cert) return null;
    return <DataCertificateMini certificate={cert} href={`/direct-benefit/gov/entprofile/${card.entId}`} />;
  }

  if (card.kind === "match-table") {
    return (
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 text-left">企业</th>
              <th className="px-2 py-1.5 text-left">政策</th>
              <th className="w-16 px-2 py-1.5 text-left">命中</th>
              <th className="w-20 px-2 py-1.5 text-left">置信度</th>
              <th className="w-20 px-2 py-1.5 text-left">金额</th>
              <th className="w-20 px-2 py-1.5 text-left">状态</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {card.ids.map((id) => {
              const m = matches.find((x) => x.id === id);
              if (!m) return null;
              const e = findEnterprise(m.enterpriseId);
              const p = findPolicy(m.policyId);
              const hit = m.hits.filter((h) => h.hit).length;
              const s = matchStatusStyle[m.status];
              return (
                <tr
                  key={id}
                  className="cursor-pointer border-t border-border hover:bg-muted/30"
                  onClick={() => navigate(`/direct-benefit/gov/matches/${id}`)}
                >
                  <td className="px-2 py-1.5 text-foreground">{e?.name}</td>
                  <td className="px-2 py-1.5 text-muted-foreground line-clamp-1">{p?.name}</td>
                  <td className="px-2 py-1.5 font-mono text-foreground">{hit}/{m.hits.length}</td>
                  <td className="px-2 py-1.5 font-mono text-foreground">{(m.confidence * 100).toFixed(0)}%</td>
                  <td className="px-2 py-1.5 font-mono font-semibold text-warning">{m.estimatedFunding} 万</td>
                  <td className="px-2 py-1.5">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[10px]", s.badge)}>
                      <span className={cn("h-1 w-1 rounded-full", s.dot)} />{m.status}
                    </span>
                  </td>
                  <td className="px-1"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (card.kind === "group-bar") {
    const max = Math.max(...card.rows.map((r) => r.value), 1);
    const tone = (t?: string) =>
      t === "success" ? "bg-success" : t === "warning" ? "bg-warning" : t === "info" ? "bg-info" : "bg-primary";
    return (
      <div className="rounded-md border border-border bg-card p-3">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">{card.title}</span>
          <span className="ml-auto text-[10px] text-muted-foreground">智能体即时聚合 · {card.rows.length} 组</span>
        </div>
        <div className="space-y-1.5">
          {card.rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
              <span className="text-[11px] text-foreground">{r.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", tone(r.tone))} style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
              <span className="text-right font-mono text-[11px] text-foreground">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (card.kind === "kpi-grid") {
    const toneCls = (t?: string) =>
      t === "success" ? "text-success" : t === "warning" ? "text-warning" : t === "info" ? "text-info" : "text-primary";
    return (
      <div className="rounded-md border border-border bg-card p-3">
        {card.title && (
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">{card.title}</span>
            <span className="ml-auto text-[10px] text-muted-foreground">智能体按所选周期聚合</span>
          </div>
        )}
        <div className={cn("grid gap-2", card.cells.length >= 4 ? "grid-cols-4" : "grid-cols-3")}>
          {card.cells.map((c) => (
            <div key={c.label} className="rounded-md bg-muted/30 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{c.label}</div>
              <div className={cn("mt-0.5 font-mono text-base font-semibold", toneCls(c.tone))}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>
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
                  {d.certificateId && (<><span>·</span><span className="font-mono">证书 {d.certificateId}</span></>)}
                </div>
              </div>
              <span className="font-mono text-sm font-semibold text-warning">{d.amount} 万</span>
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}

// ---------- 初始对话脚本 ----------
function buildInitial(topic: Topic): Msg[] {
  const t = NOW();
  if (topic === "policies") {
    return [
      {
        id: "p1", role: "agent", time: t,
        text: "您好，这里是「政策图谱」对话工作台。我已抓取并解析全市最新政策，您可以直接用自然语言提问，无需操作报表。下方是今早采集的快速概览：",
        cards: [
          { kind: "action", title: "今日新增政策 3 项", confidence: 0.94, detail: "来自市经信委、市发改委、浦东发改委；结构化解析平均置信度 92%。" },
          { kind: "policy-list", ids: policies.slice(0, 3).map((p) => p.id) },
          {
            kind: "group-bar",
            title: "按支持方向分组",
            rows: groupBy(policies, (p) => p.domain).map(([k, v], i) => ({
              label: k, value: v.length, tone: (["primary", "info", "warning"] as const)[i % 3],
            })),
          },
        ],
      },
    ];
  }
  if (topic === "enterprises") {
    return [
      {
        id: "e1", role: "agent", time: t,
        text: "您好，这里是「企业画像」对话工作台。智能体已为入库企业生成画像与数据确权证书，您可以直接问「按行政区分布」「重点用能企业」「某企业的证书」等。下面是默认全景：",
        cards: [
          {
            kind: "group-bar",
            title: "按行政区企业画像数量",
            rows: groupBy(enterprises, (e) => e.district).map(([k, v]) => ({
              label: k, value: v.length, tone: "primary" as const,
            })),
          },
          { kind: "ent-list", ids: enterprises.map((e) => e.id) },
        ],
      },
      {
        id: "e2", role: "agent", time: t,
        text: "如需查看任意企业的数据确权证书，可直接点击企业进入详情；以下是示例：",
        cards: [{ kind: "ent-certificate", entId: enterprises[0].id }],
      },
    ];
  }
  if (topic === "matches") {
    return [
      {
        id: "m1", role: "agent", time: t,
        text: "您好，这里是「撮合名单」对话工作台。我已基于企业数据确权证书与政策条件生成本期撮合。您可以直接说「高置信」「按状态分布」「金额 Top N」等。下面是默认快照：",
        cards: [
          {
            kind: "group-bar",
            title: "撮合按状态分布",
            rows: groupBy(matches, (m) => m.status).map(([k, v]) => ({
              label: k, value: v.length,
              tone: k === "已拨付" ? "success" : k === "已驳回" ? "warning" : "primary",
            })),
          },
          { kind: "match-table", ids: matches.slice(0, 5).map((m) => m.id) },
        ],
      },
    ];
  }
  // disburse
  const period = resolvePeriod("本月");
  return [
    {
      id: "d1", role: "agent", time: t,
      text: `您好，这里是「资金拨付」对话工作台。告诉我一个时间周期（如「本月」「近 30 天」「2026 年 5 月」「Q2」），我会立刻生成资金拨付看板。下方默认展示 ${period.label}：`,
      cards: buildDisburseDashboard(period.label, period.filter),
    },
  ];
}

// ---------- 自然语言回复（关键字匹配，模拟意图） ----------
function buildReply(topic: Topic, text: string): Msg {
  const t = NOW();
  const id = `a-${Date.now()}`;
  const lower = text.toLowerCase();

  // 通用：证书
  if (text.includes("证书") || text.includes("确权")) {
    const ent = enterprises.find((e) => text.includes(e.id)) ?? enterprises[0];
    return { id, role: "agent", time: t, text: `已为您调出 ${ent.name} 的数据确权证书：`, cards: [{ kind: "ent-certificate", entId: ent.id }] };
  }

  if (topic === "policies") {
    if (text.includes("对比") || text.includes("compare")) {
      return { id, role: "agent", time: t, text: "为您即时生成两项政策的对比表：", cards: [{ kind: "policy-compare", ids: [policies[0].id, policies[1].id] }] };
    }
    if (text.includes("分组") || text.includes("统计") || text.includes("分布")) {
      const groups = groupBy(policies, (p) => p.issuer);
      return {
        id, role: "agent", time: t,
        text: "按发文机关聚合如下（点击图条可下钻）：",
        cards: [{
          kind: "group-bar", title: "按发文机关统计政策",
          rows: groups.map(([k, v]) => ({ label: k, value: v.length, tone: "primary" as const })),
        }],
      };
    }
    if (text.includes("置信") || text.includes("低")) {
      const sorted = [...policies].sort((a, b) => a.parseConfidence - b.parseConfidence);
      return {
        id, role: "agent", time: t,
        text: "解析置信度最低的政策（建议人工复核条件结构化结果）：",
        cards: [{ kind: "policy-list", ids: sorted.slice(0, 2).map((p) => p.id) }],
      };
    }
    if (text.includes("新增") || text.includes("今天") || text.includes("今日")) {
      return {
        id, role: "agent", time: t,
        text: "今日通过政策渠道抓取的新增政策如下：",
        cards: [{ kind: "policy-list", ids: policies.slice(0, 3).map((p) => p.id) }],
      };
    }
    return {
      id, role: "agent", time: t,
      text: "已列出全部政策。您还可以尝试：「按支持方向分组」「对比 P-2025-001 和 P-2025-002」「解析置信度最低的政策」。",
      cards: [{ kind: "policy-list", ids: policies.map((p) => p.id) }],
    };
  }

  if (topic === "enterprises") {
    if (text.includes("重点") || text.includes("用能")) {
      const ids = enterprises.filter((e) => e.isKeyUnit).map((e) => e.id);
      return { id, role: "agent", time: t, text: `共筛出 ${ids.length} 家重点用能单位：`, cards: [{ kind: "ent-list", ids }] };
    }
    if (text.includes("行政区") || text.includes("区域") || text.includes("分布")) {
      const groups = groupBy(enterprises, (e) => e.district);
      return {
        id, role: "agent", time: t,
        text: "按行政区聚合：",
        cards: [{ kind: "group-bar", title: "按行政区企业数量", rows: groups.map(([k, v]) => ({ label: k, value: v.length })) }],
      };
    }
    if (text.includes("行业")) {
      const groups = groupBy(enterprises, (e) => e.industry);
      return {
        id, role: "agent", time: t,
        text: "按所属行业聚合：",
        cards: [{ kind: "group-bar", title: "按行业企业数量", rows: groups.map(([k, v]) => ({ label: k, value: v.length, tone: "info" as const })) }],
      };
    }
    if (text.includes("完整") || text.includes("缺")) {
      const ids = enterprises.filter((e) => e.profile.length < 7).map((e) => e.id);
      return { id, role: "agent", time: t, text: `画像维度未达 7 项的企业共 ${ids.length} 家：`, cards: [{ kind: "ent-list", ids }] };
    }
    // 命中具体企业
    const hit = enterprises.find((e) => text.includes(e.name) || text.includes(e.id));
    if (hit) {
      return {
        id, role: "agent", time: t,
        text: `${hit.name} 的画像与数据确权证书：`,
        cards: [{ kind: "ent-list", ids: [hit.id] }, { kind: "ent-certificate", entId: hit.id }],
      };
    }
    return {
      id, role: "agent", time: t,
      text: "已列出全部企业画像。可继续问：「重点用能企业」「按行政区分布」「行业聚合」「E001 的证书」等。",
      cards: [{ kind: "ent-list", ids: enterprises.map((e) => e.id) }],
    };
  }

  if (topic === "matches") {
    if (text.includes("高置信") || text.includes("置信")) {
      const ids = matches.filter((m) => m.confidence >= 0.9).map((m) => m.id);
      return {
        id, role: "agent", time: t,
        text: `本期置信度 ≥ 90% 的撮合共 ${ids.length} 条，建议优先公示：`,
        cards: [
          { kind: "action", title: "高置信撮合", confidence: 0.95, detail: "条件命中证据均来自数据确权证书，可直接进入公示流程。" },
          { kind: "match-table", ids },
        ],
      };
    }
    if (text.includes("状态") || text.includes("分布") || text.includes("漏斗")) {
      const groups = groupBy(matches, (m) => m.status);
      return {
        id, role: "agent", time: t,
        text: "撮合按状态聚合：",
        cards: [{
          kind: "group-bar", title: "撮合状态分布",
          rows: groups.map(([k, v]) => ({ label: k, value: v.length, tone: k === "已拨付" ? "success" as const : "primary" as const })),
        }],
      };
    }
    if (text.includes("top") || text.includes("金额") || text.includes("最高")) {
      const ids = [...matches].sort((a, b) => b.estimatedFunding - a.estimatedFunding).slice(0, 5).map((m) => m.id);
      return { id, role: "agent", time: t, text: "估算金额 Top 5 的撮合：", cards: [{ kind: "match-table", ids }] };
    }
    if (text.includes("待公示")) {
      const ids = matches.filter((m) => m.status === "待公示").map((m) => m.id);
      return { id, role: "agent", time: t, text: `待公示的撮合共 ${ids.length} 条：`, cards: [{ kind: "match-table", ids }] };
    }
    const hit = enterprises.find((e) => text.includes(e.name) || text.includes(e.id));
    if (hit) {
      const ids = matches.filter((m) => m.enterpriseId === hit.id).map((m) => m.id);
      return { id, role: "agent", time: t, text: `${hit.name} 的全部撮合记录（${ids.length} 条）：`, cards: [{ kind: "match-table", ids }] };
    }
    return {
      id, role: "agent", time: t,
      text: "已列出全部撮合。可继续问：「高置信撮合」「金额 Top 5」「待公示」「按状态分布」「<企业名> 的撮合」。",
      cards: [{ kind: "match-table", ids: matches.map((m) => m.id) }],
    };
  }

  // disburse topic
  const period = resolvePeriod(text);
  if (text.includes("阶段") || text.includes("漏斗") || text.includes("状态")) {
    const filtered = disbursements.filter(period.filter);
    return {
      id, role: "agent", time: t,
      text: `${period.label}的资金拨付阶段漏斗（共 ${filtered.length} 笔）：`,
      cards: [{
        kind: "group-bar", title: `${period.label} · 按阶段笔数`,
        rows: groupBy(filtered, (d) => d.stage).map(([k, v]) => ({
          label: k, value: v.length,
          tone: k === "已到账" ? "success" : k === "财政划拨中" ? "warning" : "info",
        })),
      }],
    };
  }
  if (text.includes("行政区") || text.includes("区域") || text.includes("分布")) {
    const filtered = disbursements.filter(period.filter);
    const rows = groupBy(filtered, (d) => findEnterprise(d.enterpriseId)?.district ?? "未知")
      .map(([k, v]) => ({ label: k, value: v.reduce((s, d) => s + d.amount, 0), tone: "primary" as const }));
    return {
      id, role: "agent", time: t,
      text: `${period.label}按行政区拨付金额（万元）：`,
      cards: [{ kind: "group-bar", title: `${period.label} · 按行政区拨付金额`, rows }],
    };
  }
  if (text.includes("政策") || text.includes("汇总")) {
    const filtered = disbursements.filter(period.filter);
    const rows = groupBy(filtered, (d) => findPolicy(d.policyId)?.name ?? d.policyId)
      .map(([k, v]) => ({ label: k.length > 12 ? k.slice(0, 12) + "…" : k, value: v.reduce((s, d) => s + d.amount, 0), tone: "info" as const }));
    return {
      id, role: "agent", time: t,
      text: `${period.label}按政策汇总拨付金额（万元）：`,
      cards: [{ kind: "group-bar", title: `${period.label} · 按政策拨付金额`, rows }],
    };
  }
  if (text.includes("已到账") || text.includes("到账明细")) {
    const ids = disbursements.filter(period.filter).filter((d) => d.stage === "已到账").map((d) => d.id);
    return { id, role: "agent", time: t, text: `${period.label}已到账明细共 ${ids.length} 笔：`, cards: [{ kind: "disburse-list", ids }] };
  }
  if (text.includes("top") || text.includes("最大") || text.includes("最高")) {
    const ids = [...disbursements].filter(period.filter).sort((a, b) => b.amount - a.amount).slice(0, 5).map((d) => d.id);
    return { id, role: "agent", time: t, text: `${period.label}金额 Top 5 拨付：`, cards: [{ kind: "disburse-list", ids }] };
  }
  return {
    id, role: "agent", time: t,
    text: `已为您生成 ${period.label} 的资金拨付看板，可继续追问：「按阶段漏斗」「按行政区分布」「按政策汇总」「已到账明细」「金额 Top 5」。`,
    cards: buildDisburseDashboard(period.label, period.filter),
  };
}

// ---------- 资金拨付：时间周期与看板 ----------
interface PeriodSpec { label: string; filter: (d: Disbursement) => boolean }

function resolvePeriod(text: string): PeriodSpec {
  // 锚定 mock 数据时间：2026-05
  const ANCHOR = new Date("2026-05-18");
  const parseTime = (d: Disbursement) => new Date(d.timeline[d.timeline.length - 1].time.replace(" ", "T"));

  // 2026 年 X 月
  const ym = text.match(/(20\d{2})\s*年\s*(\d{1,2})\s*月/);
  if (ym) {
    const y = +ym[1], m = +ym[2];
    return {
      label: `${y} 年 ${m} 月`,
      filter: (d) => { const dt = parseTime(d); return dt.getFullYear() === y && dt.getMonth() + 1 === m; },
    };
  }
  // 第 N 季度 / QN
  const q = text.match(/(?:Q|q|第)\s*([1-4])\s*季?度?/);
  if (q) {
    const qi = +q[1];
    return {
      label: `2026 Q${qi}`,
      filter: (d) => { const dt = parseTime(d); return dt.getFullYear() === 2026 && Math.floor(dt.getMonth() / 3) + 1 === qi; },
    };
  }
  // 近 N 天
  const lastN = text.match(/近\s*(\d{1,3})\s*天/);
  if (lastN) {
    const days = +lastN[1];
    const start = new Date(ANCHOR); start.setDate(start.getDate() - days);
    return { label: `近 ${days} 天`, filter: (d) => parseTime(d) >= start && parseTime(d) <= ANCHOR };
  }
  if (text.includes("今年") || text.includes("本年")) {
    return { label: "2026 年", filter: (d) => parseTime(d).getFullYear() === 2026 };
  }
  if (text.includes("本周") || text.includes("这周")) {
    const start = new Date(ANCHOR); start.setDate(start.getDate() - 7);
    return { label: "本周", filter: (d) => parseTime(d) >= start && parseTime(d) <= ANCHOR };
  }
  if (text.includes("上月")) {
    return { label: "2026 年 4 月", filter: (d) => { const dt = parseTime(d); return dt.getFullYear() === 2026 && dt.getMonth() + 1 === 4; } };
  }
  // 默认：本月（2026-05）
  return { label: "本月（2026 年 5 月）", filter: (d) => { const dt = parseTime(d); return dt.getFullYear() === 2026 && dt.getMonth() + 1 === 5; } };
}

function buildDisburseDashboard(label: string, filter: (d: Disbursement) => boolean): Card[] {
  const list = disbursements.filter(filter);
  const total = list.reduce((s, d) => s + d.amount, 0);
  const arrived = list.filter((d) => d.stage === "已到账");
  const arrivedAmt = arrived.reduce((s, d) => s + d.amount, 0);
  const inflight = list.filter((d) => d.stage === "财政划拨中");
  return [
    {
      kind: "kpi-grid", title: `${label} · 资金拨付看板`,
      cells: [
        { label: "拨付笔数", value: `${list.length}`, tone: "primary" },
        { label: "拨付总额", value: `${total} 万`, tone: "info" },
        { label: "已到账", value: `${arrivedAmt} 万`, tone: "success" },
        { label: "在途", value: `${inflight.length} 笔`, tone: "warning" },
      ],
    },
    {
      kind: "group-bar", title: `${label} · 按阶段笔数`,
      rows: groupBy(list, (d) => d.stage).map(([k, v]) => ({
        label: k, value: v.length,
        tone: k === "已到账" ? "success" as const : k === "财政划拨中" ? "warning" as const : "info" as const,
      })),
    },
    { kind: "disburse-list", ids: list.map((d) => d.id) },
  ];
}

function groupBy<T>(arr: T[], key: (x: T) => string): Array<[string, T[]]> {
  const map = new Map<string, T[]>();
  arr.forEach((x) => {
    const k = key(x);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(x);
  });
  return Array.from(map.entries());
}
