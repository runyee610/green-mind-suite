import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Loader2, Plus, MessageSquare, Trash2, Factory, Leaf, Layers, BarChart3, Lightbulb } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/logo.png";

type Msg = { id: string; role: "user" | "assistant"; content: string; ts: number };
type Conversation = { id: string; title: string; messages: Msg[]; updatedAt: number };

const STORAGE_KEY = "green-mfg-agent-conversations";

const SUGGESTIONS = [
  { icon: Factory, text: "嘉定区培育潜力 TOP10 是哪些企业？" },
  { icon: Leaf, text: "汽车产业绿色化率目前是多少？" },
  { icon: Layers, text: "市级绿色工厂晋级国家级的关键指标？" },
  { icon: BarChart3, text: "对比浦东和金山的绿色制造体系完成度" },
  { icon: Lightbulb, text: "为我生成一份 2026 年绿色培育建议" },
];

const newId = () => Math.random().toString(36).slice(2, 10);
const fmt = (ts: number) => new Date(ts).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

function bootstrap(): { convs: Conversation[]; activeId: string } {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as Conversation[];
        if (Array.isArray(arr) && arr.length > 0) {
          return { convs: arr, activeId: arr[0].id };
        }
      }
    } catch {}
  }
  const first: Conversation = {
    id: newId(),
    title: "新对话",
    updatedAt: Date.now(),
    messages: [
      {
        id: newId(),
        role: "assistant",
        content:
          "您好，我是**绿色制造数字智能体**。我可以基于全市绿色制造体系数据为您提供：\n\n- 工厂 / 供应链 / 园区 / 产品分布与排名\n- 培育梯度晋级路径与潜力企业识别\n- 行业、区县、集团对标分析\n- 政策匹配与申报指导\n\n请在下方输入问题，或选择常用问题开始。",
        ts: Date.now(),
      },
    ],
  };
  return { convs: [first], activeId: first.id };
}

const Avatar = ({ role }: { role: "user" | "assistant" }) =>
  role === "assistant" ? (
    <div className="h-8 w-8 rounded-lg bg-white ring-1 ring-border shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
      <img src={logoUrl} alt="AI" className="h-7 w-7 object-contain" />
    </div>
  ) : (
    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-primary-foreground text-xs font-semibold">
      我
    </div>
  );

function MessageBubble({ m }: { m: Msg }) {
  return (
    <div className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "")}>
      <Avatar role={m.role} />
      <div className={cn("flex flex-col gap-1 max-w-[78%]", m.role === "user" ? "items-end" : "items-start")}>
        {m.role === "user" ? (
          <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm bg-primary text-primary-foreground shadow-sm whitespace-pre-wrap break-words">
            {m.content}
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
            {m.content}
          </div>
        )}
        <span className="text-[10px] text-muted-foreground px-1">{fmt(m.ts)}</span>
      </div>
    </div>
  );
}

