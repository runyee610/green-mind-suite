import { useMemo, useState } from "react";
import { AlertTriangle, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cycles, enterprises, enterpriseStatusStyle, isKeyEnergyUnit, sampleDetail, sortStandards, standards } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntDeclareDialog({ open, onOpenChange }: Props) {
  const entName = sampleDetail.enterpriseName;
  const creditCode = sampleDetail.creditCode;
  const isKey = isKeyEnergyUnit(sampleDetail.enterpriseId);

  // 可申报周期：进行中
  const availableCycles = useMemo(() => cycles.filter((c) => c.status === "进行中"), []);
  // 可选标准：启用
  const availableStandards = useMemo(() => sortStandards(standards.filter((s) => s.status === "启用")), []);
  // 历史申报：当前企业有数据的所有记录
  const history = useMemo(
    () => enterprises
      .filter((e) => e.creditCode === creditCode && e.hasData)
      .map((e) => ({ ...e, period: cycles.find((c) => c.id === e.cycleId)?.period ?? "—" }))
      .sort((a, b) => b.period.localeCompare(a.period)),
    [creditCode],
  );

  const [cycleId, setCycleId] = useState<string>(availableCycles[0]?.id ?? "");
  const [standardCode, setStandardCode] = useState<string>("");

  const handleSubmit = () => {
    if (!cycleId || !standardCode) {
      toast.error("请先选择申报周期和申报标准");
      return;
    }
    const period = cycles.find((c) => c.id === cycleId)?.period;
    toast.success(`已发起 ${period} 限额申报，请前往填报页面录入数据`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Send className="h-4 w-4 text-primary" />
            发起限额申报
          </DialogTitle>
          <DialogDescription>选择申报周期与适用标准，确认后进入数据填报。</DialogDescription>
        </DialogHeader>

        {/* 企业基本信息 */}
        <div className="rounded-md border border-border/60 bg-muted/30 p-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">企业名称</div>
              <div className="mt-0.5 font-medium text-foreground">{entName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">统一社会信用代码</div>
              <div className="mt-0.5 font-mono text-xs text-foreground">{creditCode}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">重点用能单位</div>
              <div className="mt-0.5">
                {isKey ? (
                  <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">是</Badge>
                ) : (
                  <Badge variant="outline" className="border-border/60 bg-muted/40 text-muted-foreground">否</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 选择周期与标准 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">申报周期 <span className="text-destructive">*</span></Label>
            <Select value={cycleId} onValueChange={setCycleId}>
              <SelectTrigger className="h-9"><SelectValue placeholder="请选择进行中的申报周期" /></SelectTrigger>
              <SelectContent>
                {availableCycles.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.period}（截止 {c.deadline}）</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">申报标准 <span className="text-destructive">*</span></Label>
            <Select value={standardCode} onValueChange={setStandardCode}>
              <SelectTrigger className="h-9"><SelectValue placeholder="请选择适用标准" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {availableStandards.map((s) => (
                  <SelectItem key={s.id} value={s.code}>
                    <span className="font-mono text-xs">{s.code}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{s.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 提示 */}
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="leading-relaxed">
            请在填报数据前 <span className="font-semibold">仔细核对所选标准</span>。如所选标准与企业实际情况不符，中心对口人将协助调整为正确标准；
            <span className="font-semibold">标准调整后，已填报的数据将被清空且不可恢复</span>，需重新录入，以免造成数据丢失。
          </div>
        </div>

        {/* 历史申报记录 */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            历史申报记录
            <Badge variant="outline" className="ml-1 border-border/60 bg-muted/40 text-muted-foreground text-[10px]">{history.length}</Badge>
          </div>
          <div className="max-h-56 overflow-auto rounded-md border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="h-8 w-36">申报周期</TableHead>
                  <TableHead className="h-8">适用标准</TableHead>
                  <TableHead className="h-8 w-24">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="py-6 text-center text-xs text-muted-foreground">暂无历史申报记录</TableCell></TableRow>
                )}
                {history.map((h) => {
                  const style = enterpriseStatusStyle[h.status];
                  return (
                    <TableRow key={h.id} className="border-border/40">
                      <TableCell className="font-mono text-xs">{h.period}</TableCell>
                      <TableCell className="font-mono text-[11px] text-foreground">{h.standardCodes.join("、")}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", style.badge)}>
                          <span className={cn("inline-block h-1.5 w-1.5 rounded-full", style.dot)} />
                          {h.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit}><Send className="mr-1 h-4 w-4" />提交并开始填报</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
