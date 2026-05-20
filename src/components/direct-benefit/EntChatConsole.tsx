import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Brain, Send, Sparkles, Activity, Plus, FileSearch, Wallet, Star,
  ChevronRight, MessageSquare, BarChart3, ShieldCheck, Wand2, CheckCircle2,
  CircleDollarSign, Layers, TrendingUp, MapPin, Compass,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  policies, matches, disbursements, findPolicy,
  getEntMatches, getEntDisbursements, getEntCertificate,
  matchStatusStyle, domainStyle, CURRENT_ENTERPRISE_ID,
} from "@/components/direct-benefit/directBenefitData";
import { DataCertificateMini } from "@/components/direct-benefit/DataCertificateMini";
import { ChatHero } from "@/components/direct-benefit/ChatHero";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

export type EntTopic = "my-policies" | "my-funds" | "policy-chat";

const TOPIC_META: Record<EntTopic, {
  title: string;
  subtitle: string;
  icon: typeof FileSearch;
  placeholder: string;
  quicks: string[];
  heroSuggestions: string[];
}> = {
  "my-policies": {
    title: "我的专属政策",
    subtitle: "用一句话和智能体对话，自动匹配适用政策、收藏夹、命中条件与申领指引。",
    icon: FileSearch,
    placeholder: "例如：我现在能申请哪些？我收藏了哪些？解读 P-2025-001…",
    quicks: ["我能申请哪些政策", "我的收藏", "命中度最高的政策", "申报指引"],
    heroSuggestions: ["我能申请哪些政策？", "我收藏了哪些？", "命中度最高的政策是哪条？", "下一步如何申报？"],
  },
  "my-funds": {
    title: "资金到账",
    subtitle: "直接告诉智能体一个时间段，立即生成我的资金到账看板、阶段进度和凭证清单。",
    icon: CircleDollarSign,
    placeholder: "例如：本月我到账了多少？查看所有凭证；近 30 天的拨付进度…",
    quicks: ["本月到账情况", "所有拨付凭证", "在途资金", "按政策汇总"],
    heroSuggestions: ["本月我到账了多少？", "在途的资金有哪些？", "我有几张拨付凭证？", "按政策汇总我的到账"],
  },
  "policy-chat": {
    title: "政策智能解读",
    subtitle: "对单条政策的解读、申领条件分析、申报指引，全部由智能体即时生成。",
    icon: Sparkles,
    placeholder: "例如：解读该政策；我是否符合申领条件；申报指引…",
    quicks: ["解读该政策", "申领条件", "申报指引", "是否建议我申领"],
    heroSuggestions: ["解读该政策", "申领条件", "申报指引", "是否建议我申领"],
  },
};

type Card =
  | { kind: "policy-list"; ids: string[]; showFav?: boolean }
  | { kind: "policy-detail"; id: string }
  | { kind: "match-table"; ids: string[] }
  | { kind: "disburse-list"; ids: string[] }
  | { kind: "ent-certificate"; entId: string }
  | { kind: "kpi-grid"; title?: string; cells: Array<{ label: string; value: string; tone?: "primary" | "success" | "warning" | "info" }> }
  | { kind: "group-bar"; title: string; rows: Array<{ label: string; value: number; tone?: "primary" | "success" | "warning" | "info" }> }
  | { kind: "advice"; verdict: "recommend" | "caution" | "skip"; reasons: string[]; nextSteps: string[] }
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

const ROUTE: Record<EntTopic, string> = {
  "my-policies": "/direct-benefit/ent",
  "my-funds": "/direct-benefit/ent/funds",
  "policy-chat": "/direct-benefit/ent/policy-chat",
};

