import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { AIScoringAgentPanel } from "@/components/green-mfg/AIScoringAgentPanel";
import { AIMaterialIntakePanel } from "@/components/green-mfg/AIMaterialIntakePanel";
import type { MaterialFile } from "@/components/green-mfg/aiMaterialMatcher";
import { DECLARATION_ANCHORS as ANCHORS, StepTabs } from "@/components/green-mfg/DeclarationStepTabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DECLARATION_BATCHES } from "@/components/green-mfg/data";

import { toast } from "sonner";

// 默认企业信息（登录企业），开始评价时自动带入，不可编辑
const DEFAULT_ENTERPRISE = {
  name: "上海华普电缆有限公司",
  creditCode: "91310112132456789X",
  industry: "机械行业",
};

const DRAFT_KEY = "green-mfg-ent-declaration-draft";

interface DraftPayload {
  basicInfo: EnterpriseBasicInfo;
  basicReqs: BasicRequirementItem[];
  indicators: IndicatorRow[];
  batch?: string;
  savedAt: string;
}

export default function GreenMfgEntDeclarationNew() {
  const navigate = useNavigate();
  const [basicInfo, setBasicInfo] = useState<EnterpriseBasicInfo>(() => ({
    ...EMPTY_ENTERPRISE_BASIC,
    factoryName: DEFAULT_ENTERPRISE.name,
    industry: DEFAULT_ENTERPRISE.industry,
  }));
  const [basicReqs, setBasicReqs] = useState<BasicRequirementItem[]>(() =>
    buildEmptyBasicRequirements(),
  );
  const [indicators, setIndicators] = useState<IndicatorRow[]>(() => buildEmptyIndicators());
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>(ANCHORS[0].href);
  const [materialPool, setMaterialPool] = useState<MaterialFile[]>([]);
  const [batch, setBatch] = useState<string>(DECLARATION_BATCHES[0]);

  const applyMaterialMapping = (mapping: {
    indicator: Record<string, string[]>;
    basic: Record<string, string[]>;
  }) => {
    setBasicReqs((prev) =>
      prev.map((it) => {
        const aiFiles = mapping.basic[String(it.no)] ?? [];
        if (aiFiles.length === 0) return it;
        const merged = Array.from(new Set([...(it.proofs ?? []), ...aiFiles]));
        return { ...it, proofs: merged };
      }),
    );
    setIndicators((prev) =>
      prev.map((it) => {
        const aiFiles = mapping.indicator[it.id] ?? [];
        if (aiFiles.length === 0) return it;
        const merged = Array.from(new Set([...(it.proofs ?? []), ...aiFiles]));
        return { ...it, proofs: merged };
      }),
    );
  };

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
      if (draft.batch) setBatch(draft.batch);
      setDraftSavedAt(draft.savedAt ?? null);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSave = () => {
    const savedAt = new Date().toISOString();
    const payload: DraftPayload = {
      basicInfo,
      basicReqs: basicReqs.map((it) => ({
        no: it.no,
        conform: it.conform,
        proofs: it.proofs,
        requirement: null as unknown as React.ReactNode,
        proofRequirement: null as unknown as React.ReactNode,
      })),
      indicators: indicators.map((it) => ({
        ...it,
        reportValue: it.reportValue ?? "",
        proofs: it.proofs,
      })),
      savedAt,
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setDraftSavedAt(savedAt);
      toast.success("已保存");
    } catch {
      toast.error("草稿保存失败");
    }
  };


  return (
    <AppLayout
      title="模拟自我评价"
      subtitle={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground whitespace-pre-wrap">
          <span>{"\n"}</span>
          <span>{"\n"}</span>
          <span>{"\n"}</span>
        </div>
      }
    >
      {/* 顶部操作栏 */}
      <Card className="panel mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-3">
            {draftSavedAt && (
              <span className="text-[11px] text-muted-foreground">
                草稿已保存 · {new Date(draftSavedAt).toLocaleString("zh-CN")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/ent")}>
              <ArrowLeft className="mr-1 h-4 w-4" />返回
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                handleSave();
                if (currentStep === "ai-scoring") {
                  navigate("/green-mfg/ent");
                }
              }}
            >
              <Save className="mr-1 h-4 w-4" />
              {currentStep === "ai-scoring" ? "完成" : "保存"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 分步骤填报 Tabs */}
      <StepTabs
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        steps={[...ANCHORS]}
      >
        {currentStep === "basic-requirements" && (
          <>
            <AIMaterialIntakePanel
              indicators={indicators}
              basics={basicReqs}
              pool={materialPool}
              onPoolChange={setMaterialPool}
              onApply={applyMaterialMapping}
            />
            <BasicRequirementsCard data={basicReqs} editable onChange={setBasicReqs} />
          </>
        )}
        {currentStep === "evaluation-indicator" && (
          <>
            <AIMaterialIntakePanel
              indicators={indicators}
              basics={basicReqs}
              pool={materialPool}
              onPoolChange={setMaterialPool}
              onApply={applyMaterialMapping}
            />
            <EvaluationIndicatorCard
              data={indicators}
              totalScore={0}
              mode="ent"
              showGovRemark={false}
              onChange={setIndicators}
            />
          </>
        )}
        {currentStep === "basic-info" && (
          <EnterpriseBasicInfoCard data={basicInfo} editable onChange={setBasicInfo} />
        )}
        {currentStep === "ai-scoring" && <AIScoringAgentPanel />}
      </StepTabs>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          disabled={currentStep === ANCHORS[0].href}
          onClick={() => {
            const idx = ANCHORS.findIndex((a) => a.href === currentStep);
            if (idx > 0) setCurrentStep(ANCHORS[idx - 1].href);
          }}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />上一步
        </Button>
        <div className="flex gap-2">
          {currentStep !== ANCHORS[ANCHORS.length - 1].href && (
            <Button
              className="bg-gradient-primary text-primary-foreground"
              onClick={() => {
                const idx = ANCHORS.findIndex((a) => a.href === currentStep);
                if (idx < ANCHORS.length - 1) setCurrentStep(ANCHORS[idx + 1].href);
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

