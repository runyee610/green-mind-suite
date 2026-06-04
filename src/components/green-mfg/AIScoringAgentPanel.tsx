import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  FileSearch,
  Database,
  Calculator,
  GitCompare,
  Gauge,
  Sparkles,
  CheckCircle2,
  Loader2,
  Play,
  RotateCw,
  ChevronDown,
  ChevronRight,
  Cpu,
  Activity,
  Zap,
  Radar,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Lightbulb,
} from "lucide-react";
import { SCORE_DIMENSIONS } from "./data";
import { cn } from "@/lib/utils";

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



type StepStatus = "pending" | "running" | "done";

interface AgentStep {
  id: string;
  title: string;
  desc: string;
  icon: typeof Bot;
  logs: string[];
  outputs?: { label: string; value: string }[];
}

const STEPS: AgentStep[] = [
  {
    id: "ingest",
    title: "证明材料解析",
    desc: "OCR + 版面理解,识别 PDF / 图片中的关键字段",
    icon: FileSearch,
    logs: [
      "扫描《2024年综合能耗统计表》(PDF, 12页) ... ✓",
      "扫描《单位产品能耗台账》(PDF, 8页) ... ✓",
      "OCR 识别图片证据 8 张,平均置信度 96.2%",
      "版面解析提取表格 14 张,命中关键指标 38 项",
    ],
    outputs: [
      { label: "解析文件", value: "16 份" },
      { label: "提取字段", value: "238 个" },
      { label: "OCR 置信度", value: "96.2%" },
    ],
  },
  {
    id: "extract",
    title: "结构化数据提取",
    desc: "按指标体系映射字段,构建标准化数据集",
    icon: Database,
    logs: [
      "映射《GB/T 36132-2018 绿色工厂评价通则》指标 24 项 ... ✓",
      "提取能源消耗:电 1,825 万 kWh / 天然气 86 万 m³ / 蒸汽 4,200 t",
      "提取产值:4.82 亿元 / 综合能耗 6,138 tce",
      "提取水资源:取水量 18.6 万 m³ / 中水回用 4.2 万 m³",
    ],
    outputs: [
      { label: "结构化字段", value: "187 项" },
      { label: "命中关键指标", value: "24 / 24" },
    ],
  },
  {
    id: "compute",
    title: "公式计算与归一化",
    desc: "按通则公式计算单位产值能耗、清洁能源占比等",
    icon: Calculator,
    logs: [
      "单位产值综合能耗 = 6,138 / 4.82 = 1,273.4 tce/亿元",
      "清洁能源占比 = (光伏 + 外购绿电) / 总用电 = 28.6%",
      "工业固废综合利用率 = (再生 + 综合利用) / 产生量 = 96.4%",
      "单位产品取水量(电力电缆) = 取水量 / 产量 = 0.42 m³/km",
    ],
    outputs: [
      { label: "完成计算", value: "32 项" },
      { label: "归一化指标", value: "18 项" },
    ],
  },
  {
    id: "compare",
    title: "标杆对照与一致性核对",
    desc: "与行业先进值/基准值、企业历史数据交叉比对",
    icon: GitCompare,
    logs: [
      "对照《电线电缆行业能耗限额》先进值 1,200 tce/亿元 → 当前 1,273.4,达基准值",
      "对照行业绿电占比平均值 21.8% → 当前 28.6%,优于平均",
      "与 2023 年同口径对比:综合能耗 ↓ 4.7%,单位能耗 ↓ 6.1%",
      "数据一致性校验:12 项过审 / 0 项异常",
    ],
    outputs: [
      { label: "对标项", value: "12 项" },
      { label: "异常项", value: "0 项" },
    ],
  },
  {
    id: "score",
    title: "维度打分与权重汇总",
    desc: "按指标权重与评分规则生成各维度分值",
    icon: Gauge,
    logs: [
      "能源低碳化:22.5 / 25",
      "资源高效化:18.5 / 20",
      "生产洁净化:18.0 / 20",
      "产品绿色化:13.5 / 15",
      "用地集约化:18.5 / 20",
    ],
    outputs: [
      { label: "总分(权重加权)", value: "91.0 / 100" },
      { label: "AI 建议", value: "建议申报" },
    ],
  },
];

