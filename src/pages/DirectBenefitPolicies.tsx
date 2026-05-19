import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PolicyCard } from "@/components/direct-benefit/PolicyCard";
import { useRole } from "@/contexts/RoleContext";
import {
  policies, matches, CURRENT_ENTERPRISE_ID,
  type SupportDomain,
} from "@/components/direct-benefit/directBenefitData";
import { useNavigate } from "react-router-dom";

const DOMAIN_TABS: Array<"全部" | SupportDomain> = [
  "全部", "工业节能技术改造", "既有建筑节能改造", "能耗在线监测建设",
];

export default function DirectBenefitPolicies() {
  const { role } = useRole();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"全部" | SupportDomain>("全部");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return policies.filter((p) => {
      if (tab !== "全部" && p.domain !== tab) return false;
      if (q && !(p.name + p.summary + p.docNo).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [tab, q]);

  const hitInfoMap = useMemo(() => {
    if (role !== "ent") return new Map<string, { hit: number; total: number; confidence: number }>();
    const map = new Map<string, { hit: number; total: number; confidence: number }>();
    matches
      .filter((m) => m.enterpriseId === CURRENT_ENTERPRISE_ID)
      .forEach((m) => {
        const hit = m.hits.filter((h) => h.hit).length;
        map.set(m.policyId, { hit, total: m.hits.length, confidence: m.confidence });
      });
    return map;
  }, [role]);

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {role === "gov" ? "政策图谱" : "我的专属政策"}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {role === "gov"
                ? "智能体从市/区发改委、经信委、市场监管局等官方渠道实时抓取政策，并结构化解析申报条件与资助额度。点击卡片可进入政策详情页并推送企业。"
                : "智能体已根据您的画像匹配以下政策，命中条件一目了然，无需撰写申报书。"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              {DOMAIN_TABS.map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs">{t}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative ml-auto w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索政策名称 / 文号 / 关键词"
              className="h-9 pl-8 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-1 h-3.5 w-3.5" />更多筛选
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <PolicyCard
              key={p.id}
              policy={p}
              role={role}
              hitInfo={hitInfoMap.get(p.id)}
              onClaim={() => {
                const m = matches.find((x) => x.policyId === p.id && x.enterpriseId === CURRENT_ENTERPRISE_ID);
                if (m) navigate(`/direct-benefit/ent/claim/${m.id}`);
                else toast.info("当前没有匹配到此政策的撮合记录");
              }}
              onPush={() => navigate(`/direct-benefit/gov/policies/${p.id}`)}
            />
          ))}
          {list.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center text-sm text-muted-foreground">
              暂无符合条件的政策
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
