import { useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { SCORE_DIMENSIONS } from "./data";

const WEAK_THRESHOLD = 0.9;

function suggestionFor(name: string): string {
  if (/能耗|能源消耗/.test(name)) return "建议补充能源审计报告、节能改造方案，或上传节能技术应用记录。";
  if (/碳排|碳足迹|可再生|清洁能源/.test(name)) return "建议加入光伏 / 绿电采购证明，更新碳核查报告与减排技术说明。";
  if (/水|取水/.test(name)) return "建议补充中水回用、节水设备运行记录及节水技术改造证明。";
  if (/固废|污染|排放浓度/.test(name)) return "建议补充污染物在线监测数据、固废综合利用台账与处置合同。";
  if (/绿色设计|绿色产品|产品/.test(name)) return "建议上传绿色设计自评报告、产品碳足迹核算与第三方认证证书。";
  if (/工艺|设备|改造/.test(name)) return "建议补充先进工艺设备清单、绿色低碳改造前后对比数据。";
  if (/管理|平台|系统/.test(name)) return "建议完善能碳管理平台功能截图、管理体系认证证书。";
  if (/土地|用地/.test(name)) return "建议补充土地产出率核算依据与厂区集约用地说明。";
  return "建议补充对应证明材料，或引入相关节能 / 减排技术以提高得分。";
}

const DIMENSIONS = [
  { l: "能源低碳化", v: 22.5, m: 25 },
  { l: "资源高效化", v: 18.5, m: 20 },
  { l: "生产洁净化", v: 18.0, m: 20 },
  { l: "产品绿色化", v: 13.5, m: 15 },
  { l: "用地集约化", v: 18.5, m: 20 },
];

export function AIScoringAgentPanel({ hideSupplementButton = false }: { hideSupplementButton?: boolean; initialFinished?: boolean } = {}) {
  const animatedScore = 91;

  return (
    <Card id="ai-scoring" className="panel scroll-mt-24 relative overflow-hidden">
      {/* Tech background layers */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 30% 0%, #000 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 30% 0%, #000 40%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <CardHeader className="relative pb-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base">
          <span className="flex items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shadow-elevated">
              <Bot className="h-4 w-4" />
              <span className="absolute inset-0 rounded-md ring-1 ring-primary/40 animate-pulse-glow" />
            </span>
            <span className="font-semibold">五、AI 打分结果</span>
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/5 font-mono text-[10px] uppercase tracking-wider text-primary"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              GreenScore-LLM v3.2
            </Badge>
          </span>
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          基于已上传证明材料与填报数据，AI 已完成综合评分与薄弱项分析。
        </p>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* 最终结果 */}
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-cyan-500/10 p-4 animate-fade-in">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, hsl(var(--primary)/0.4), transparent 40%), radial-gradient(circle at 80% 80%, hsl(189 90% 55% / 0.4), transparent 45%)",
            }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16">
                {/* circular score ring */}
                <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="hsl(var(--muted))" strokeWidth="5" fill="none" />
                  <circle
                    cx="32" cy="32" r="28"
                    stroke="url(#scoreGrad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${(animatedScore / 100) * 175.9} 175.9`}
                    style={{ transition: "stroke-dasharray .5s ease-out" }}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(189 90% 55%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-lg font-bold text-primary tabular-nums">{animatedScore}</span>
                  <span className="text-[9px] text-muted-foreground">/100</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" /> AI 综合评分结果
                </div>
                <div className="mt-0.5 text-base font-semibold text-foreground">达到绿色工厂申报基准</div>
                <Badge className="mt-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> 建议提交自评价
                </Badge>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-2 md:grid-cols-6">
              {DIMENSIONS.map((d) => {
                const pct = (d.v / d.m) * 100;
                return (
                  <div key={d.l} className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5 backdrop-blur-sm">
                    <div className="text-[10px] text-muted-foreground">{d.l}</div>
                    <div className="font-mono text-xs font-semibold">{d.v}<span className="text-muted-foreground">/{d.m}</span></div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 薄弱指标提醒 */}
        <WeakIndicatorsPanel hideButton={hideSupplementButton} />
      </CardContent>
    </Card>
  );
}

interface WeakItem {
  l1: string;
  name: string;
  score: number;
  weight: number;
  ratio: number;
}

function WeakIndicatorsPanel({ hideButton = false }: { hideButton?: boolean } = {}) {
  const weak = useMemo<WeakItem[]>(() => {
    const items: WeakItem[] = [];
    SCORE_DIMENSIONS.forEach((l1) => {
      l1.children.forEach((l2) => {
        if (l2.weight > 0 && l2.score / l2.weight < WEAK_THRESHOLD) {
          items.push({
            l1: l1.name,
            name: l2.name,
            score: l2.score,
            weight: l2.weight,
            ratio: l2.score / l2.weight,
          });
        }
      });
    });
    return items.sort((a, b) => a.ratio - b.ratio).slice(0, 6);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-warning/30 bg-gradient-to-br from-warning/10 via-card to-warning/5 p-4 animate-fade-in">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/15 text-warning">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-foreground">薄弱指标提醒</span>
          {weak.length > 0 && (
            <Badge variant="outline" className="border-warning/40 bg-warning/10 font-mono text-[10px] text-warning">
              共 {weak.length} 项
            </Badge>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Lightbulb className="h-3 w-3" />
          针对薄弱项完善证明材料或加入节能技术，可有效提升得分
        </span>
      </div>

      {weak.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          所有指标均达到良好水平，暂无明显薄弱项。
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {weak.map((w) => {
            const lost = Math.round((w.weight - w.score) * 10) / 10;
            const pct = w.ratio * 100;
            return (
              <div
                key={`${w.l1}-${w.name}`}
                className="rounded-lg border border-warning/30 bg-background/70 p-3 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>{w.l1}</span>
                      <ChevronRight className="h-3 w-3" />
                      <span className="text-sm font-semibold text-foreground">{w.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-warning">
                        {w.score} / {w.weight}
                      </span>
                      <span className="text-muted-foreground">失分 {lost} 分</span>
                      <span className="text-muted-foreground">得分率 {pct.toFixed(0)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-foreground/80">
                      <Lightbulb className="mr-1 inline h-3 w-3 text-warning" />
                      {suggestionFor(w.name)}
                    </p>
                  </div>
                  {!hideButton && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-warning/40 text-warning hover:bg-warning/10 hover:text-warning"
                      onClick={() => toast.info(`已为「${w.name}」打开补充材料入口`)}
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      补充材料
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
