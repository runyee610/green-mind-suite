import { useNavigate } from "react-router-dom";
import { ClipboardList, Eye, Plus, Send, Sparkles, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_DECLARATIONS, stageBadgeClass } from "@/components/green-mfg/data";
import { cn } from "@/lib/utils";

export default function GreenMfgEntReview() {
  const navigate = useNavigate();
  const myDeclaration = MOCK_DECLARATIONS[0];

  return (
    <AppLayout
      title="审核推荐 · 上海宝武特种合金有限公司"
      subtitle="向监管侧正式申报：专家审核 → 通过评定；不通过将自动进入梯度培育"
    >
      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />审核推荐
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                可直接引用最近一次模拟自我评价数据，或重新填报。先由专家审核，通过后完成评定；不通过将自动进入梯度培育。
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Field label="本年度提交批次" value={myDeclaration.batch} />
            <Field label="AI 智能预审得分" value={`${myDeclaration.score}`} accent="primary" />
            <Field label="专家审核" value={myDeclaration.manualScore != null ? `${myDeclaration.manualScore}` : "—"} accent="success" />
            <Field label="流转状态" value={myDeclaration.stage} />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              <ClipboardList className="mr-1 inline h-3.5 w-3.5" />历史提交记录
            </p>
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>提交批次</TableHead>
                  <TableHead className="text-center">AI 智能打分</TableHead>
                  <TableHead className="text-center">专家审核</TableHead>
                  <TableHead className="text-center">流转状态</TableHead>
                  <TableHead>提交日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_DECLARATIONS.slice(0, 3).map((r) => (
                  <TableRow key={r.id} className="h-12 border-border/40">
                    <TableCell className="font-mono text-xs">{r.batch}</TableCell>
                    <TableCell className="text-center font-mono text-xs"><Sparkles className="mr-1 inline h-3 w-3 text-secondary" />{r.score}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{r.manualScore ?? "—"}</TableCell>
                    <TableCell className="text-center"><Badge variant="outline" className={stageBadgeClass(r.stage)}>{r.stage}</Badge></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.submitDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => navigate(`/green-mfg/ent/declaration/${r.id}`)}>
                          <Eye className="mr-1 h-3 w-3" />查看
                        </Button>
                        {r.stage === "待审核" && (
                          <Button size="sm" variant="outline" className="h-7" onClick={() => toast.success(`已撤回提交批次 ${r.batch}`)}>
                            <Undo2 className="mr-1 h-3 w-3" />撤回
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: "primary" | "success" }) {
  const cls = accent === "primary" ? "text-primary" : accent === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-base font-semibold", cls)}>{value}</p>
    </div>
  );
}