// ---------- 主组件 ----------
export function EntChatConsole({ topic, initialPolicyId, initialQuery }: { topic: EntTopic; initialPolicyId?: string; initialQuery?: string }) {
  const meta = TOPIC_META[topic];
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();

  const stateAny = location.state as { policyId?: string; query?: string } | null;
  const policyId = initialPolicyId ?? stateAny?.policyId;
  const seedQuery = initialQuery ?? stateAny?.query;

  const initial = useMemo(() => buildInitial(topic, favorites, policyId), [topic, policyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  useEffect(() => setMessages(buildInitial(topic, favorites, policyId)), [topic, policyId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  // 自动发送预置问题（来自 FAB）
  useEffect(() => {
    if (seededRef.current) return;
    if (seedQuery) {
      seededRef.current = true;
      setTimeout(() => send(seedQuery), 400);
    }
  }, [seedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = (text: string) => {
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text, time: NOW() }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = buildReply(topic, text, favorites, policyId);
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 600);
  };

  const HeaderIcon = meta.icon;

  return (
    <AppLayout hideHeader>
      <div className="grid h-[calc(100vh-7rem)] grid-cols-[240px_1fr] gap-4">
        {/* 左栏 */}
        <aside className="flex flex-col gap-3 overflow-hidden">
          <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-3">
            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/20 blur-2xl" />
            <div className="relative flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info text-primary-foreground shadow-md shadow-primary/30">
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
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="font-semibold text-foreground text-base">功能</div>
              <button className="text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <div className="px-1.5 py-1.5">
              {(["my-policies", "my-funds"] as EntTopic[]).map((t) => {
                const m = TOPIC_META[t];
                const active = t === topic;
                const Icon = t === "my-policies" ? FileSearch : Wallet;
                return (
                  <button
                    key={t}
                    onClick={() => active ? null : navigate(ROUTE[t])}
                    className={cn(
                      "mt-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                      active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", active && "text-primary")} />
                    <span className="flex-1 truncate text-left text-sm">{m.title}</span>
                  </button>
                );
              })}
              <button
                onClick={() => navigate("/direct-benefit/ent/all-policies")}
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
              <li className="flex items-center gap-1.5 text-xs"><Layers className="h-3 w-3 text-primary" />适用政策清单</li>
              <li className="flex items-center gap-1.5 text-xs"><Star className="h-3 w-3 text-primary" />我的收藏夹</li>
              <li className="flex items-center gap-1.5 text-xs"><Sparkles className="h-3 w-3 text-primary" />单条政策深度解读</li>
              <li className="flex items-center gap-1.5 text-xs"><ShieldCheck className="h-3 w-3 text-primary" />数据确权证书</li>
              <li className="flex items-center gap-1.5 text-xs"><TrendingUp className="h-3 w-3 text-primary" />到账看板与趋势</li>
              <li className="flex items-center gap-1.5 text-xs"><CheckCircle2 className="h-3 w-3 text-primary" />申领建议</li>
            </ul>
            <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
              基于您的数据确权证书与企业画像实时生成。
            </div>
          </div>
        </aside>

        {/* 主区 */}
        <section className="relative flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
          {/* 背景光晕 */}
          <div className="pointer-events-none absolute -top-24 right-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 -left-10 h-48 w-48 rounded-full bg-info/10 blur-3xl" />

          <div className="relative flex items-start gap-3 border-b border-border px-4 py-3 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-info/20 text-primary">
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

          <ScrollArea className="relative flex-1 px-4 py-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((m) => (
                m.hero ? (
                  <ChatHero
                    key={m.id}
                    title={meta.title}
                    subtitle={m.text ?? meta.subtitle}
                    suggestions={meta.heroSuggestions}
                    onPick={(s) => send(s)}
                  />
                ) : (
                  <Bubble key={m.id} msg={m} navigate={navigate} />
                )
              ))}
              {thinking && <Thinking />}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="relative border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {meta.quicks.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-0.5 text-[11px] text-foreground backdrop-blur transition hover:border-primary/40 hover:bg-primary/5"
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
              <Button type="submit" size="sm" className="h-10 px-3 bg-gradient-to-br from-primary to-info" disabled={!input.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
        <span className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse" />
        <Brain className="relative h-3.5 w-3.5 text-primary" />
      </span>
      <span className="inline-flex items-center gap-1">
        智能体正在生成
        <span className="inline-flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: `${i * 120}ms` }} />
          ))}
        </span>
      </span>
    </div>
  );
}

