import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const DECLARATION_ANCHORS = [
  { href: "basic-requirements", label: "基本要求" },
  { href: "evaluation-indicator", label: "评价指标表" },
  { href: "basic-info", label: "基本信息" },
  { href: "ai-scoring", label: "AI 打分结果" },
] as const;

export function StepTabs({
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
