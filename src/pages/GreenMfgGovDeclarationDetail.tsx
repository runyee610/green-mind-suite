import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MOCK_DECLARATIONS,
  stageBadgeClass,
} from "@/components/green-mfg/data";
import { EVALUATION_INDICATORS, type IndicatorRow } from "@/components/green-mfg/evaluationIndicators";
import { AIScoringAgentPanel } from "@/components/green-mfg/AIScoringAgentPanel";

import {
  EnterpriseBasicInfoCard,
  BasicRequirementsCard,
  EvaluationIndicatorCard,
} from "@/components/green-mfg/DeclarationDetailSections";

const TABS = [
  { value: "evaluation-indicator", label: "评价指标表（通则）" },
  { value: "basic-info", label: "企业基本信息表" },
  { value: "basic-requirements", label: "基本要求" },
  { value: "ai-scoring", label: "AI 打分结果" },
];

export default function GreenMfgGovDeclarationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isIncubator = (id ?? "").startsWith("INC-");
  const detail = useMemo(
    () => MOCK_DECLARATIONS.find((d) => d.id === id) ?? MOCK_DECLARATIONS[0],
    [id],
  );

  const [activeTab, setActiveTab] = useState<string>(TABS[0].value);
  const [indicators, setIndicators] = useState<IndicatorRow[]>(EVALUATION_INDICATORS);
  const [recommended, setRecommended] = useState(false);

  const handleToggleRecommend = () => {
    if (recommended) {
      setRecommended(false);
      toast.message("已取消推荐");
    } else {
      setRecommended(true);
      toast.success("已标记为推荐企业");
    }
  };

  return (
    <AppLayout
      title={detail.enterpriseName}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">{detail.creditCode}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{detail.industry}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{detail.batch}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono">{detail.submitDate}</span>
        </span>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={stageBadgeClass(detail.stage)}>{detail.stage}</Badge>
          {recommended && (
            <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
              <Star className="mr-1 h-3 w-3 fill-current" />已推荐
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isIncubator && (
            <Button
              size="sm"
              onClick={handleToggleRecommend}
              variant={recommended ? "outline" : "default"}
              className={recommended ? "border-success/40 text-success hover:bg-success/10 hover:text-success" : ""}
            >
              <Star className={`mr-1 h-4 w-4 ${recommended ? "fill-current" : ""}`} />
              {recommended ? "已推荐（点击取消）" : "推荐"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate(isIncubator ? "/green-mfg/gov/incubator" : "/green-mfg/gov")}>
            <ArrowLeft className="mr-1 h-4 w-4" />返回列表
          </Button>
        </div>
      </div>

      {/* 分页 Tab 导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="sticky top-0 z-10 h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1.5">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-base font-medium px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic-info" className="mt-0">
          <EnterpriseBasicInfoCard />
        </TabsContent>
        <TabsContent value="basic-requirements" className="mt-0">
          <BasicRequirementsCard />
        </TabsContent>
        <TabsContent value="evaluation-indicator" className="mt-0">
          <EvaluationIndicatorCard mode="gov" data={indicators} onChange={setIndicators} />
        </TabsContent>
        <TabsContent value="ai-scoring" className="mt-0">
          <AIScoringAgentPanel initialFinished hideSupplementButton />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
