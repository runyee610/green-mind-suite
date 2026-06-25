import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
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
      subtitle={null}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div />

        <div className="flex items-center gap-2">
          {!isIncubator && (
            <Button
              size="sm"
              onClick={handleToggleRecommend}
              variant={recommended ? "outline" : "default"}
              className={recommended ? "border-success/40 text-success hover:bg-success/10 hover:text-success" : ""}
            >
              <Star className={`mr-1 h-4 w-4 ${recommended ? "fill-current" : ""}`} />
              {recommended ? "取消推荐" : "推荐"}
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
