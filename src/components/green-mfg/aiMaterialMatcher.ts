// AI 材料智能匹配规则（前端 mock）
// 根据文件名关键词匹配「基本要求」和「评价指标」对应的归属。

import type { IndicatorRow } from "./evaluationIndicators";
import type { BasicRequirementItem } from "./DeclarationDetailSections";

export type TargetKind = "indicator" | "basic" | "unmatched" | "archive";

export interface MatchTarget {
  kind: TargetKind;
  /** 指标 id 或 基本要求 no（字符串化） */
  id: string;
  label: string; // 用于下拉显示
  group: string; // 分组（如 一级指标名 / "基本要求"）
}

export interface MaterialFile {
  id: string;
  name: string;
  size: number;
  type: string; // mime / 扩展名简称
  status: "parsing" | "matched" | "ambiguous" | "unmatched" | "archive";
  confidence: number; // 0-100
  target?: MatchTarget; // 已选定的归属
  candidates: MatchTarget[]; // AI 给出的候选（按置信度倒序）
  source: "ai" | "manual";
  createdAt: number;
}

// 关键词 → 指标 id 的规则
const INDICATOR_KEYWORDS: { keywords: string[]; indicatorId: string }[] = [
  { keywords: ["单位产值综合能耗", "综合能耗", "能源购进", "能源消费"], indicatorId: "1" },
  { keywords: ["单位产值碳排放", "碳排放量", "温室气体", "GHG"], indicatorId: "2" },
  { keywords: ["可再生能源", "光伏", "绿电", "绿证", "GEC"], indicatorId: "3-4" },
  { keywords: ["平台截图", "能碳管理", "能源管理系统", "EMS", "看板"], indicatorId: "4" },
  { keywords: ["节约原材料", "回料", "再生材料", "回收"], indicatorId: "5-1" },
  { keywords: ["水耗", "新鲜水", "取水"], indicatorId: "6" },
  { keywords: ["固废", "废物利用率", "综合利用"], indicatorId: "7" },
];

// 关键词 → 基本要求 no 的规则
const BASIC_KEYWORDS: { keywords: string[]; no: number }[] = [
  { keywords: ["营业执照", "信用中国", "执行信息", "失信", "工商"], no: 1 },
  { keywords: ["绿色发展规划", "组织结构", "管理职责", "考核方案", "绿色采购"], no: 2 },
  { keywords: ["ISO9001", "ISO14001", "ISO45001", "ISO50001", "管理手册", "管理体系", "管理评审", "QM-", "ESM-", "EnMS-"], no: 3 },
];

const ARCHIVE_KEYWORDS = ["附件", "备查", "参考", "其他"];

function buildIndicatorTarget(ind: IndicatorRow): MatchTarget {
  return {
    kind: "indicator",
    id: ind.id,
    label: `序号 ${ind.no} · ${ind.l3.length > 28 ? ind.l3.slice(0, 28) + "…" : ind.l3}`,
    group: ind.l1,
  };
}

function buildBasicTarget(no: number): MatchTarget {
  return {
    kind: "basic",
    id: String(no),
    label: `基本要求 · 第 ${no} 条`,
    group: "基本要求",
  };
}

export function buildTargetCatalog(
  indicators: IndicatorRow[],
  basics: BasicRequirementItem[],
): MatchTarget[] {
  const list: MatchTarget[] = [];
  basics.forEach((b) => list.push(buildBasicTarget(b.no)));
  indicators.forEach((i) => list.push(buildIndicatorTarget(i)));
  list.push({ kind: "archive", id: "__archive__", label: "附件备查（不归集到指标）", group: "其他" });
  return list;
}

/** 模拟 AI 匹配：根据文件名规则给出候选 */
export function matchFile(
  fileName: string,
  indicators: IndicatorRow[],
  basics: BasicRequirementItem[],
): { candidates: MatchTarget[]; confidence: number; status: MaterialFile["status"] } {
  const lower = fileName.toLowerCase();
  const hits: { target: MatchTarget; score: number }[] = [];

  for (const rule of BASIC_KEYWORDS) {
    const hit = rule.keywords.filter((k) => lower.includes(k.toLowerCase())).length;
    if (hit > 0) {
      const target = buildBasicTarget(rule.no);
      hits.push({ target, score: 60 + hit * 15 });
    }
  }
  for (const rule of INDICATOR_KEYWORDS) {
    const hit = rule.keywords.filter((k) => lower.includes(k.toLowerCase())).length;
    if (hit > 0) {
      const ind = indicators.find((i) => i.id === rule.indicatorId);
      if (ind) hits.push({ target: buildIndicatorTarget(ind), score: 65 + hit * 12 });
    }
  }

  if (ARCHIVE_KEYWORDS.some((k) => fileName.includes(k))) {
    hits.push({
      target: {
        kind: "archive",
        id: "__archive__",
        label: "附件备查（不归集到指标）",
        group: "其他",
      },
      score: 55,
    });
  }

  if (hits.length === 0) {
    return { candidates: [], confidence: 0, status: "unmatched" };
  }
  hits.sort((a, b) => b.score - a.score);
  const top = Math.min(98, hits[0].score);
  const status: MaterialFile["status"] =
    hits.length > 1 && Math.abs(hits[0].score - hits[1].score) < 10 ? "ambiguous" : "matched";
  return {
    candidates: hits.slice(0, 4).map((h) => h.target),
    confidence: top,
    status,
  };
}

export function fileTypeLabel(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return "PDF";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "图片";
  if (["doc", "docx"].includes(ext)) return "Word";
  if (["xls", "xlsx", "csv"].includes(ext)) return "表格";
  if (["ppt", "pptx"].includes(ext)) return "幻灯片";
  return ext.toUpperCase() || "文件";
}

export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
