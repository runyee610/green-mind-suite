import { useMemo } from "react";
import { CircleDollarSign, Wallet, CheckCircle2, FileText, Download, Building2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRole } from "@/contexts/RoleContext";
import {
  disbursements, findEnterprise, findPolicy, CURRENT_ENTERPRISE_ID, getEntDisbursements,
  type DisburseStage,
} from "@/components/direct-benefit/directBenefitData";
import { cn } from "@/lib/utils";

const stageStyle: Record<DisburseStage, { badge: string; dot: string }> = {
  "已核准": { badge: "border-info/40 bg-info/10 text-info", dot: "bg-info" },
  "财政划拨中": { badge: "border-warning/40 bg-warning/10 text-warning", dot: "bg-warning" },
  "已到账": { badge: "border-success/40 bg-success/10 text-success", dot: "bg-success" },
};

const STAGES: DisburseStage[] = ["已核准", "财政划拨中", "已到账"];

export default function DirectBenefitDisburse() {
  const { role } = useRole();
  const list = useMemo(
    () => (role === "gov" ? disbursements : getEntDisbursements(CURRENT_ENTERPRISE_ID)),
    [role],
  );

  const totalAmount = list.reduce((s, d) => s + d.amount, 0);
  const arrived = list.filter((d) => d.stage === "已到账");
  const arrivedAmount = arrived.reduce((s, d) => s + d.amount, 0);

  return (
    <AppLayout hideHeader>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {role === "gov" ? "资金拨付" : "资金到账"}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {role === "gov"
              ? "跟踪企业确认后的财政直达拨付流程，全程留痕。"
              : "查看您已确认申领的资金拨付进度与到账凭证。"}
          </p>
        </div>

        {/* 概览 */}
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="拨付总笔数" value={list.length} icon={CircleDollarSign} />
          <KpiCard label="拨付总金额" value={`${totalAmount} 万`} icon={Wallet} tone="primary" />
          <KpiCard label="已到账" value={`${arrivedAmount} 万 / ${arrived.length} 笔`} icon={CheckCircle2} tone="success" />
        </div>

        {/* 拨付清单 */}
        {role === "gov" ? (
          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>企业</TableHead>
                    <TableHead>政策</TableHead>
                    <TableHead className="w-24">金额</TableHead>
                    <TableHead className="w-28">阶段</TableHead>
                    <TableHead>最新时间</TableHead>
                    <TableHead className="w-32">凭证</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((d) => {
                    const e = findEnterprise(d.enterpriseId);
                    const p = findPolicy(d.policyId);
                    const latest = d.timeline[d.timeline.length - 1];
                    const s = stageStyle[d.stage];
                    return (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{e?.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{e?.bank.account}</div>
                        </TableCell>
                        <TableCell className="text-xs">{p?.name}</TableCell>
                        <TableCell><span className="font-mono text-sm font-semibold text-warning">{d.amount} 万</span></TableCell>
                        <TableCell>
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", s.badge)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                            {d.stage}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{latest.time}</TableCell>
                        <TableCell>
                          {d.voucherNo ? (
                            <Button variant="ghost" size="sm" onClick={() => toast.info(`下载凭证 ${d.voucherNo}`)}>
                              <Download className="mr-1 h-3.5 w-3.5" />{d.voucherNo}
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">未生成</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          // 企业侧：每笔展开时间轴
          <div className="space-y-3">
            {list.map((d) => {
              const p = findPolicy(d.policyId);
              const currentIdx = STAGES.indexOf(d.stage);
              return (
                <Card key={d.id} className="border-border/60">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground">{p?.name}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{p?.docNo} · {p?.issuer}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-2xl font-bold text-warning">{d.amount}</div>
                        <div className="text-[10px] text-muted-foreground">万元</div>
                      </div>
                    </div>

                    {/* 横向进度 */}
                    <ol className="mt-4 grid grid-cols-3 gap-0">
                      {STAGES.map((stage, i) => {
                        const done = i <= currentIdx;
                        const record = d.timeline.find((t) => t.stage === stage);
                        return (
                          <li key={stage} className="relative flex flex-col items-center text-center">
                            {i < STAGES.length - 1 && (
                              <span className={cn("absolute left-1/2 right-0 top-3 h-0.5 -translate-y-1/2", i < currentIdx ? "bg-success" : "bg-border/60")} />
                            )}
                            <span className={cn(
                              "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2",
                              done ? "border-success bg-success text-success-foreground" : "border-border bg-background text-muted-foreground",
                            )}>
                              <CheckCircle2 className="h-3 w-3" />
                            </span>
                            <div className="mt-1.5 text-xs font-medium text-foreground">{stage}</div>
                            {record && (
                              <>
                                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{record.time}</div>
                                <div className="text-[10px] text-muted-foreground">{record.operator}</div>
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ol>

                    {d.voucherNo && (
                      <div className="mt-4 flex items-center justify-between rounded-md border border-success/30 bg-success/5 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="h-4 w-4 text-success" />
                          <span className="font-medium text-foreground">财政拨付凭证</span>
                          <span className="font-mono text-muted-foreground">{d.voucherNo}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toast.info("下载凭证")}>
                          <Download className="mr-1 h-3.5 w-3.5" />下载 PDF
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {list.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center text-sm text-muted-foreground">
                暂无拨付记录
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function KpiCard({ label, value, icon: Icon, tone = "default" }: { label: string; value: string | number; icon: typeof CircleDollarSign; tone?: "default" | "primary" | "success" }) {
  const toneMap = {
    default: "border-border/60 bg-card",
    primary: "border-primary/30 bg-primary/5",
    success: "border-success/30 bg-success/5",
  } as const;
  return (
    <Card className={cn(toneMap[tone])}>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 font-mono text-xl font-semibold text-foreground">{value}</div>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
