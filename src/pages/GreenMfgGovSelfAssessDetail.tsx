import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_DECLARATIONS, MOCK_SELF_ASSESS } from "@/components/green-mfg/data";
import { AIScoringAgentPanel } from "@/components/green-mfg/AIScoringAgentPanel";
import {
  EnterpriseBasicInfoCard,
  BasicRequirementsCard,
  EvaluationIndicatorCard,
  MOCK_ENTERPRISE_BASIC,
  MOCK_BASIC_REQUIREMENTS,
} from "@/components/green-mfg/DeclarationDetailSections";
import { EVALUATION_INDICATORS } from "@/components/green-mfg/evaluationIndicators";
import { DECLARATION_ANCHORS as ANCHORS, StepTabs } from "@/components/green-mfg/DeclarationStepTabs";

export default function GreenMfgGovSelfAssessDetail() {
  const { creditCode } = useParams();
  const navigate = useNavigate();

  const latest = useMemo(() => {
    const list = MOCK_SELF_ASSESS.filter((r) => r.creditCode === creditCode).sort(
      (a, b) => b.date.localeCompare(a.date),
    );
    return list[0] ?? null;
  }, [creditCode]);

  const relatedDecl = useMemo(
    () => MOCK_DECLARATIONS.find((d) => d.creditCode === creditCode),
    [creditCode],
  );

  const [activeTab, setActiveTab] = useState<string>(ANCHORS[0].href);

  if (!latest) {
    return (
      <AppLayout title="企业模拟评价 · 详情" subtitle="未找到该企业的模拟评价记录">
        <Card className="panel">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            未找到该企业的模拟评价记录
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/green-mfg/gov/self-assess")}>
                <ArrowLeft className="mr-1 h-3 w-3" />返回列表
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const basicInfo = {
    ...MOCK_ENTERPRISE_BASIC,
    factoryName: latest.enterpriseName,
    industry: latest.industry,
    subIndustry: latest.subIndustry ?? MOCK_ENTERPRISE_BASIC.subIndustry,
  };

  return (
    <AppLayout
      title={`企业模拟评价 · ${latest.enterpriseName}`}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">{latest.creditCode}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{latest.industry}{latest.subIndustry ? ` / ${latest.subIndustry}` : ""}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{latest.district}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono">评价日期 {latest.date}</span>
          {relatedDecl?.batch && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{relatedDecl.batch}</span>
            </>
          )}
          <span className="text-muted-foreground/40">·</span>
          <span className="text-muted-foreground">仅查看（最新一次评价）</span>
        </span>
      }
    >
      <div className="mb-3">
        <Button variant="outline" size="sm" className="h-8" onClick={() => navigate("/green-mfg/gov/self-assess")}>
          <ArrowLeft className="mr-1 h-3 w-3" />返回列表
        </Button>
      </div>

      <StepTabs currentStep={activeTab} onStepChange={setActiveTab} steps={[...ANCHORS]}>
        {activeTab === "basic-requirements" && (
          <BasicRequirementsCard data={MOCK_BASIC_REQUIREMENTS} />
        )}
        {activeTab === "evaluation-indicator" && (
          <EvaluationIndicatorCard data={EVALUATION_INDICATORS} totalScore={latest.aiScore} mode="view" showGovRemark={false} />
        )}
        {activeTab === "basic-info" && <EnterpriseBasicInfoCard data={basicInfo} />}
        {activeTab === "ai-scoring" && <AIScoringAgentPanel />}
      </StepTabs>
    </AppLayout>
  );
}
