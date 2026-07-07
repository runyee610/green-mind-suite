import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Sprout, Star, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  MOCK_DECLARATIONS,
} from "@/components/green-mfg/data";
import { EVALUATION_INDICATORS, type IndicatorRow } from "@/components/green-mfg/evaluationIndicators";
import { AIScoringAgentPanel } from "@/components/green-mfg/AIScoringAgentPanel";
import {
  EnterpriseBasicInfoCard,
  BasicRequirementsCard,
  EvaluationIndicatorCard,
} from "@/components/green-mfg/DeclarationDetailSections";
import { DECLARATION_ANCHORS as ANCHORS, StepTabs } from "@/components/green-mfg/DeclarationStepTabs";
import {
  deriveStatus,
  reviewActions,
  useReviewState,
} from "@/components/green-mfg/reviewState";

export default function GreenMfgGovDeclarationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = (searchParams.get("view") === "city" ? "city" : "district") as "city" | "district";
  const isIncubator = (id ?? "").startsWith("INC-");
  const detail = useMemo(
    () => MOCK_DECLARATIONS.find((d) => d.id === id) ?? MOCK_DECLARATIONS[0],
    [id],
  );

  const [activeTab, setActiveTab] = useState<string>(ANCHORS[0].href);
  const [indicators, setIndicators] = useState<IndicatorRow[]>(EVALUATION_INDICATORS);
  const [joined, setJoined] = useState(false);

  const reviewState = useReviewState();
  const status = deriveStatus(detail.id, reviewState, view);

  const JOINED_KEY = view === "city"
    ? "green-mfg-incubator-joined-city"
    : "green-mfg-incubator-joined-district";
  const tierLabel = view === "city" ? "市级" : "区级";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(JOINED_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setJoined(list.includes(detail.id));
    } catch {
      /* noop */
    }
  }, [detail.id, JOINED_KEY]);

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
    toast.success(`已将「${detail.enterpriseName}」加入${tierLabel}培育库`);
  };

  // 区级推荐
  const handleDistrictRecommend = () => {
    reviewActions.districtRecommend(detail.id);
    toast.success("已提交至市级审核");
  };

  // 市级：推荐到国家
  const handleCityRecommendNational = () => {
    reviewActions.cityRecommendNational(detail.id);
    toast.success(`已推荐「${detail.enterpriseName}」至国家`);
  };

  // 市级：取消推荐到国家
  const handleCityCancelNational = () => {
    reviewActions.cityCancelNational(detail.id);
    toast.message(`已取消「${detail.enterpriseName}」的国家推荐`);
  };

  // 市级：确认
  const handleCityConfirm = () => {
    reviewActions.cityConfirm(detail.id);
    toast.success(`已确认「${detail.enterpriseName}」通过市级审核`);
  };

  // 市级：退回
  const handleCityReturn = () => {
    reviewActions.cityReturn(detail.id);
    toast.message(`已退回「${detail.enterpriseName}」至区级`);
  };

  const renderReviewButtons = () => {
    if (isIncubator) return null;
    if (view === "district") {
      if (status === "审核中") {
        return (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="border-warning/40 text-warning hover:bg-warning/10 hover:text-warning disabled:opacity-100"
          >
            <Star className="mr-1 h-4 w-4 fill-current" />
            审核中
          </Button>
        );
      }
      if (status === "已推荐到市级") {
        return (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-100"
          >
            <Check className="mr-1 h-4 w-4" />
            已推荐到市级
          </Button>
        );
      }
      if (status === "已推荐到国家") {
        return (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="border-success/40 text-success hover:bg-success/10 hover:text-success disabled:opacity-100"
          >
            <Check className="mr-1 h-4 w-4" />
            已推荐到国家
          </Button>
        );
      }
      return (
        <Button size="sm" onClick={handleDistrictRecommend}>
          <Star className="mr-1 h-4 w-4" />
          推荐
        </Button>
      );
    }

    // city view
    if (status === "审核中") {
      return (
        <>
          <Button size="sm" onClick={handleCityConfirm}>
            <Check className="mr-1 h-4 w-4" />
            确认
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCityReturn}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XCircle className="mr-1 h-4 w-4" />
            退回
          </Button>
        </>
      );
    }
    if (status === "已推荐到国家") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCityCancelNational}
          className="border-success/40 text-success hover:bg-success/10 hover:text-success"
        >
          <X className="mr-1 h-4 w-4" />
          取消推荐
        </Button>
      );
    }
    return (
      <Button size="sm" onClick={handleCityRecommendNational}>
        <Star className="mr-1 h-4 w-4" />
        推荐
      </Button>
    );
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
          {renderReviewButtons()}

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
