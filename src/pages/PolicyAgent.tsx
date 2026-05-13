import { useMemo, useRef, useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  Search,
  Filter,
  Bot,
  User as UserIcon,
  Bookmark,
  ExternalLink,
  Calendar,
  Coins,
  Building2,
  Tag as TagIcon,
  Zap,
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  MOCK_POLICIES,
  PolicyItem,
  PolicyCategory,
  categoryColor,
  urgencyColor,
  tagColor,
  INITIAL_CHAT,
  ChatMessage,
  SUGGESTED_QUESTIONS,
} from "@/components/policy-agent/policyData";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "@/hooks/use-toast";

const CATEGORY_TABS: Array<"全部" | PolicyCategory> = [
  "全部",
  "专项补贴",
  "绿色金融",
  "税收减免",
  "技改奖励",
  "示范认定",
];

export default function PolicyAgent() {
  const { role } = useRole();
  const [tab, setTab] = useState<"全部" | PolicyCategory>("全部");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(MOCK_POLICIES[0].id);
  const GOV_SUGGESTIONS = [
    "本月有哪些政策需要重点定向推送？",
    "辖区内哪些企业最适合申报绿色信贷？",
    "帮我梳理待发布的绿色制造政策清单",
    "当前政策与企业整改项目的匹配覆盖率？",
    "哪些绿色技改项目缺乏政策资金支持？",
  ];
  const GOV_INITIAL: ChatMessage[] = [
    {
      id: "gov-m-0",
      role: "assistant",
      content:
        "您好，我是政策智能推送助手 PolicyGPT（政府版）。我已基于辖区绿色制造企业的整改项目、自评价数据与动态档案，整理出 5 项可定向推送的政策（覆盖 23 家企业，其中 2 项临近截止）。您可以在左侧查看政策池、调整推送策略，或直接向我提问。",
      timestamp: "刚刚",
      suggestions: GOV_SUGGESTIONS.slice(0, 3),
    },
  ];
  const [messages, setMessages] = useState<ChatMessage[]>(
    role === "gov" ? GOV_INITIAL : INITIAL_CHAT
  );
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return MOCK_POLICIES.filter((p) => {
      const matchTab = tab === "全部" || p.category === tab;
      const q = query.trim();
      const matchQ =
        !q ||
        p.title.includes(q) ||
        p.issuer.includes(q) ||
        p.tags.some((t) => t.label.includes(q));
      return matchTab && matchQ;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [tab, query]);

  const selected =
    filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? MOCK_POLICIES[0];

  useEffect(() => {
    setMessages(role === "gov" ? GOV_INITIAL : INITIAL_CHAT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const sendMessage = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: t,
      timestamp: "刚刚",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // 模拟 AI 流式回复
    setTimeout(() => {
      const reply = mockReply(t, selected);
      setMessages((prev) => [...prev, reply]);
      setThinking(false);
    }, 900);
  };

  const handleApply = (p: PolicyItem) => {
    toast({
      title: "已加入申报清单",
      description: `${p.title} 已绑定到您的待办，AI 助手将协助梳理材料。`,
    });
  };

  // 实时指标(仅装饰)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(i);
  }, []);
  const matchedEnt = 23 + (tick % 3);
  const pushedToday = 47 + (tick % 5);

  return (
    <AppLayout
      title="政策智能推送智能体"
      subtitle={
        role === "gov"
          ? "政府侧 · 绿色制造政策标签化定向推送 + 企业匹配触达"
          : "企业侧 · 绿色制造主动政策匹配 + 申报材料 AI 辅导"
      }
    >
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_520px]">
        {/* 左侧：政策推送 */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* 列表 + 详情 */}
          <Card className="panel relative overflow-hidden flex flex-col h-[760px]">
            {/* tech background */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage: "radial-gradient(ellipse at 30% 0%, #000 35%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse at 30% 0%, #000 35%, transparent 80%)",
              }}
            />
            <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

            <CardHeader className="relative pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="text-base flex flex-wrap items-center gap-2">
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shadow-elevated">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-semibold">{role === "gov" ? "可定向推送企业的政策" : "为您主动推送的政策"}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {role === "gov" ? `已匹配 ${matchedEnt} 家企业` : `今日推送 ${pushedToday} 条`}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="搜索政策"
                      className="h-8 w-56 pl-8 text-xs"
                    />
                  </div>
                </div>
              </div>
              <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-2">
                <TabsList className="h-8 bg-muted/40">
                  {CATEGORY_TABS.map((c) => (
                    <TabsTrigger key={c} value={c} className="text-xs h-7 px-2.5">
                      {c}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="relative grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] flex-1 min-h-0 overflow-hidden">
              {/* 列表 */}
              <ScrollArea className="h-full pr-2">
                <ul className="space-y-2">
                  {filtered.map((p) => (
                    <li key={p.id} className="animate-fade-in">
                      <button
                        onClick={() => setSelectedId(p.id)}
                        className={cn(
                          "group relative w-full overflow-hidden text-left rounded-lg border p-3 transition-all hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5",
                          selected.id === p.id
                            ? "border-primary/60 bg-gradient-to-br from-primary/10 via-card to-cyan-500/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_8px_24px_-12px_hsl(var(--primary)/0.4)]"
                            : "border-border bg-card"
                        )}
                      >
                        {selected.id === p.id && (
                          <span
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                            style={{ animation: "scan 2.4s linear infinite" }}
                          />
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className={cn("text-[10px]", categoryColor[p.category])}>
                                {p.category}
                              </Badge>
                            </div>
                            <h4 className="mt-1.5 text-sm font-medium leading-snug line-clamp-2">{p.title}</h4>
                            <p className="mt-1 text-[11px] text-muted-foreground truncate">{p.issuer}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="font-mono text-xl font-bold leading-none tabular-nums text-primary">{p.matchScore}</div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">匹配度</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" /> 截止 {p.deadline}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-12">暂无匹配政策</div>
                  )}
                </ul>
              </ScrollArea>

              {/* 详情 */}
              <div className="rounded-lg border border-border bg-card/40 p-4 overflow-y-auto h-full">
                <h3 className="text-base font-semibold leading-snug">{selected.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {selected.issuer}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="截止日期" value={selected.deadline} />
                  {selected.amount && (
                    <DetailRow icon={<Coins className="h-3.5 w-3.5" />} label="资金额度" value={selected.amount} />
                  )}
                </div>

                <Separator className="my-3" />

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-muted-foreground mb-1.5">政策概要</div>
                    <p className="text-foreground leading-relaxed">{selected.summary}</p>
                  </div>

                  <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5">
                    <div className="text-primary mb-1 text-[11px] inline-flex items-center gap-1 font-medium">
                      <Sparkles className="h-3 w-3" /> AI 匹配理由
                    </div>
                    <p className="text-foreground text-xs leading-relaxed">{selected.matchReason}</p>
                    {selected.bindProject && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        绑定项目：<span className="text-foreground">{selected.bindProject}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1" onClick={() => handleApply(selected)}>
                    <ArrowRight className="h-3.5 w-3.5" /> 一键申报
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() =>
                      sendMessage(`请帮我分析《${selected.title}》的申报材料清单和填写要点`)
                    }
                  >
                    <Bot className="h-3.5 w-3.5" /> 让 AI 辅导填报
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1">
                    <Bookmark className="h-3.5 w-3.5" /> 收藏
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1 ml-auto">
                    <ExternalLink className="h-3.5 w-3.5" /> 政策原文
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：对话面板 */}
        <Card className="panel flex flex-col h-[760px] sticky top-20 relative overflow-hidden">
          {/* tech bg */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "radial-gradient(ellipse at 50% 0%, #000 30%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, #000 30%, transparent 80%)",
            }}
          />
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />

          <CardHeader className="relative pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elevated">
                <Bot className="h-5 w-5 text-primary-foreground" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-semibold">PolicyGPT</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  自然语言问答 · 材料梳理 · 申报辅导
                </p>
              </div>
            </div>
          </CardHeader>

          {/* 消息区 */}
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onSuggestion={sendMessage} />
            ))}
            {thinking && (
              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
                  正在分析您的问题…
                </div>
              </div>
            )}
          </div>

          {/* 推荐问题 */}
          <div className="relative px-4 pb-2 border-t border-border pt-3">
            <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">
              试试这些问题
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(role === "gov" ? GOV_SUGGESTIONS : SUGGESTED_QUESTIONS).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] rounded-full border border-border bg-muted/40 px-2.5 py-1 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* 输入框 */}
          <div className="relative p-3 border-t border-border">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={role === "gov" ? "向 PolicyGPT 提问，例如：本月有哪些政策需要定向推送？" : "向 PolicyGPT 提问，例如：余热回收项目可申请哪些补贴？"}
                className="min-h-[68px] resize-none pr-12 text-sm"
              />
              <Button
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || thinking}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              AI 生成内容仅供参考，请以政策原文为准
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

