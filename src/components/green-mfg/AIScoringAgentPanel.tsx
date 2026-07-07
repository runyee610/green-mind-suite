import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { SCORE_DIMENSIONS } from "./data";

const WEAK_THRESHOLD = 0.9;

interface Suggestion {
  technologies: string[];
  measures: string[];
}

function getSuggestion(name: string): Suggestion {
  if (/能耗|能源消耗|电耗/.test(name)) {
    return {
      technologies: [
        "余热余压回收（ORC 低温发电）",
        "高效永磁同步电机 + 变频改造",
        "智能空压站群控系统",
        "工业热泵替代蒸汽锅炉",
      ],
      measures: [
        "开展第三方能源审计并制定节能改造清单",
        "接入市级能碳管理平台，实现分项计量",
        "签订绿电采购协议，绿电占比 ≥ 30%",
      ],
    };
  }
  if (/碳排|碳足迹|可再生|清洁能源|光伏/.test(name)) {
    return {
      technologies: [
        "屋顶分布式光伏 + 储能微电网",
        "CCUS 碳捕集与再利用",
        "氢能 / 生物质替代化石燃料",
        "低碳制冷剂（R1234ze）替换",
      ],
      measures: [
        "完成 ISO 14064 温室气体核查",
        "编制产品碳足迹（ISO 14067）报告",
        "签订绿证 / 绿电交易合同并公示",
      ],
    };
  }
  if (/水|取水|节水/.test(name)) {
    return {
      technologies: [
        "MVR 蒸发浓缩废水零排",
        "反渗透（RO）+ EDI 中水回用",
        "闭式循环冷却塔",
        "雨水收集回用系统",
      ],
      measures: [
        "开展水平衡测试并建立节水台账",
        "申报省级节水型企业认定",
        "对高耗水工序设定单耗考核指标",
      ],
    };
  }
  if (/固废|污染|排放浓度|VOCs|废气/.test(name)) {
    return {
      technologies: [
        "VOCs RTO 蓄热焚烧",
        "SCR 脱硝 + 湿电除尘超低排放",
        "危废在线监控（视频 + 电子联单）",
        "固废资源化（水泥窑协同处置）",
      ],
      measures: [
        "接入生态环境局在线监测平台",
        "签订固废综合利用合同并归档",
        "开展清洁生产审核并公示报告",
      ],
    };
  }
  if (/绿色设计|绿色产品|产品/.test(name)) {
    return {
      technologies: [
        "LCA 全生命周期评价工具",
        "可再生 / 可回收材料替代设计",
        "绿色包装（减量化 / 单一材质）",
        "模块化易拆解结构设计",
      ],
      measures: [
        "编制绿色设计产品自评报告",
        "申请中国环境标志（十环）认证",
        "披露产品环境声明（EPD）",
      ],
    };
  }
  if (/工艺|设备|改造/.test(name)) {
    return {
      technologies: [
        "淘汰高耗能落后设备（一级能效替换）",
        "机器人 + MES 精益产线改造",
        "干法 / 少水化清洁工艺",
        "3D 打印近净成形减材制造",
      ],
      measures: [
        "编制绿色低碳改造方案并申报专项资金",
        "对比改造前后单位产品能耗 / 排放",
        "纳入工信部绿色工艺推广目录跟踪",
      ],
    };
  }
  if (/管理|平台|系统|信息化/.test(name)) {
    return {
      technologies: [
        "EMS 能源管理系统（GB/T 23331）",
        "数字孪生能碳看板",
        "AI 能效优化算法（负荷预测）",
        "移动端巡检 + 电子工单",
      ],
      measures: [
        "通过 ISO 50001 能源管理体系认证",
        "接入市级绿色制造公共服务平台",
        "设立能源管理岗与月度考核机制",
      ],
    };
  }
  if (/土地|用地|容积/.test(name)) {
    return {
      technologies: [
        "多层厂房 / 立体仓储改造",
        "屋顶光伏一体化（BIPV）",
        "地下管廊集约布置",
      ],
      measures: [
        "复核容积率与建筑系数并优化布局",
        "闲置土地二次开发或转让",
        "申报「亩均论英雄」绩效评价",
      ],
    };
  }
  return {
    technologies: ["引入行业先进节能减排技术", "对标同行业绿色工厂标杆"],
    measures: [
      "补充对应指标的证明材料与台账",
      "开展专项诊断并制定整改计划",
    ],
  };
}


const DIMENSIONS = [
  { l: "能源低碳化", v: 22.5, m: 25 },
  { l: "资源高效化", v: 18.5, m: 20 },
  { l: "生产洁净化", v: 18.0, m: 20 },
  { l: "产品绿色化", v: 13.5, m: 15 },
  { l: "用地集约化", v: 18.5, m: 20 },
];

export function AIScoringAgentPanel() {
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
            <span className="font-semibold">AI 打分结果</span>
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/5 font-mono text-[10px] uppercase tracking-wider text-primary"
            >
              <Sparkles className="mr-1 h-3 w-3" />
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
        <WeakIndicatorsPanel />
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
