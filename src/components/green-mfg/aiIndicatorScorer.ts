import type { IndicatorRow, ProductEnergyEntry } from "./evaluationIndicators";
import { PLATFORM_FUNCTION_OPTIONS } from "./evaluationIndicators";

export type AIScoringOverwrite = "empty" | "all";

const parseNum = (s?: string): number | null => {
  if (!s) return null;
  const m = String(s).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

const formatNum = (n: number, decimals = 2) => {
  const fixed = n.toFixed(decimals);
  return fixed.replace(/\.?0+$/, "");
};

/** 在 [a, b] 之间生成偏向 t 的随机值（t=0 接近 a，t=1 接近 b） */
const randBetween = (a: number, b: number, t = 0.6) => {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const center = lo + (hi - lo) * t;
  const span = (hi - lo) * 0.35;
  return Math.max(lo - span * 0.2, Math.min(hi + span * 0.2, center + (Math.random() - 0.5) * span));
};

interface AIComputed {
  reportValue?: string;
  products?: ProductEnergyEntry[];
  platformFunctions?: string[];
  score: number;
  weak: boolean;
  reason: string;
  suggestedProofs?: string[];
}

const PROOF_TIPS: Record<string, string[]> = {
  能耗: ["近一年分月能耗台账", "能源审计报告", "重点用能设备清单"],
  碳: ["温室气体核算报告", "碳排放第三方核查报告"],
  水: ["取水许可证", "近一年用水台账"],
  环境: ["ISO 14001 认证证书", "环境管理手册"],
  能源: ["GB/T 23331 能源管理体系认证", "能源管理制度文件"],
  职业: ["ISO 45001 认证证书"],
  质量: ["ISO 9001 认证证书"],
  固废: ["危险废物处置合同", "一般工业固废台账"],
};

const guessSuggestedProofs = (row: IndicatorRow): string[] => {
  const text = `${row.l1} ${row.l2} ${row.l3}`;
  const hits: string[] = [];
  Object.entries(PROOF_TIPS).forEach(([k, list]) => {
    if (text.includes(k)) hits.push(...list);
  });
  if (hits.length === 0) hits.push("相关制度文件、台账或第三方报告");
  return Array.from(new Set(hits)).slice(0, 3);
};

const computeOne = (row: IndicatorRow, overwrite: AIScoringOverwrite): AIComputed => {
  const hasProof = (row.proofs?.length ?? 0) > 0;
  const proofPenalty = hasProof ? 0 : 18;
  const suggested = hasProof ? undefined : guessSuggestedProofs(row);

  // 序号 4：能碳管理系统平台功能
  if (row.id === "4") {
    const existing = row.platformFunctions ?? [];
    if (overwrite === "empty" && existing.length > 0) {
      const score = Math.min(100, 55 + existing.length * 4) - proofPenalty;
      return {
        score,
        weak: score < 60 || !hasProof,
        reason: !hasProof ? "缺少平台功能验证截图/合同" : existing.length < 6 ? "符合平台功能项偏少" : "已较好覆盖关键功能",
        suggestedProofs: suggested,
      };
    }
    // 随机勾选 5-10 项
    const total = PLATFORM_FUNCTION_OPTIONS.length;
    const pickN = 5 + Math.floor(Math.random() * 6);
    const idxs = Array.from({ length: total }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, pickN)
      .sort((a, b) => a - b);
    const picked = idxs.map((i) => PLATFORM_FUNCTION_OPTIONS[i]);
    const score = Math.min(100, 55 + pickN * 4) - proofPenalty;
    return {
      reportValue: String(picked.length),
      platformFunctions: picked,
      score,
      weak: score < 60 || !hasProof,
      reason: !hasProof ? "缺少平台功能验证截图/合同" : pickN < 6 ? `仅识别 ${pickN} 项符合，建议补充截图证明更多功能` : `已覆盖 ${pickN} 项平台功能`,
      suggestedProofs: suggested,
    };
  }

  // 序号 1 / 6：产品分项
  if ((row.no === 1 || row.no === 6) && row.hasStandard === "有") {
    const products = (row.products ?? []).map((p) => {
      if (overwrite === "empty" && p.reportValue) return { ...p };
      const lead = parseNum(p.leadValue);
      const base = parseNum(p.baseValue);
      if (lead != null && base != null) {
        const v = randBetween(base, lead, 0.55);
        return { ...p, reportValue: formatNum(v, 3) };
      }
      return { ...p };
    });
    // 评分：以平均接近引领值的程度
    const ratios: number[] = [];
    products.forEach((p) => {
      const v = parseNum(p.reportValue);
      const lead = parseNum(p.leadValue);
      const base = parseNum(p.baseValue);
      if (v != null && lead != null && base != null && lead !== base) {
        // 逆向：越小越好（能耗/取水）
        const r = (base - v) / (base - lead);
        ratios.push(Math.max(0, Math.min(1, r)));
      }
    });
    const avg = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0.5;
    const score = Math.round(40 + avg * 55) - proofPenalty;
    const weak = score < 60 || !hasProof;
    return {
      products,
      score,
      weak,
      reason: !hasProof
        ? "尚未上传单位产品能耗/取水台账"
        : avg < 0.4
          ? "多个产品指标值未达基准值，建议核查能耗/取水统计口径"
          : avg > 0.8
            ? "多数产品已接近引领值水平"
            : "部分产品指标值偏弱，建议补充节能/节水改造证明",
      suggestedProofs: suggested,
    };
  }

  // 单选 / 评估等级
  if (row.reportOptions && row.reportOptions.length > 0) {
    if (overwrite === "empty" && row.reportValue) {
      const idx = row.reportOptions.indexOf(row.reportValue);
      const rel = idx >= 0 ? idx / Math.max(1, row.reportOptions.length - 1) : 0.5;
      const score = Math.round(50 + (1 - rel) * 45) - proofPenalty;
      return {
        score,
        weak: score < 60 || !hasProof,
        reason: !hasProof ? "未上传对应证明材料" : idx > 0 ? "选项档次偏低，建议提升管理水平" : "已达最佳档",
        suggestedProofs: suggested,
      };
    }
    // 随机偏向高档（index 0 为最佳）
    const r = Math.random();
    const pickIdx = r < 0.55 ? 0 : r < 0.85 ? 1 : Math.min(row.reportOptions.length - 1, 2);
    const picked = row.reportOptions[pickIdx];
    const rel = pickIdx / Math.max(1, row.reportOptions.length - 1);
    const score = Math.round(55 + (1 - rel) * 40) - proofPenalty;
    return {
      reportValue: picked,
      score,
      weak: score < 60 || !hasProof || pickIdx > 0,
      reason: !hasProof
        ? "尚未上传对应证明材料，建议补充制度/认证文件"
        : pickIdx === 0
          ? "AI 评估已达最佳档次"
          : `当前档次为「${picked}」，距最佳档仍有差距`,
      suggestedProofs: suggested,
    };
  }

  // 定量：通用
  const lead = parseNum(row.leadValue);
  const base = parseNum(row.baseValue);
  if (lead != null && base != null && lead !== base) {
    const keepExisting = overwrite === "empty" && row.reportValue && row.reportValue.trim();
    const isReverse = row.type === "逆向定量" || base > lead;
    const v = keepExisting ? parseNum(row.reportValue)! : randBetween(base, lead, 0.55);
    // 与基准/引领的比例
    let r: number;
    if (isReverse) r = (base - v) / (base - lead);
    else r = (v - base) / (lead - base);
    r = Math.max(-0.2, Math.min(1.1, r));
    const score = Math.round(45 + r * 50) - proofPenalty;
    return {
      reportValue: keepExisting ? row.reportValue : formatNum(v, 3),
      score,
      weak: score < 60 || !hasProof || r < 0.4,
      reason: !hasProof
        ? "缺少证明材料，结果可信度低"
        : r < 0
          ? `当前值未达基准值（${row.baseValue}${row.unit ?? ""}）`
          : r < 0.4
            ? "刚刚达到基准值，距引领值仍有差距"
            : r >= 0.9
              ? "已达到/优于引领值水平"
              : "处于基准值与引领值之间，表现中上",
      suggestedProofs: suggested,
    };
  }

  // 正向定性：默认文本
  if (overwrite === "empty" && row.reportValue) {
    const score = 75 - proofPenalty;
    return {
      score,
      weak: score < 60 || !hasProof,
      reason: hasProof ? "已具备相应证明" : "建议补充证明材料",
      suggestedProofs: suggested,
    };
  }
  const score = 70 + Math.floor(Math.random() * 20) - proofPenalty;
  return {
    reportValue: "",
    score,
    weak: score < 60 || !hasProof,
    reason: !hasProof ? "缺少制度文件、台账等证明" : "AI 已根据材料生成描述，请人工复核",
    suggestedProofs: suggested,
  };
};

export interface AIScoringResult {
  rows: IndicatorRow[];
  total: number;
  filled: number;
  weak: number;
  topSuggestions: { id: string; l3: string; reason: string; suggestedProofs: string[] }[];
}

export async function runAIScoring(
  rows: IndicatorRow[],
  opts: { overwrite?: AIScoringOverwrite } = {},
): Promise<AIScoringResult> {
  const overwrite = opts.overwrite ?? "all";
  // 模拟 1.5s 分析延迟
  await new Promise((r) => setTimeout(r, 1500));
  const filledAt = new Date().toISOString();
  let filledCount = 0;
  let weakCount = 0;
  const next: IndicatorRow[] = rows.map((row) => {
    const c = computeOne(row, overwrite);
    const patch: Partial<IndicatorRow> = {
      aiMeta: {
        score: Math.max(0, Math.min(100, Math.round(c.score))),
        weak: c.weak,
        reason: c.reason,
        suggestedProofs: c.suggestedProofs,
        filledAt,
      },
    };
    if (c.reportValue !== undefined) patch.reportValue = c.reportValue;
    if (c.platformFunctions) patch.platformFunctions = c.platformFunctions;
    if (c.products) patch.products = c.products;
    if (patch.reportValue || patch.platformFunctions || patch.products) filledCount += 1;
    if (c.weak) weakCount += 1;
    return { ...row, ...patch };
  });
  const topSuggestions = next
    .filter((r) => r.aiMeta?.weak && r.aiMeta?.suggestedProofs?.length)
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      l3: r.l3,
      reason: r.aiMeta!.reason,
      suggestedProofs: r.aiMeta!.suggestedProofs ?? [],
    }));
  return { rows: next, total: next.length, filled: filledCount, weak: weakCount, topSuggestions };
}
