import { useMemo, useState } from "react";
import { Search, Star, Sparkles, FileSearch, CalendarClock, Coins, Compass, MessageCircle, ExternalLink, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentFab } from "@/components/direct-benefit/AgentFab";
import {
  policies, matches, CURRENT_ENTERPRISE_ID, domainStyle,
  type SupportDomain,
} from "@/components/direct-benefit/directBenefitData";
import { useFavorites } from "@/hooks/useFavorites";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

type TabKey = "全部" | SupportDomain | "收藏";
const DOMAIN_TABS_ENT: TabKey[] = ["全部", "工业节能技术改造", "既有建筑节能改造", "能耗在线监测建设", "收藏"];
const DOMAIN_TABS_GOV: TabKey[] = ["全部", "工业节能技术改造", "既有建筑节能改造", "能耗在线监测建设"];

export default function DirectBenefitAllPolicies() {
  const navigate = useNavigate();
  const { role } = useRole();
  const { favorites, toggle, has } = useFavorites();
  const [tab, setTab] = useState<TabKey>("全部");
  const [q, setQ] = useState("");
  const isGov = role === "gov";
  const tabs = isGov ? DOMAIN_TABS_GOV : DOMAIN_TABS_ENT;

  const hitInfoMap = useMemo(() => {
    const map = new Map<string, { hit: number; total: number; confidence: number }>();
    matches.filter((m) => m.enterpriseId === CURRENT_ENTERPRISE_ID).forEach((m) => {
      const hit = m.hits.filter((h) => h.hit).length;
      map.set(m.policyId, { hit, total: m.hits.length, confidence: m.confidence });
    });
    return map;
  }, []);

  const list = useMemo(() => policies.filter((p) => {
    if (tab === "收藏" && !favorites.includes(p.id)) return false;
    if (tab !== "全部" && tab !== "收藏" && p.domain !== tab) return false;
    if (q && !(p.name + p.summary + p.docNo).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [tab, q, favorites]);

  const detailRoute = (id: string) =>
    isGov ? `/direct-benefit/gov/policies/${id}` : `/direct-benefit/gov/policies/${id}`;

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        {/* 顶部 hero */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-background to-info/[0.05] p-5">
          <div className="pointer-events-none absolute -top-10 -right-6 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-4 h-32 w-32 rounded-full bg-info/15 blur-3xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info text-primary-foreground shadow-md shadow-primary/30">
              <Compass className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-foreground">全部政策</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isGov ? (
                  <>浏览全市绿色低碳类政策池；点击「查看原文」可查阅政策原始文件，点击右下角 <span className="font-medium text-primary">智能体</span> 可即时生成清单、对比与统计报表。</>
                ) : (
                  <>浏览全市绿色低碳类政策；点击「查看原文」可查阅政策原始文件，右下角 <span className="font-medium text-primary">智能体</span> 可即时解读政策与判断是否建议申领；点击 <Star className="inline h-3 w-3 text-warning" /> 加入收藏，同步到「我的专属政策 · 收藏」。</>
                )}
              </p>
            </div>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px]">
              共 {policies.length} 项{!isGov && ` · 收藏 ${favorites.length}`}
            </Badge>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <TabsList>
              {tabs.map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs">
                  {t === "收藏" && <Star className="mr-1 h-3 w-3" />}
                  {t}
                  {t === "收藏" && favorites.length > 0 && (
                    <span className="ml-1 rounded-full bg-warning/20 px-1.5 text-[10px] text-warning">{favorites.length}</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative ml-auto w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索政策名称 / 文号 / 关键词" className="h-9 pl-8 text-xs" />
          </div>
        </div>

        {/* 列表 */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 items-stretch">
          {list.map((p) => {
            const ds = domainStyle[p.domain];
            const fav = has(p.id);
            const hit = hitInfoMap.get(p.id);
            return (
              <div
                key={p.id}
                className="group relative flex h-full min-h-[260px] flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", ds.badge)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", ds.dot)} />{p.domain}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                    <Coins className="h-3 w-3" />{p.fundingMin}–{p.fundingMax} 万
                  </span>
                  {!isGov && (
                    <button
                      onClick={() => toggle(p.id)}
                      aria-label={fav ? "取消收藏" : "收藏"}
                      className={cn(
                        "ml-auto rounded p-1 transition",
                        fav ? "text-warning" : "text-muted-foreground hover:text-warning",
                      )}
                    >
                      <Star className={cn("h-4 w-4", fav && "fill-warning")} />
                    </button>
                  )}
                </div>

                <h3 className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.summary}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><FileSearch className="h-3 w-3" />{p.docNo}</span>
                  <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" />截止 {p.deadline}</span>
                  {!isGov && hit && (
                    <Badge variant="outline" className={cn(
                      "ml-auto text-[10px]",
                      hit.hit === hit.total ? "border-success/40 bg-success/10 text-success" : "border-warning/40 bg-warning/10 text-warning",
                    )}>
                      已命中 {hit.hit}/{hit.total}
                    </Badge>
                  )}
                </div>

                <div className="mt-auto pt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border hover:border-primary/40 hover:bg-primary/5"
                    onClick={() => navigate(detailRoute(p.id))}
                  >
                    <FileText className="mr-1 h-3.5 w-3.5" />查看原文
                  </Button>
                  {isGov ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/40 text-primary hover:bg-primary/10"
                      onClick={() => navigate("/direct-benefit/gov/policies", { state: { policyId: p.id, query: `解读 ${p.id}` } })}
                    >
                      <Sparkles className="mr-1 h-3.5 w-3.5" />智能体
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/40 text-primary hover:bg-primary/10"
                        onClick={() => navigate("/direct-benefit/ent/policy-chat", { state: { policyId: p.id, query: "解读该政策" } })}
                      >
                        <Sparkles className="mr-1 h-3.5 w-3.5" />智能体
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-2"
                        onClick={() => navigate("/direct-benefit/ent/policy-chat", { state: { policyId: p.id, query: "是否建议我申领" } })}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center text-sm text-muted-foreground">
              {tab === "收藏" ? "尚未收藏任何政策。点击 ☆ 即可收藏。" : "暂无符合条件的政策"}
            </div>
          )}
        </div>
      </div>

      <AgentFab />
    </AppLayout>
  );
}