function MessageBubble({
  message,
  onSuggestion,
}: {
  message: ChatMessage;
  onSuggestion: (q: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-start gap-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        )}
      >
        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("max-w-[82%] space-y-2", isUser && "items-end flex flex-col")}>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-foreground border border-border"
          )}
        >
          {message.content}
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((c) => (
              <Badge key={c.policyId} variant="outline" className="text-[10px] border-primary/40 bg-primary/5 text-primary">
                <FileText className="h-2.5 w-2.5 mr-1" />
                {c.title}
              </Badge>
            ))}
          </div>
        )}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="text-[11px] rounded-full border border-primary/30 bg-primary/5 text-primary px-2.5 py-1 hover:bg-primary/10 transition"
              >
                {s} →
              </button>
            ))}
          </div>
        )}
        <div className={cn("text-[10px] text-muted-foreground", isUser && "text-right")}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone: "primary" | "success" | "warning" | "destructive";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary border-primary/30",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
      <div className={cn("h-9 w-9 rounded-md flex items-center justify-center border", toneMap[tone])}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold leading-tight">{value}</div>
        {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card/60 p-2">
      <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-xs font-medium text-foreground">{value}</div>
    </div>
  );
}

// 简单的关键词路由式 mock 回复
function mockReply(question: string, contextPolicy: PolicyItem): ChatMessage {
  const q = question.toLowerCase();
  let content = "";
  let citations: ChatMessage["citations"] = [];
  let suggestions: string[] = [];

  if (question.includes("余热") || question.includes("技改") || question.includes("补贴")) {
    content =
      "根据您绑定的『余热回收技改项目』，目前匹配度最高的是：\n\n1. 上海市绿色低碳技术改造专项资金（匹配度 96）— 最高 800 万元，按设备投资额 20-30% 补助。\n2. 闵行区绿色工厂创建奖励（匹配度 88）— 一次性奖励 50-200 万。\n\n建议优先准备前者，截止 2025-12-15，材料清单 AI 已为您预生成。";
    citations = [
      { policyId: "POL-2025-001", title: "绿色低碳技术改造专项资金" },
      { policyId: "POL-2025-004", title: "闵行区绿色工厂奖励" },
    ];
    suggestions = ["生成完整申报材料清单", "估算我们能拿到多少补贴"];
  } else if (question.includes("绿色信贷") || question.includes("贷款") || question.includes("金融")) {
    content =
      "针对绿色信贷（碳减排支持工具），需要准备 6 类材料：\n\n• 企业基本情况说明\n• 近三年碳排放核查报告\n• 项目可行性研究报告\n• 减排量测算与第三方核证意见\n• 项目预算与资金使用计划\n• 征信报告与财务报表\n\n预计授信额度 5000 万、利率 LPR-50bp。我可以帮您一键生成模板。";
    citations = [{ policyId: "POL-2025-002", title: "绿色信贷专项额度" }];
    suggestions = ["生成材料模板", "对接工行客户经理"];
  } else if (question.includes("评分") || question.includes("得分") || question.includes("绿色工厂")) {
    content =
      "贵司当前市级绿色工厂综合评分 92，已达标。提升至国家级（≥95）的关键短板：\n\n• 产品碳足迹（当前 6/8）— 建议补充 LCA 全生命周期评价\n• 绿色低碳改造升级（3/4）— 完善设备清单与节能量证明\n\n完成后可冲刺『工业产品绿色设计示范企业』国家认定。";
    suggestions = ["定制提升方案", "查看产品碳足迹模板"];
  } else if (question.includes("清单") || question.includes("本月") || question.includes("待办")) {
    content =
      "本月（2025-05）需要重点跟进：\n\n📌 高优先级（2 项）\n• 5/15 前完成绿色低碳技术改造专项资金申报材料\n• 5/20 前提交绿色工厂区级配套奖励材料\n\n📋 推进中（1 项）\n• 绿色信贷授信材料梳理（不限期，建议本月完成）\n\n是否要我把以上事项加入您的待办列表？";
    suggestions = ["加入待办", "导出 PDF 清单"];
  } else {
    content = `我理解您想了解关于《${contextPolicy.title}》或相关政策的信息。我可以帮您：\n\n• 解读政策条款与适用条件\n• 自动比对企业数据，判断是否达标\n• 生成申报材料清单与填写示例\n• 估算可获得的资金/税收优惠\n\n您可以更具体地描述您的问题，或点击下方建议。`;
    suggestions = SUGGESTED_QUESTIONS.slice(2, 5);
  }

  return {
    id: `m-${Date.now()}`,
    role: "assistant",
    content,
    timestamp: "刚刚",
    citations,
    suggestions,
  };
}
