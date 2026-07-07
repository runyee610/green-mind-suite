import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Sprout, Star } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { DECLARATION_ANCHORS as ANCHORS, StepTabs } from "@/components/green-mfg/DeclarationStepTabs";

export default function GreenMfgGovDeclarationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isIncubator = (id ?? "").startsWith("INC-");
  const detail = useMemo(
    () => MOCK_DECLARATIONS.find((d) => d.id === id) ?? MOCK_DECLARATIONS[0],
    [id],
  );

  const [activeTab, setActiveTab] = useState<string>(ANCHORS[0].href);
  const [indicators, setIndicators] = useState<IndicatorRow[]>(EVALUATION_INDICATORS);
  const [recommended, setRecommended] = useState(false);
  const [joined, setJoined] = useState(false);

  const JOINED_KEY = "green-mfg-incubator-joined";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(JOINED_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setJoined(list.includes(detail.id));
    } catch {
      /* noop */
    }
  }, [detail.id]);

  const handleJoinIncubator = () => {
    if (joined) return;
    try {
      const raw = localStorage.getItem(JOINED_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(detail.id)) list.push(detail.id);
      localStorage.setItem(JOINED_KEY, JSON.stringify(list));
    } catch {
      /* noop */
    }
    setJoined(true);
    toast.success(`已将「${detail.enterpriseName}」加入区级培育库`);
  };

  const handleToggleRecommend = () => {
    if (recommended) return;
    setRecommended(true);
    toast.success("已提交至市级审核");
  };

  return (
    <AppLayout
      title={detail.enterpriseName}
      subtitle={null}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div />

        <div className="flex items-center gap-2">
          {!isIncubator && (
            <Button
              size="sm"
              onClick={handleJoinIncubator}
              disabled={joined}
              variant="outline"
              className={joined ? "border-success/40 text-success hover:bg-success/10 hover:text-success disabled:opacity-100" : ""}
            >
              {joined ? <Check className="mr-1 h-4 w-4" /> : <Sprout className="mr-1 h-4 w-4" />}
              {joined ? "已加入培育库" : "加入培育库"}
            </Button>
          )}
          {!isIncubator && (
            <Button
              size="sm"
              onClick={handleToggleRecommend}
              disabled={recommended}
              variant={recommended ? "outline" : "default"}
              className={recommended ? "border-info/40 text-info hover:bg-info/10 hover:text-info disabled:opacity-100" : ""}
            >
              <Star className={`mr-1 h-4 w-4 ${recommended ? "fill-current" : ""}`} />
              {recommended ? "审核中" : "推荐"}
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => navigate(isIncubator ? "/green-mfg/gov/incubator" : "/green-mfg/gov/review")}>
            <ArrowLeft className="mr-1 h-4 w-4" />返回列表
          </Button>
        </div>
      </div>

      <StepTabs currentStep={activeTab} onStepChange={setActiveTab} steps={[...ANCHORS]}>
        {activeTab === "basic-requirements" && <BasicRequirementsCard />}
        {activeTab === "evaluation-indicator" && (
          <EvaluationIndicatorCard mode="gov" data={indicators} onChange={setIndicators} />
        )}
        {activeTab === "basic-info" && <EnterpriseBasicInfoCard />}
        {activeTab === "ai-scoring" && <AIScoringAgentPanel />}
      </StepTabs>
    </AppLayout>
  );
}
