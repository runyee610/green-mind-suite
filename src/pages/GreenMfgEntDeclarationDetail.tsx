import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_DECLARATIONS } from "@/components/green-mfg/data";
import { AIScoringAgentPanel } from "@/components/green-mfg/AIScoringAgentPanel";
import {
  EnterpriseBasicInfoCard,
  BasicRequirementsCard,
  EvaluationIndicatorCard,
  EMPTY_ENTERPRISE_BASIC,
  buildEmptyBasicRequirements,
  buildEmptyIndicators,
  type EnterpriseBasicInfo,
  type BasicRequirementItem,
} from "@/components/green-mfg/DeclarationDetailSections";
import type { IndicatorRow } from "@/components/green-mfg/evaluationIndicators";
import { DECLARATION_ANCHORS as ANCHORS, StepTabs } from "@/components/green-mfg/DeclarationStepTabs";

const DRAFT_KEY = "green-mfg-ent-declaration-draft";

interface DraftPayload {
  basicInfo: EnterpriseBasicInfo;
  basicReqs: BasicRequirementItem[];
  indicators: IndicatorRow[];
  savedAt: string;
}

export default function GreenMfgEntDeclarationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = useMemo(
    () => MOCK_DECLARATIONS.find((d) => d.id === id) ?? MOCK_DECLARATIONS[0],
    [id],
  );
  const [activeTab, setActiveTab] = useState<string>(ANCHORS[0].href);

  const [basicInfo, setBasicInfo] = useState<EnterpriseBasicInfo>(() => ({
    ...EMPTY_ENTERPRISE_BASIC,
    factoryName: detail.enterpriseName,
  }));
  const [basicReqs, setBasicReqs] = useState<BasicRequirementItem[]>(() =>
    buildEmptyBasicRequirements(),
  );
  const [indicators, setIndicators] = useState<IndicatorRow[]>(() => buildEmptyIndicators());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as DraftPayload;
      if (draft.basicInfo) setBasicInfo(draft.basicInfo);
      if (draft.basicReqs?.length) {
        setBasicReqs((prev) =>
          prev.map((it) => {
            const saved = draft.basicReqs.find((s) => s.no === it.no);
            return saved ? { ...it, conform: saved.conform, proofs: saved.proofs ?? [] } : it;
          }),
        );
      }
      if (draft.indicators?.length) {
        setIndicators((prev) =>
          prev.map((it) => {
            const saved = draft.indicators.find((s) => s.id === it.id);
            return saved
              ? {
                  ...it,
                  reportValue: saved.reportValue ?? "",
                  proofs: saved.proofs ?? [],
                  hasStandard: saved.hasStandard ?? it.hasStandard,
                  products: saved.products ?? it.products,
                  platformFunctions: saved.platformFunctions ?? it.platformFunctions,
                }
              : it;
          }),
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

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
      <Card className="panel mb-4">
        <CardContent className="flex flex-wrap items-center justify-end gap-3 p-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/ent")}>
            <ArrowLeft className="mr-1 h-4 w-4" />返回
          </Button>
        </CardContent>
      </Card>

      {detail.comment && (
        <div className="mb-4 rounded-md border border-border/60 bg-muted/30 p-3">
          <p className="text-[11px] text-muted-foreground">最新审核意见</p>
          <p className="mt-1 text-sm leading-relaxed">{detail.comment}</p>
        </div>
      )}

      <StepTabs
        currentStep={activeTab}
        onStepChange={setActiveTab}
        steps={[...ANCHORS]}
      >
        {activeTab === "basic-requirements" && (
          <BasicRequirementsCard data={basicReqs} onChange={setBasicReqs} />
        )}
        {activeTab === "evaluation-indicator" && (
          <EvaluationIndicatorCard
            data={indicators}
            totalScore={0}
            mode="ent"
            showGovRemark={false}
            onChange={setIndicators}
          />
        )}
        {activeTab === "basic-info" && (
          <EnterpriseBasicInfoCard data={basicInfo} onChange={setBasicInfo} />
        )}
        {activeTab === "ai-scoring" && <AIScoringAgentPanel />}
      </StepTabs>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          disabled={activeTab === ANCHORS[0].href}
          onClick={() => {
            const idx = ANCHORS.findIndex((a) => a.href === activeTab);
            if (idx > 0) setActiveTab(ANCHORS[idx - 1].href);
          }}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />上一步
        </Button>
        <div className="flex gap-2">
          {activeTab !== ANCHORS[ANCHORS.length - 1].href && (
            <Button
              className="bg-gradient-primary text-primary-foreground"
              onClick={() => {
                const idx = ANCHORS.findIndex((a) => a.href === activeTab);
                if (idx < ANCHORS.length - 1) setActiveTab(ANCHORS[idx + 1].href);
              }}
            >
              下一步<ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