const DIMENSIONS = [
  { l: "能源低碳化", v: 22.5, m: 25 },
  { l: "资源高效化", v: 18.5, m: 20 },
  { l: "生产洁净化", v: 18.0, m: 20 },
  { l: "产品绿色化", v: 13.5, m: 15 },
  { l: "用地集约化", v: 18.5, m: 20 },
];

export function AIScoringAgentPanel({ initialFinished = false, hideSupplementButton = false }: { initialFinished?: boolean; hideSupplementButton?: boolean } = {}) {
  const [running, setRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(initialFinished ? STEPS.length : -1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    initialFinished ? Object.fromEntries(STEPS.map((s) => [s.id, true])) : {},
  );
  const [tick, setTick] = useState(initialFinished ? 30 : 0);


  const finished = currentIdx >= STEPS.length;
  const progress = useMemo(() => {
    if (currentIdx < 0) return 0;
    if (finished) return 100;
    return Math.round(((currentIdx + 0.5) / STEPS.length) * 100);
  }, [currentIdx, finished]);

  // Score count-up
  const animatedScore = useMemo(() => {
    if (!finished) return 0;
    return Math.min(91, Math.round((tick / 30) * 91));
  }, [finished, tick]);

  useEffect(() => {
    if (!running) return;
    if (currentIdx >= STEPS.length) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => {
      setExpanded((p) => ({ ...p, [STEPS[currentIdx].id]: true }));
      setCurrentIdx((i) => i + 1);
    }, 1400);
    return () => clearTimeout(t);
  }, [running, currentIdx]);

  // ticker for live metrics + score animation
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(i);
  }, []);

  const start = () => {
    setCurrentIdx(0);
    setExpanded({});
    setTick(0);
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setCurrentIdx(-1);
    setExpanded({});
  };

  const statusOf = (idx: number): StepStatus => {
    if (currentIdx < 0) return "pending";
    if (idx < currentIdx) return "done";
    if (idx === currentIdx && running) return "running";
    if (finished) return "done";
    return "pending";
  };

  // live metrics simulation
  const tps = 820 + Math.round(Math.sin(tick / 4) * 60 + Math.random() * 40);
  const tokens = 12480 + tick * 37;
  const gpuLoad = 62 + Math.round(Math.sin(tick / 5) * 18);

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
            <span className="font-semibold">五、AI 打分智能体</span>
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/5 font-mono text-[10px] uppercase tracking-wider text-primary"
            >
              <Cpu className="mr-1 h-3 w-3" />
              GreenScore-LLM v3.2
            </Badge>
            {running && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                LIVE
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {currentIdx >= 0 && (
              <Button size="sm" variant="ghost" onClick={reset}>
                <RotateCw className="mr-1 h-3.5 w-3.5" />重置
              </Button>
            )}
            <Button
              size="sm"
              className="bg-gradient-primary text-primary-foreground shadow-elevated hover:opacity-90"
              onClick={start}
              disabled={running}
            >
              {running ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />智能体运行中
                </>
              ) : (
                <>
                  <Play className="mr-1 h-3.5 w-3.5" />
                  启动 AI 打分
                </>

              )}
            </Button>
          </div>
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          多模态智能体串联「材料解析 → 数据提取 → 公式计算 → 标杆对照 → 维度打分」全流程,过程透明可追溯,结果可信可解释。
        </p>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {!initialFinished && (<>

        {/* 总体进度 */}
        <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-cyan-500/5 p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              智能体执行进度
            </span>
            <span className="font-mono text-sm font-semibold text-primary">{progress}%</span>
          </div>
          {/* Custom segmented progress bar */}
          <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/60 ring-1 ring-border/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            {running && (
              <div
                className="absolute inset-y-0 w-16 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                style={{
                  animation: "shimmer 1.6s linear infinite",
                  left: `${Math.max(0, progress - 10)}%`,
                }}
              />
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="font-mono">阶段 {Math.min(Math.max(currentIdx, 0), STEPS.length)} / {STEPS.length}</span>
            {finished && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> 推理完成,已生成可解释评分
              </span>
            )}
          </div>
          <style>{`@keyframes shimmer { 0% { transform: translateX(-200%) skewX(-12deg);} 100% { transform: translateX(800%) skewX(-12deg);} }`}</style>
        </div>

        {/* 步骤时间轴 */}
        <ol className="relative space-y-3 pl-6">
          {/* gradient rail */}
          <div className="absolute left-2 top-1 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-primary/60 via-cyan-400/40 to-transparent" />
          {STEPS.map((step, idx) => {
            const status = statusOf(idx);
            const Icon = step.icon;
            const open = expanded[step.id] ?? false;
            return (
              <li key={step.id} className="relative animate-fade-in">
                <span
                  className={cn(
                    "absolute -left-[26px] top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background transition-all",
                    status === "done" && "border-emerald-500 text-emerald-600 shadow-[0_0_12px_hsl(150_80%_50%/0.5)]",
                    status === "running" && "border-primary text-primary shadow-[0_0_16px_hsl(var(--primary)/0.6)]",
                    status === "pending" && "border-muted-foreground/30 text-muted-foreground/50",
                  )}
                >
                  {status === "done" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : status === "running" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  {status === "running" && (
                    <span className="absolute inset-0 -m-1 rounded-full border border-primary/40 animate-ping" />
                  )}
                </span>
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-lg border bg-card/90 p-3 backdrop-blur-sm transition-all",
                    status === "running" && "border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_8px_24px_-8px_hsl(var(--primary)/0.3)]",
                    status === "done" && "border-emerald-500/30",
                    status === "pending" && "opacity-60",
                  )}
                >
                  {status === "running" && (
                    <div
                      className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                      style={{ animation: "scan 2.2s linear infinite" }}
                    />
                  )}
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 text-left"
                    onClick={() => setExpanded((p) => ({ ...p, [step.id]: !open }))}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          STEP {String(idx + 1).padStart(2, "0")}
                        </span>
                        <Icon className={cn(
                          "h-3.5 w-3.5",
                          status === "done" ? "text-emerald-600" : status === "running" ? "text-primary" : "text-muted-foreground",
                        )} />
                        <span className="text-sm font-semibold">{step.title}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-[10px] uppercase tracking-wider",
                            status === "done" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
                            status === "running" && "border-primary/40 bg-primary/10 text-primary",
                          )}
                        >
                          {status === "done" ? "完成" : status === "running" ? "执行中" : "待执行"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                    {open ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {open && (status === "done" || status === "running") && (
                    <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                      {step.outputs && (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                          {step.outputs.map((o) => (
                            <div
                              key={o.label}
                              className="rounded-md border border-border/60 bg-gradient-to-br from-muted/60 to-muted/20 px-2.5 py-1.5"
                            >
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.label}</div>
                              <div className="font-mono font-semibold text-foreground text-lg">{o.value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="rounded-lg border border-border bg-muted/20">
                        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                            <Activity className="h-3 w-3 text-primary" />
                            执行明细
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            共 {step.logs.length} 条
                          </span>
                        </div>
                        <ul className="divide-y divide-border/50">
                          {step.logs.map((l, i) => (
                            <li key={i} className="flex items-start gap-3 px-3 py-2">
                              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                              </span>
                              <span className="text-[12px] leading-relaxed text-foreground/90">{l}</span>
                            </li>
                          ))}
                          {status === "running" && (
                            <li className="flex items-start gap-3 px-3 py-2 bg-primary/5">
                              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              </span>
                              <span className="text-[12px] leading-relaxed text-primary">
                                正在生成下一条推理记录…
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        </>)}

        {/* 最终结果 */}
        {finished && (

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
        )}

        {/* 薄弱指标提醒 */}
        {finished && <WeakIndicatorsPanel />}

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

function WeakIndicatorsPanel() {
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-warning/40 text-warning hover:bg-warning/10 hover:text-warning"
                    onClick={() => toast.info(`已为「${w.name}」打开补充材料入口`)}
                  >
                    <Upload className="mr-1 h-3 w-3" />
                    补充材料
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