// ---------- 气泡 ----------
function Bubble({ msg, navigate }: { msg: Msg; navigate: ReturnType<typeof useNavigate> }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-lg rounded-tr-sm bg-gradient-to-br from-primary to-info px-3 py-2 text-xs text-primary-foreground shadow-sm shadow-primary/20">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <span className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
        <span className="absolute inset-0 rounded-full bg-primary/25 blur-sm" />
        <Brain className="relative h-3.5 w-3.5 text-primary" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        {msg.text && (
          <div className="inline-block max-w-full rounded-lg rounded-tl-sm border border-border/50 bg-card/80 px-3 py-2 text-xs leading-relaxed text-foreground backdrop-blur">
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
  const { has, toggle } = useFavorites();

  if (card.kind === "action") {
    return (
      <div className="rounded-md border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-2.5">
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

  if (card.kind === "advice") {
    const verdict = card.verdict;
    const cfg = verdict === "recommend"
      ? { label: "建议申领", cls: "border-success/40 bg-success/10 text-success", icon: CheckCircle2 }
      : verdict === "caution"
      ? { label: "可申领（需补充）", cls: "border-warning/40 bg-warning/10 text-warning", icon: Sparkles }
      : { label: "暂不建议申领", cls: "border-muted-foreground/40 bg-muted/30 text-muted-foreground", icon: Sparkles };
    const Icon = cfg.icon;
    return (
      <div className="rounded-md border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-info/[0.04] p-3">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", cfg.cls)}>
            <Icon className="h-3 w-3" />{cfg.label}
          </span>
          <span className="text-[10px] text-muted-foreground">智能体综合企业画像 + 数据确权证书生成</span>
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">关键依据</div>
            <ul className="space-y-1">
              {card.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />{r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">建议步骤</div>
            <ol className="space-y-1">
              {card.nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-info text-[9px] font-semibold text-primary-foreground">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
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
          </div>
        )}
        <div className={cn("grid gap-2", card.cells.length >= 4 ? "grid-cols-4" : "grid-cols-3")}>
          {card.cells.map((c) => (
            <div key={c.label} className="relative overflow-hidden rounded-md bg-gradient-to-br from-muted/40 to-muted/10 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{c.label}</div>
              <div className={cn("mt-0.5 font-mono text-base font-semibold", toneCls(c.tone))}>{c.value}</div>
            </div>
          ))}
        </div>
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
        </div>
        <div className="space-y-1.5">
          {card.rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[100px_1fr_50px] items-center gap-2">
              <span className="text-[11px] text-foreground line-clamp-1">{r.label}</span>
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

  if (card.kind === "policy-list") {
    if (card.ids.length === 0) {
      return (
        <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
          <Star className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
          暂无收藏。可去「全部政策」收藏感兴趣的政策。
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/direct-benefit/ent/all-policies")}>
              <Compass className="mr-1 h-3.5 w-3.5" />去发现
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-1.5">
        {card.ids.map((id) => {
          const p = findPolicy(id);
          if (!p) return null;
          const ds = domainStyle[p.domain];
          const fav = has(p.id);
          return (
            <div
              key={id}
              className="group flex w-full items-start gap-2 rounded-md border border-border bg-card p-2.5 transition hover:border-primary/40"
            >
              <FileSearch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <button
                onClick={() => navigate(`/direct-benefit/ent/policy-chat`, { state: { policyId: p.id } })}
                className="min-w-0 flex-1 text-left"
              >
                <div className="text-xs font-medium text-foreground line-clamp-1">{p.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{p.docNo}</span><span>·</span>
                  <span className="font-mono">{p.fundingMin}-{p.fundingMax} 万</span>
                  <span className={cn("ml-auto inline-flex items-center gap-1 rounded-full border px-1.5 py-0", ds.badge)}>
                    <span className={cn("h-1 w-1 rounded-full", ds.dot)} />{p.domain}
                  </span>
                </div>
              </button>
              <button
                onClick={() => toggle(p.id)}
                aria-label={fav ? "取消收藏" : "收藏"}
                className={cn(
                  "rounded p-1 transition",
                  fav ? "text-warning" : "text-muted-foreground hover:text-warning",
                )}
              >
                <Star className={cn("h-3.5 w-3.5", fav && "fill-warning")} />
              </button>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          );
        })}
      </div>
    );
  }

  if (card.kind === "policy-detail") {
    const p = findPolicy(card.id);
    if (!p) return null;
    const ds = domainStyle[p.domain];
    const fav = has(p.id);
    return (
      <div className="overflow-hidden rounded-md border border-primary/30 bg-gradient-to-br from-primary/[0.05] to-info/[0.05]">
        <div className="border-b border-primary/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[10px]", ds.badge)}>
              <span className={cn("h-1 w-1 rounded-full", ds.dot)} />{p.domain}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{p.docNo}</span>
            <button
              onClick={() => toggle(p.id)}
              className={cn("ml-auto rounded p-1", fav ? "text-warning" : "text-muted-foreground hover:text-warning")}
            >
              <Star className={cn("h-3.5 w-3.5", fav && "fill-warning")} />
            </button>
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">{p.name}</div>
        </div>
        <div className="space-y-1 px-3 py-2 text-[11px]">
          <div className="text-muted-foreground">资助：<span className="font-mono text-foreground">{p.fundingMin}-{p.fundingMax} 万</span> · {p.fundingFormula}</div>
          <div className="text-muted-foreground">截止：<span className="text-foreground">{p.deadline}</span></div>
          <div className="text-foreground">{p.summary}</div>
        </div>
      </div>
    );
  }

  if (card.kind === "match-table") {
    return (
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
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
              const p = findPolicy(m.policyId);
              const hit = m.hits.filter((h) => h.hit).length;
              const s = matchStatusStyle[m.status];
              return (
                <tr
                  key={id}
                  className="cursor-pointer border-t border-border hover:bg-muted/30"
                  onClick={() => navigate(`/direct-benefit/ent/claim/${m.id}`)}
                >
                  <td className="px-2 py-1.5 text-foreground line-clamp-1">{p?.name}</td>
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

  if (card.kind === "disburse-list") {
    if (card.ids.length === 0) {
      return (
        <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
          所选时间段内暂无拨付记录。
        </div>
      );
    }
    return (
      <div className="space-y-1.5">
        {card.ids.map((id) => {
          const d = disbursements.find((x) => x.id === id);
          if (!d) return null;
          const p = findPolicy(d.policyId);
          const stageColor = d.stage === "已到账" ? "text-success" : d.stage === "财政划拨中" ? "text-warning" : "text-info";
          return (
            <button
              key={id}
              onClick={() => navigate("/direct-benefit/ent/funds")}
              className="flex w-full items-center gap-3 rounded-md border border-border bg-card p-2.5 text-left transition hover:border-primary/40"
            >
              <Wallet className="h-4 w-4 shrink-0 text-warning" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-foreground line-clamp-1">{p?.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className={cn("font-medium", stageColor)}>{d.stage}</span>
                  <span>·</span>
                  <span className="font-mono">{d.timeline[d.timeline.length - 1].time}</span>
                  {d.certificateId && (<><span>·</span><span className="font-mono">凭证 {d.certificateId}</span></>)}
                </div>
              </div>
              <span className="font-mono text-sm font-semibold text-warning">{d.amount} 万</span>
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

  return null;
}

// ---------- 初始 ----------
function buildInitial(topic: EntTopic, favorites: string[], policyId?: string): Msg[] {
  const t = NOW();
  if (topic === "policy-chat") {
    const p = policyId ? findPolicy(policyId) : null;
    if (p) {
      return [
        { id: "h", role: "agent", time: t, hero: true, text: `我已加载政策《${p.name}》，可以问我「解读」「申领条件」「申报指引」「是否建议我申领」。` },
        { id: "p1", role: "agent", time: t, cards: [{ kind: "policy-detail", id: p.id }] },
      ];
    }
    return [
      { id: "h", role: "agent", time: t, hero: true, text: "选择一条政策开始解读，或直接提问。" },
    ];
  }
  if (topic === "my-funds") {
    return [
      { id: "h", role: "agent", time: t, hero: true, text: "随问随答 — 试试「本月到账」「在途资金」「所有凭证」「按政策汇总」。" },
    ];
  }
  // my-policies
  const ms = getEntMatches(CURRENT_ENTERPRISE_ID);
  return [
    { id: "h", role: "agent", time: t, hero: true, text: `您好！基于您的数据确权证书与画像，我已为您匹配 ${ms.length} 项适用政策${favorites.length ? `，并保留了 ${favorites.length} 项收藏` : ""}。试试「我能申请哪些」「我的收藏」「命中度最高的政策」。` },
  ];
}

// ---------- 回复 ----------
function buildReply(topic: EntTopic, text: string, favorites: string[], policyId?: string): Msg {
  const t = NOW();
  const id = `a-${Date.now()}`;

  // 单条政策对话
  if (topic === "policy-chat") {
    const p = policyId ? findPolicy(policyId) : policies[0];
    if (!p) return { id, role: "agent", time: t, text: "未选择政策。" };
    const myMatch = getEntMatches(CURRENT_ENTERPRISE_ID).find((m) => m.policyId === p.id);
    if (text.includes("建议") || text.includes("是否")) {
      const verdict = myMatch && myMatch.confidence >= 0.85
        ? "recommend" : myMatch ? "caution" : "skip";
      return {
        id, role: "agent", time: t,
        text: `针对《${p.name}》的申领建议：`,
        cards: [{
          kind: "advice",
          verdict,
          reasons: myMatch
            ? [
                `匹配置信度 ${(myMatch.confidence * 100).toFixed(0)}%`,
                `命中条件 ${myMatch.hits.filter((h) => h.hit).length}/${myMatch.hits.length}`,
                `预估金额 ${myMatch.estimatedFunding} 万`,
              ]
            : ["当前数据确权证书中未发现满足核心条件的字段", "建议先完善企业画像后再评估"],
          nextSteps: verdict === "recommend"
            ? ["确认银行收款账户信息", "点击「一键确认申领」", "等待财政直达到账"]
            : verdict === "caution"
            ? ["补全缺失的数据字段", "等待画像完整度提升后再次匹配", "如有疑问，可咨询智能体"]
            : ["完善企业基础画像", "关注同方向其它政策", "可先收藏，待条件具备后再申领"],
        }],
      };
    }
    if (text.includes("申领") || text.includes("条件")) {
      return {
        id, role: "agent", time: t,
        text: `《${p.name}》的申领条件 — 命中情况已结合您的数据确权证书自动核验：`,
        cards: [{ kind: "policy-detail", id: p.id }, ...(myMatch ? [{ kind: "match-table" as const, ids: [myMatch.id] }] : [])],
      };
    }
    if (text.includes("指引") || text.includes("步骤") || text.includes("申报")) {
      return {
        id, role: "agent", time: t,
        text: `申报指引（共 ${p.guideSteps.length} 步）：\n${p.guideSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
        cards: [{ kind: "policy-detail", id: p.id }],
      };
    }
    // 解读
    return {
      id, role: "agent", time: t,
      text: `政策解读：${p.summary} 资助口径：${p.fundingFormula}，单户区间 ${p.fundingMin}-${p.fundingMax} 万元，截止 ${p.deadline}。`,
      cards: [{ kind: "policy-detail", id: p.id }],
    };
  }

  // my-policies
  if (topic === "my-policies") {
    if (text.includes("收藏")) {
      return { id, role: "agent", time: t, text: `您当前收藏了 ${favorites.length} 项政策：`, cards: [{ kind: "policy-list", ids: favorites, showFav: true }] };
    }
    if (text.includes("证书") || text.includes("确权")) {
      return { id, role: "agent", time: t, text: "您的数据确权证书：", cards: [{ kind: "ent-certificate", entId: CURRENT_ENTERPRISE_ID }] };
    }
    if (text.includes("申报") || text.includes("指引") || text.includes("下一步")) {
      const ms = getEntMatches(CURRENT_ENTERPRISE_ID);
      const top = ms.sort((a, b) => b.confidence - a.confidence)[0];
      const p = top ? findPolicy(top.policyId) : null;
      if (!p) return { id, role: "agent", time: t, text: "暂无可申报的撮合记录。" };
      return {
        id, role: "agent", time: t,
        text: `建议优先推进《${p.name}》。申报路径如下：\n${p.guideSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
        cards: [{ kind: "policy-detail", id: p.id }],
      };
    }
    if (text.includes("命中") || text.includes("最高") || text.includes("top")) {
      const ms = getEntMatches(CURRENT_ENTERPRISE_ID).sort((a, b) => b.confidence - a.confidence);
      return { id, role: "agent", time: t, text: "按命中度排序的适用政策：", cards: [{ kind: "match-table", ids: ms.map((m) => m.id) }] };
    }
    const ms = getEntMatches(CURRENT_ENTERPRISE_ID);
    return {
      id, role: "agent", time: t,
      text: `当前为您匹配 ${ms.length} 项政策，可继续追问：「我的收藏」「命中度最高」「申报指引」。`,
      cards: [{ kind: "match-table", ids: ms.map((m) => m.id) }],
    };
  }

  // my-funds
  const all = getEntDisbursements(CURRENT_ENTERPRISE_ID);
  const period = resolvePeriod(text);
  const filtered = all.filter(period.filter);
  if (text.includes("凭证")) {
    const ids = all.filter((d) => d.voucherNo).map((d) => d.id);
    return { id, role: "agent", time: t, text: `您共有 ${ids.length} 张拨付凭证：`, cards: [{ kind: "disburse-list", ids }] };
  }
  if (text.includes("在途")) {
    const ids = all.filter((d) => d.stage !== "已到账").map((d) => d.id);
    return { id, role: "agent", time: t, text: `在途资金共 ${ids.length} 笔：`, cards: [{ kind: "disburse-list", ids }] };
  }
  if (text.includes("政策") || text.includes("汇总")) {
    const map = new Map<string, number>();
    filtered.forEach((d) => {
      const k = findPolicy(d.policyId)?.name ?? d.policyId;
      map.set(k, (map.get(k) ?? 0) + d.amount);
    });
    return {
      id, role: "agent", time: t,
      text: `${period.label}按政策汇总到账金额（万元）：`,
      cards: [{
        kind: "group-bar", title: `${period.label} · 按政策汇总`,
        rows: Array.from(map.entries()).map(([k, v]) => ({ label: k.length > 10 ? k.slice(0, 10) + "…" : k, value: v, tone: "info" as const })),
      }],
    };
  }
  return {
    id, role: "agent", time: t,
    text: `${period.label}的资金概览（共 ${filtered.length} 笔）：`,
    cards: [
      {
        kind: "kpi-grid", title: `${period.label} · 我的资金看板`,
        cells: [
          { label: "拨付笔数", value: `${filtered.length}`, tone: "primary" },
          { label: "总金额", value: `${filtered.reduce((s, d) => s + d.amount, 0)} 万`, tone: "info" },
          { label: "已到账", value: `${filtered.filter((d) => d.stage === "已到账").reduce((s, d) => s + d.amount, 0)} 万`, tone: "success" },
          { label: "在途", value: `${filtered.filter((d) => d.stage !== "已到账").length} 笔`, tone: "warning" },
        ],
      },
      { kind: "disburse-list", ids: filtered.map((d) => d.id) },
    ],
  };
}

interface PeriodSpec { label: string; filter: (d: { timeline: Array<{ time: string }> }) => boolean }
function resolvePeriod(text: string): PeriodSpec {
  const ANCHOR = new Date("2026-05-18");
  const parseTime = (d: { timeline: Array<{ time: string }> }) => new Date(d.timeline[d.timeline.length - 1].time.replace(" ", "T"));
  const ym = text.match(/(20\d{2})\s*年\s*(\d{1,2})\s*月/);
  if (ym) {
    const y = +ym[1], m = +ym[2];
    return { label: `${y} 年 ${m} 月`, filter: (d) => { const dt = parseTime(d); return dt.getFullYear() === y && dt.getMonth() + 1 === m; } };
  }
  const lastN = text.match(/近\s*(\d{1,3})\s*天/);
  if (lastN) {
    const days = +lastN[1];
    const start = new Date(ANCHOR); start.setDate(start.getDate() - days);
    return { label: `近 ${days} 天`, filter: (d) => parseTime(d) >= start && parseTime(d) <= ANCHOR };
  }
  if (text.includes("今年") || text.includes("本年")) {
    return { label: "2026 年", filter: (d) => parseTime(d).getFullYear() === 2026 };
  }
  if (text.includes("上月")) {
    return { label: "2026 年 4 月", filter: (d) => { const dt = parseTime(d); return dt.getFullYear() === 2026 && dt.getMonth() + 1 === 4; } };
  }
  return { label: "本月", filter: (d) => { const dt = parseTime(d); return dt.getFullYear() === 2026 && dt.getMonth() + 1 === 5; } };
}