export default function GreenMfgAgent() {
  const initial = useMemo(() => bootstrap(), []);
  const [convs, setConvs] = useState<Conversation[]>(initial.convs);
  const [activeId, setActiveId] = useState<string>(initial.activeId);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Persist
  useEffect(() => {
    if (convs.length > 0) {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(convs)); } catch {}
    }
  }, [convs]);

  const active = useMemo(() => convs.find((c) => c.id === activeId), [convs, activeId]);

  // Auto scroll & focus
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [active?.messages.length, streaming]);
  useEffect(() => { taRef.current?.focus(); }, [activeId]);

  const newConversation = () => {
    const c: Conversation = { id: newId(), title: "新对话", updatedAt: Date.now(), messages: [
      { id: newId(), role: "assistant", content: "新的对话已开始，请输入您关于绿色制造的问题。", ts: Date.now() },
    ] };
    setConvs((prev) => [c, ...prev]);
    setActiveId(c.id);
  };

  const removeConv = (id: string) => {
    setConvs((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeId) setActiveId(next[0]?.id ?? "");
      if (next.length === 0) {
        const fresh: Conversation = { id: newId(), title: "新对话", updatedAt: Date.now(), messages: [] };
        setActiveId(fresh.id);
        return [fresh];
      }
      return next;
    });
  };

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming || !activeId) return;
    const userMsg: Msg = { id: newId(), role: "user", content, ts: Date.now() };
    setInput("");
    setStreaming(true);

    setConvs((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        const isFirstUser = !c.messages.some((m) => m.role === "user");
        return {
          ...c,
          title: isFirstUser ? content.slice(0, 18) : c.title,
          updatedAt: Date.now(),
          messages: [...c.messages, userMsg],
        };
      })
    );

    // mock assistant
    setTimeout(() => {
      const reply: Msg = {
        id: newId(),
        role: "assistant",
        content: mockReply(content),
        ts: Date.now(),
      };
      setConvs((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, updatedAt: Date.now(), messages: [...c.messages, reply] } : c
        )
      );
      setStreaming(false);
      requestAnimationFrame(() => taRef.current?.focus());
    }, 900);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <AppLayout hideHeader>
      <div className="h-[calc(100vh-3.5rem-3rem)] -m-6 grid grid-cols-[260px_1fr]">
        {/* Sidebar: conversations */}
        <aside className="border-r border-border bg-muted/20 flex flex-col min-h-0">
          <div className="p-3 border-b border-border">
            <Button onClick={newConversation} className="w-full gap-2" variant="default">
              <Plus className="h-4 w-4" />新建对话
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {convs.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition",
                    c.id === activeId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className="flex-1 flex items-center gap-2 min-w-0 text-left"
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-sm">{c.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeConv(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                    aria-label="删除对话"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border text-[11px] text-muted-foreground">
            历史保存于本机浏览器
          </div>
        </aside>

        {/* Chat */}
        <section className="flex flex-col min-h-0 bg-background">
          <div className="px-6 py-3 border-b border-border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white ring-1 ring-border flex items-center justify-center overflow-hidden">
              <img src={logoUrl} alt="logo" className="h-8 w-8 object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">绿色制造数字智能体</div>
              <div className="text-[11px] text-muted-foreground">基于上海市绿色制造体系名单实时数据 · 智能分析与培育建议</div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
              {active?.messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-12">开始一段新的对话吧</div>
              )}
              {active?.messages.map((m) => <MessageBubble key={m.id} m={m} />)}
              {streaming && (
                <div className="flex gap-3">
                  <Avatar role="assistant" />
                  <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />正在思考...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Composer */}
          <div className="border-t border-border bg-card">
            {active && active.messages.length <= 1 && (
              <div className="max-w-3xl mx-auto px-6 pt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => send(s.text)}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 text-foreground/80 transition"
                  >
                    <s.icon className="h-3.5 w-3.5 text-primary" />
                    {s.text}
                  </button>
                ))}
              </div>
            )}
            <div className="max-w-3xl mx-auto px-6 py-4">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-background focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 transition px-3 py-2">
                <Textarea
                  ref={taRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="输入您的问题，Enter 发送，Shift+Enter 换行"
                  className="flex-1 min-h-[40px] max-h-40 resize-none border-0 focus-visible:ring-0 px-0 py-1.5 text-sm shadow-none"
                  disabled={streaming}
                />
                <Button
                  size="icon"
                  onClick={() => send()}
                  disabled={!input.trim() || streaming}
                  className="h-9 w-9 shrink-0"
                >
                  {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-1.5 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />回复由 AI 生成，仅供参考
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function mockReply(q: string): string {
  if (q.includes("嘉定")) {
    return "嘉定区当前已有 72 家市级绿色工厂（汽车产业占比 38%）。AI 识别 10 家高潜培育对象：\n\n1. 上汽乘用车嘉定基地  评分 86\n2. 采埃孚汽车系统  评分 84\n3. 舍弗勒（中国）  评分 82\n4. 博世汽车部件  评分 81\n5. 上海小糸车灯  评分 79\n…\n\n建议优先纳入 2026 年市级培育库，重点提升「能源管理体系」与「产品全生命周期评价」两项指标。";
  }
  if (q.includes("汽车")) {
    return "汽车产业绿色化率：\n\n- 全市汽车规上企业 184 家\n- 已认定市级绿色工厂 62 家，覆盖率 **33.7%**\n- 国家级绿色工厂 24 家，覆盖率 13.0%\n- 较 2024 年同比 +4.2 个百分点\n\n是否需要查看分层级名单或晋级路径？";
  }
  return "已收到您的问题：\n\n> " + q + "\n\n（示例回复）我正在基于全市绿色制造体系名单与历年自评价数据进行分析，建议您切换到全景看板对应模块查看可视化结果，或继续追问具体维度。";
}
