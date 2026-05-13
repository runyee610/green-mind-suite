import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "pending" | "running" | "done";

interface AgentStep {
  id: string;
  title: string;
  desc: string;
  icon: typeof Bot;
  /** 详细日志/中间产物 */
  logs: string[];
  /** 该阶段输出的关键数据/计算结果 */
  outputs?: { label: string; value: string }[];
}

const STEPS: AgentStep[] = [
  {
    id: "ingest",
    title: "证明材料解析",
    desc: "OCR + 版面理解，识别 PDF / 图片中的关键字段",
    icon: FileSearch,
    logs: [
      "扫描《2024年综合能耗统计表》(PDF, 12页) ... ✓",
      "扫描《单位产品能耗台账》(PDF, 8页) ... ✓",
      "OCR 识别图片证据 8 张，平均置信度 96.2%",
      "版面解析提取表格 14 张，命中关键指标 38 项",
    ],
    outputs: [
      { label: "解析文件", value: "16 份" },
      { label: "提取字段", value: "238 个" },
      { label: "OCR 平均置信度", value: "96.2%" },
    ],
  },
  {
    id: "extract",
    title: "结构化数据提取",
    desc: "按指标体系映射字段，构建标准化数据集",
    icon: Database,
    logs: [
      "映射《GB/T 36132-2018 绿色工厂评价通则》指标 24 项 ... ✓",
      "提取能源消耗：电 1,825 万 kWh / 天然气 86 万 m³ / 蒸汽 4,200 t",
      "提取产值：4.82 亿元 / 综合能耗 6,138 tce",
      "提取水资源：取水量 18.6 万 m³ / 中水回用 4.2 万 m³",
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
      "清洁能源占比 = (光伏 +外购绿电) / 总用电 = 28.6%",
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
      "对照《电线电缆行业能耗限额》先进值 1,200 tce/亿元 → 当前 1,273.4，达基准值",
      "对照行业绿电占比平均值 21.8% → 当前 28.6%，优于平均",
      "与 2023 年同口径对比：综合能耗 ↓ 4.7%，单位能耗 ↓ 6.1%",
      "数据一致性校验：12 项过审 / 0 项异常",
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
      "基础设施：18.0 / 20",
      "管理体系：14.5 / 15",
      "能源与资源投入：22.0 / 25",
      "产品：8.5 / 10",
      "环境排放：9.5 / 10",
      "绩效：18.5 / 20",
    ],
    outputs: [
      { label: "总分(权重加权)", value: "91.0 / 100" },
      { label: "AI 建议", value: "建议申报" },
    ],
  },
];

export function AIScoringAgentPanel() {
  const [running, setRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 = not started, length = done
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const finished = currentIdx >= STEPS.length;
  const progress = useMemo(() => {
    if (currentIdx < 0) return 0;
    if (finished) return 100;
    return Math.round(((currentIdx + 0.5) / STEPS.length) * 100);
  }, [currentIdx, finished]);

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

  const start = () => {
    setCurrentIdx(0);
    setExpanded({});
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

  return (
    <Card id="ai-scoring" className="panel scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>
            <Bot className="mr-1 inline h-4 w-4 text-primary" />
            五、AI 打分智能体
          </span>
          <div className="flex items-center gap-2">
            {currentIdx >= 0 && (
              <Button size="sm" variant="ghost" onClick={reset}>
                <RotateCw className="mr-1 h-3.5 w-3.5" />重置
              </Button>
            )}
            <Button
              size="sm"
              className="bg-gradient-primary text-primary-foreground"
              onClick={start}
              disabled={running}
            >
              {running ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />运行中
                </>
              ) : (
                <>
                  <Play className="mr-1 h-3.5 w-3.5" />
                  {finished ? "重新运行" : "启动 AI 打分"}
                </>
              )}
            </Button>
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          AI 智能体自动串联「材料解析 → 数据提取 → 公式计算 → 标杆对照 → 维度打分」全流程，过程透明可追溯。
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 总体进度 */}
        <div className="rounded-md border border-border/60 bg-muted/20 p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">整体进度</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>步骤 {Math.min(Math.max(currentIdx, 0), STEPS.length)} / {STEPS.length}</span>
            {finished && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> 流程已完成，已生成 AI 建议得分
              </span>
            )}
          </div>
        </div>

        {/* 步骤时间轴 */}
        <ol className="relative space-y-3 border-l-2 border-border/60 pl-5">
          {STEPS.map((step, idx) => {
            const status = statusOf(idx);
            const Icon = step.icon;
            const open = expanded[step.id] ?? false;
            return (
              <li key={step.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border-2 bg-background",
                    status === "done" && "border-emerald-500 text-emerald-600",
                    status === "running" && "border-primary text-primary",
                    status === "pending" && "border-muted-foreground/30 text-muted-foreground/60",
                  )}
                >
                  {status === "done" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : status === "running" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                </span>
                <div
                  className={cn(
                    "rounded-md border bg-card p-3 transition-colors",
                    status === "running" && "border-primary/40 shadow-sm",
                    status === "pending" && "opacity-70",
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 text-left"
                    onClick={() => setExpanded((p) => ({ ...p, [step.id]: !open }))}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{step.title}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            status === "done" && "border-emerald-500/40 text-emerald-600",
                            status === "running" && "border-primary/40 text-primary",
                          )}
                        >
                          {status === "done" ? "完成" : status === "running" ? "执行中" : "待执行"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                    {open ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {open && (status === "done" || status === "running") && (
                    <div className="mt-3 space-y-2 border-t border-border/50 pt-2">
                      {step.outputs && (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                          {step.outputs.map((o) => (
                            <div
                              key={o.label}
                              className="rounded-md bg-muted/40 px-2 py-1.5"
                            >
                              <div className="text-[10px] text-muted-foreground">{o.label}</div>
                              <div className="font-mono text-xs">{o.value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <ul className="space-y-1 rounded-md bg-muted/30 p-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                        {step.logs.map((l, i) => (
                          <li key={i}>· {l}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* 最终结果 */}
        {finished && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" /> AI 综合评分结果
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { l: "基础设施", v: "18.0/20" },
                { l: "管理体系", v: "14.5/15" },
                { l: "能源与资源", v: "22.0/25" },
                { l: "产品", v: "8.5/10" },
                { l: "环境排放", v: "9.5/10" },
                { l: "绩效", v: "18.5/20" },
              ].map((d) => (
                <div key={d.l} className="rounded-md bg-background/70 px-3 py-2">
                  <div className="text-[11px] text-muted-foreground">{d.l}</div>
                  <div className="font-mono text-sm">{d.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-primary/20 pt-3">
              <div>
                <span className="text-xs text-muted-foreground">AI 建议总分</span>
                <span className="ml-2 font-mono text-lg font-semibold text-primary">91.0</span>
                <span className="ml-1 text-xs text-muted-foreground">/ 100</span>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">
                建议提交自评价
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
