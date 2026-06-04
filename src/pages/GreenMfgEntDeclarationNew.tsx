import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { DataAttestationPanel, type AttestationState } from "@/components/green-mfg/DataAttestationPanel";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BATCH_OPTIONS = ["2026年第一批", "2025年第二批", "2025年第一批", "2024年第二批"];


const ANCHORS = [
  { href: "basic-info", label: "企业基本信息表" },
  { href: "basic-requirements", label: "基本要求" },
  { href: "evaluation-indicator", label: "评价指标表（通则）" },
  { href: "ai-scoring", label: "AI 打分智能体" },
  { href: "data-attestation", label: "数据确权" },
];

// 默认企业信息（登录企业），开始评价时自动带入，不可编辑
const DEFAULT_ENTERPRISE = {
  name: "上海华普电缆有限公司",
  creditCode: "91310112132456789X",
  industry: "机械行业",
};

const DRAFT_KEY = "green-mfg-ent-declaration-draft";

interface DraftPayload {
  batch: string;
  basicInfo: EnterpriseBasicInfo;
  basicReqs: BasicRequirementItem[];
  indicators: IndicatorRow[];
  attestation?: AttestationState | null;
  savedAt: string;
}

export default function GreenMfgEntDeclarationNew() {
  const navigate = useNavigate();
  const [batch, setBatch] = useState("");
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
  const [attestation, setAttestation] = useState<AttestationState | null>(null);

  

  // 恢复草稿
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as DraftPayload;
      setBatch(draft.batch ?? "");
      if (draft.basicInfo) setBasicInfo(draft.basicInfo);
      if (draft.basicReqs?.length) {
        // 从存储恢复时仅保留 conform / proofs（requirement / proofRequirement 是 ReactNode，不会被序列化）
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
      if (draft.attestation) setAttestation(draft.attestation);
      setDraftSavedAt(draft.savedAt ?? null);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSave = () => {
    const savedAt = new Date().toISOString();
    const payload: DraftPayload = {
      batch,
      basicInfo,
      basicReqs: basicReqs.map((it) => ({
        no: it.no,
        conform: it.conform,
        proofs: it.proofs,
        // 占位字段，避免类型报错
        requirement: null as unknown as React.ReactNode,
        proofRequirement: null as unknown as React.ReactNode,
      })),
      indicators: indicators.map((it) => ({
        ...it,
        reportValue: it.reportValue ?? "",
        proofs: it.proofs,
      })),
      savedAt,
      attestation,
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setDraftSavedAt(savedAt);
      toast.success("已保存");
    } catch {
      toast.error("草稿保存失败");
    }
  };

  const handleSubmit = () => {
    if (!attestation?.confirmed) {
      toast.warning("请先在「数据确权」步骤完成承诺");
      setCurrentStep("data-attestation");
      return;
    }
    toast.success("自我评价已提交,等待区级审核");
    localStorage.removeItem(DRAFT_KEY);
    setTimeout(() => navigate("/green-mfg/ent"), 600);
  };

  return (
    <AppLayout
      title="绿色工厂自我评价（模拟）"
      subtitle={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span><span className="text-muted-foreground/60">企业名称</span> · {DEFAULT_ENTERPRISE.name}</span>
          <span><span className="text-muted-foreground/60">统一社会信用代码</span> · {DEFAULT_ENTERPRISE.creditCode}</span>
          <span><span className="text-muted-foreground/60">所属行业</span> · {DEFAULT_ENTERPRISE.industry}</span>
        </div>
      }
    >
      {/* 顶部操作栏 */}
      <Card className="panel mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">评价批次</Label>
            <Select value={batch} onValueChange={setBatch}>
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue placeholder="请选择批次" />
              </SelectTrigger>
              <SelectContent>
                {BATCH_OPTIONS.map((b) => (
                  <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            {draftSavedAt && (
              <span className="text-[11px] text-muted-foreground">
                草稿已保存 · {new Date(draftSavedAt).toLocaleString("zh-CN")}
              </span>
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/ent")}>
                <ArrowLeft className="mr-1 h-4 w-4" />返回
              </Button>
              <Button size="sm" variant="outline" onClick={handleSave}>
                <Save className="mr-1 h-4 w-4" />保存
              </Button>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={handleSubmit}>
                <Send className="mr-1 h-4 w-4" />提交审核
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分步骤填报 Tabs */}
      <StepTabs
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        steps={ANCHORS}
      >
        {currentStep === ANCHORS[0].href && (
          <EnterpriseBasicInfoCard data={basicInfo} editable onChange={setBasicInfo} />
        )}
        {currentStep === ANCHORS[1].href && (
          <BasicRequirementsCard data={basicReqs} editable onChange={setBasicReqs} />
        )}
        {currentStep === ANCHORS[2].href && (
          <EvaluationIndicatorCard
            data={indicators}
            totalScore={0}
            mode="ent"
            showGovRemark={false}
            onChange={setIndicators}
          />
        )}
        {currentStep === ANCHORS[3].href && <AIScoringAgentPanel />}
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
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-1 h-4 w-4" />保存
          </Button>
          {currentStep === ANCHORS[ANCHORS.length - 1].href ? (
            <Button className="bg-gradient-primary text-primary-foreground" onClick={handleSubmit}>
              <Send className="mr-1 h-4 w-4" />提交审核
            </Button>
          ) : (
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

function StepTabs({
  steps,
  currentStep,
  onStepChange,
  children,
}: {
  steps: { href: string; label: string }[];
  currentStep: string;
  onStepChange: (s: string) => void;
  children: React.ReactNode;
}) {
  const idx = Math.max(0, steps.findIndex((s) => s.href === currentStep));
  return (
    <Tabs value={currentStep} onValueChange={onStepChange} className="space-y-4">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
        {steps.map((s, i) => (
          <TabsTrigger
            key={s.href}
            value={s.href}
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <span
              className={
                "inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] " +
                (i <= idx ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground")
              }
            >
              {i + 1}
            </span>
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={currentStep} forceMount className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
}

function ReadonlyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div
        className={
          "flex h-10 items-center rounded-md border border-border/50 bg-muted/30 px-3 text-sm text-foreground " +
          (mono ? "font-mono" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}
