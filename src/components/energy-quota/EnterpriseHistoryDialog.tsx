import { useMemo } from "react";
import { FileDown, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sortStandardCodes, type QuotaEnterprise } from "@/components/energy-quota/quotaData";
import { StandardScopeDialog } from "@/components/energy-quota/StandardScopeDialog";
import { cn } from "@/lib/utils";

type Conclusion = "达到先进值" | "达到准入值" | "达到限定值" | "未达标";

export interface HistoryEntry {
  cyclePeriod: string;
  year: number;
  status: "已完成" | "已驳回" | "未填报";
  standardCodes: string[];
  products: string[];
  unitEnergy?: number;     // 单耗（kgce/单位产品）
  carbonIntensity?: number; // 单位产品碳强度（kgCO₂/单位产品）
  conclusion?: Conclusion;
  reportedAt?: string;
  auditedAt?: string;
  auditor?: string;
  comment?: string;
}

const CONCLUSION_LEVELS: Conclusion[] = ["达到先进值", "达到准入值", "达到限定值", "未达标"];

const conclusionStyle: Record<Conclusion, string> = {
  达到先进值: "border-success/40 bg-success/10 text-success",
  达到准入值: "border-info/40 bg-info/10 text-info",
  达到限定值: "border-warning/40 bg-warning/10 text-warning",
  未达标: "border-destructive/40 bg-destructive/10 text-destructive",
};

// 行业 → 申报产品候选
function getProductsByIndustry(industry: string, seed: number): string[] {
  const map: Record<string, string[]> = {
    "供水": ["自来水", "深度处理水", "再生水"],
    "钢铁": ["粗钢", "热轧板", "冷轧板"],
    "水泥": ["熟料", "P·O 42.5 水泥", "P·C 32.5 水泥"],
    "化工": ["合成氨", "甲醇", "烧碱"],
    "电力": ["发电量", "供热量"],
    "造纸": ["新闻纸", "包装纸"],
    "玻璃": ["浮法玻璃", "深加工玻璃"],
  };
  const matched = Object.entries(map).find(([k]) => industry.includes(k));
  const pool = matched ? matched[1] : ["主要产品 A", "主要产品 B"];
  const n = (seed % 2) + 1; // 1-2 个产品
  return pool.slice(0, n);
}

function buildHistory(enterprise: QuotaEnterprise): HistoryEntry[] {
  const seedSum = enterprise.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const codes = sortStandardCodes(enterprise.standardCodes);
  const products = getProductsByIndustry(enterprise.industry, seedSum);
  const years = [2025, 2024, 2023, 2022, 2021];
  return years.map((year, idx) => {
    const skipped = (seedSum + year) % 11 === 0;
    if (skipped && idx === years.length - 1) {
      return {
        cyclePeriod: `${year}01-${year}12`,
        year,
        status: "未填报",
        standardCodes: codes,
        products,
      };
    }
    const rejected = (seedSum + year) % 13 === 0;
    const conclusion = rejected
      ? undefined
      : CONCLUSION_LEVELS[(seedSum + year) % CONCLUSION_LEVELS.length];
    // 单耗与碳强度：基于种子稳定派生
    const unitEnergy = Number((0.4 + ((seedSum + year) % 25) / 100).toFixed(3));
    const carbonIntensity = Number((unitEnergy * 2.66 + ((seedSum + year) % 7) / 100).toFixed(3));
    return {
      cyclePeriod: `${year}01-${year}12`,
      year,
      status: rejected ? "已驳回" : "已完成",
      standardCodes: codes,
      products,
      unitEnergy,
      carbonIntensity,
      conclusion,
      reportedAt: `${year + 1}-02-${String(10 + (seedSum % 18)).padStart(2, "0")}`,
      auditedAt: `${year + 1}-03-${String(5 + (seedSum % 22)).padStart(2, "0")}`,
      auditor: ["张审核", "李审核", "王审核"][idx % 3],
      comment: rejected ? "数据存在异常，请核实后重新提交" : undefined,
    };
  });
}

interface Props {
  enterprise: QuotaEnterprise | null;
  onClose: () => void;
  onViewDetail?: (entry: HistoryEntry) => void;
}

export function EnterpriseHistoryDialog({ enterprise, onClose }: Props) {
  const history = useMemo(() => (enterprise ? buildHistory(enterprise) : []), [enterprise]);

  const stats = useMemo(() => {
    const total = history.length;
    const completed = history.filter((h) => h.status === "已完成").length;
    const advance = history.filter((h) => h.conclusion === "达到先进值").length;
    const compliant = history.filter(
      (h) => h.conclusion && h.conclusion !== "未达标",
    ).length;
    const complianceRate = completed > 0 ? Math.round((compliant / completed) * 100) : 0;
    return { total, advance, complianceRate };
  }, [history]);

  if (!enterprise) return null;

  return (
    <Dialog open={!!enterprise} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <HistoryIcon className="h-4 w-4 text-primary" />
            历史提交记录
            <span className="text-sm font-normal text-muted-foreground">— {enterprise.name}</span>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="font-mono text-foreground/80">{enterprise.creditCode}</span>
            <span className="text-muted-foreground">{enterprise.industry}</span>
          </DialogDescription>
        </DialogHeader>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">历史周期</div>
            <div className="font-mono text-lg font-semibold text-foreground">{stats.total}</div>
          </div>
          <div className="rounded-md border border-info/30 bg-info/5 px-3 py-2">
            <div className="text-[11px] text-info/80">达到先进值</div>
            <div className="font-mono text-lg font-semibold text-info">{stats.advance}</div>
          </div>
          <div className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2">
            <div className="text-[11px] text-warning/80">达标率</div>
            <div className="font-mono text-lg font-semibold text-warning">{stats.complianceRate}%</div>
          </div>
        </div>

        {/* 历史表 */}
        <ScrollArea className="max-h-[420px] rounded-md border border-border/60">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-32">限额周期</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-28">结论</TableHead>
                <TableHead className="w-40">适用标准</TableHead>
                <TableHead className="w-32">产品</TableHead>
                <TableHead className="w-28">单耗</TableHead>
                <TableHead className="w-36">单位产品碳强度</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.cyclePeriod} className="border-border/40">
                  <TableCell className="font-mono text-xs text-foreground">{h.cyclePeriod}</TableCell>
                  <TableCell className="text-xs text-foreground">{h.status}</TableCell>
                  <TableCell>
                    {h.conclusion ? (
                      <Badge variant="outline" className={cn("font-medium", conclusionStyle[h.conclusion])}>
                        {h.conclusion}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-0.5">
                      {h.standardCodes.map((c) => (
                        <span key={c} className="inline-flex items-center gap-1">
                          <span className="font-mono text-[11px] text-foreground">{c}</span>
                          <StandardScopeDialog code={c} />
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {h.products.map((p) => (
                        <span key={p} className="text-[11px] text-foreground">{p}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">
                    {h.unitEnergy != null ? `${h.unitEnergy} kgce/t` : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">
                    {h.carbonIntensity != null ? `${h.carbonIntensity} kgCO₂/t` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">
            最近 {history.length} 个限额周期 · 按年份倒序展示
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success(`已导出 ${enterprise.name} 历史申报报告`)}
          >
            <FileDown className="mr-1 h-4 w-4" />导出历史报告
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
