import { useMemo } from "react";
import { CheckCircle2, Clock, FileDown, History as HistoryIcon, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { enterpriseStatusStyle, sortStandardCodes, type QuotaEnterprise } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

export interface HistoryEntry {
  cyclePeriod: string;        // 例 202501-202512
  year: number;
  status: "已完成" | "已驳回" | "未填报";
  standardCodes: string[];
  reportedAt?: string;        // 提交时间
  auditedAt?: string;         // 审核时间
  auditor?: string;
  unitEnergy?: number;        // 主要单耗（吨标煤/吨）
  limit?: number;             // 当年限额
  comment?: string;           // 审核意见
}

// 基于企业生成稳定的历史数据
function buildHistory(enterprise: QuotaEnterprise): HistoryEntry[] {
  const seedSum = enterprise.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const codes = sortStandardCodes(enterprise.standardCodes);
  const baseLimit = 0.6 + (seedSum % 35) / 100; // 0.60 - 0.95
  const years = [2025, 2024, 2023, 2022, 2021];
  return years.map((year, idx) => {
    const drift = ((seedSum + year) % 9) / 100; // 0 - 0.08
    const limit = +(baseLimit + (4 - idx) * 0.01).toFixed(3);
    const unitEnergy = +(limit - 0.04 + drift).toFixed(3);
    const exceeded = unitEnergy > limit;
    const skipped = (seedSum + year) % 11 === 0; // 偶发未填报
    if (skipped && idx === years.length - 1) {
      return {
        cyclePeriod: `${year}01-${year}12`,
        year,
        status: "未填报",
        standardCodes: codes,
      };
    }
    const rejected = exceeded && (seedSum + year) % 5 === 0;
    return {
      cyclePeriod: `${year}01-${year}12`,
      year,
      status: rejected ? "已驳回" : "已完成",
      standardCodes: codes,
      reportedAt: `${year + 1}-02-${String(10 + (seedSum % 18)).padStart(2, "0")}`,
      auditedAt: `${year + 1}-03-${String(5 + (seedSum % 22)).padStart(2, "0")}`,
      auditor: ["张审核", "李审核", "王审核"][idx % 3],
      unitEnergy,
      limit,
      comment: rejected ? "单位产品能耗超出限额，请补充节能改造方案后重新提交" : undefined,
    };
  });
}

interface Props {
  enterprise: QuotaEnterprise | null;
  onClose: () => void;
  onViewDetail?: (entry: HistoryEntry) => void;
}

export function EnterpriseHistoryDialog({ enterprise, onClose, onViewDetail }: Props) {
  const history = useMemo(() => (enterprise ? buildHistory(enterprise) : []), [enterprise]);

  const stats = useMemo(() => {
    const submitted = history.filter((h) => h.status !== "未填报");
    const completed = history.filter((h) => h.status === "已完成").length;
    const rejected = history.filter((h) => h.status === "已驳回").length;
    const compliant = submitted.filter((h) => h.unitEnergy !== undefined && h.limit !== undefined && h.unitEnergy <= h.limit).length;
    return { total: history.length, completed, rejected, compliant, submitted: submitted.length };
  }, [history]);

  if (!enterprise) return null;

  return (
    <Dialog open={!!enterprise} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <HistoryIcon className="h-4 w-4 text-primary" />
            历史申报记录
            <span className="text-sm font-normal text-muted-foreground">— {enterprise.name}</span>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="font-mono text-foreground/80">{enterprise.creditCode}</span>
            <span className="text-muted-foreground">{enterprise.industry}</span>
          </DialogDescription>
        </DialogHeader>

        {/* 统计 */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">历史周期</div>
            <div className="font-mono text-lg font-semibold text-foreground">{stats.total}</div>
          </div>
          <div className="rounded-md border border-success/30 bg-success/5 px-3 py-2">
            <div className="text-[11px] text-success/80">通过审核</div>
            <div className="font-mono text-lg font-semibold text-success">{stats.completed}</div>
          </div>
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
            <div className="text-[11px] text-destructive/80">驳回次数</div>
            <div className="font-mono text-lg font-semibold text-destructive">{stats.rejected}</div>
          </div>
          <div className="rounded-md border border-info/30 bg-info/5 px-3 py-2">
            <div className="text-[11px] text-info/80">达标率</div>
            <div className="font-mono text-lg font-semibold text-info">
              {stats.submitted > 0 ? Math.round((stats.compliant / stats.submitted) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* 历史表 */}
        <ScrollArea className="max-h-[420px] rounded-md border border-border/60">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-32">限额周期</TableHead>
                <TableHead className="w-24">状态</TableHead>
                <TableHead className="w-44">适用标准</TableHead>
                <TableHead className="w-40">单耗 / 限额</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => {
                const style = enterpriseStatusStyle[h.status];
                const exceeded = h.unitEnergy !== undefined && h.limit !== undefined && h.unitEnergy > h.limit;
                return (
                  <TableRow key={h.cyclePeriod} className="border-border/40">
                    <TableCell className="font-mono text-xs text-foreground">{h.cyclePeriod}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
                        style.badge,
                      )}>
                        {h.status === "已完成" && <CheckCircle2 className="h-3 w-3" />}
                        {h.status === "已驳回" && <XCircle className="h-3 w-3" />}
                        {h.status === "未填报" && <Clock className="h-3 w-3" />}
                        {h.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        {h.standardCodes.map((c) => (
                          <Badge
                            key={c}
                            variant="outline"
                            className={cn(
                              "font-mono text-[10px] font-medium",
                              c.startsWith("GB")
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-warning/40 bg-warning/10 text-warning",
                            )}
                          >
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {h.unitEnergy !== undefined ? (
                        <div className="flex items-center gap-1.5">
                          <span className={cn("font-semibold", exceeded ? "text-destructive" : "text-success")}>
                            {h.unitEnergy}
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-foreground">{h.limit}</span>
                          {exceeded ? (
                            <TrendingUp className="h-3 w-3 text-destructive" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-success" />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
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
