import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, FileText, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MOCK_AUDIT_FLOW,
  MOCK_DECLARATIONS,
  SCORE_DIMENSIONS,
  stageBadgeClass,
} from "@/components/green-mfg/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function GreenMfgEntDeclarationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = useMemo(() => MOCK_DECLARATIONS.find((d) => d.id === id) ?? MOCK_DECLARATIONS[0], [id]);

  return (
    <AppLayout title="申报详情" subtitle={`${detail.id} · ${detail.enterpriseName}`}>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/ent")}><ArrowLeft className="mr-1 h-4 w-4" />返回</Button>
        <Badge variant="outline" className={stageBadgeClass(detail.stage)}>{detail.stage}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="panel lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">申报信息</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Field label="申报编号" value={detail.id} mono />
            <Field label="提交日期" value={detail.submitDate} mono />
            <Field label="所属区" value={detail.district} />
            <Field label="行业" value={detail.industry} />
            <Field label="当前等级" value={detail.level} />
            <Field label="审核人" value={detail.reviewer ?? "—"} />
            {detail.comment && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">最新审核意见</p>
                <p className="mt-1 rounded bg-muted/40 p-2 text-sm">{detail.comment}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-secondary" />预审 / 打分结果</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-primary">{detail.score}</span>
              <span className="text-xs text-muted-foreground">/ 100 智能预审</span>
            </div>
            {detail.manualScore != null && (
              <p className="mb-3 text-xs">人工审核得分：<span className="font-mono text-success">{detail.manualScore}</span></p>
            )}
            <div className="space-y-2">
              {SCORE_DIMENSIONS.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs">
                    <span>{d.name}</span>
                    <span className="font-mono">{d.score}/{d.weight}</span>
                  </div>
                  <Progress value={(d.score / d.weight) * 100} className="mt-1 h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="panel mt-4">
        <CardHeader className="pb-3"><CardTitle className="text-base"><ChevronRight className="mr-1 inline h-4 w-4" />审核流转状态</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l border-border/60 pl-5">
            {MOCK_AUDIT_FLOW.map((n, i) => (
              <li key={i} className="relative">
                <span className={cn("absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-background",
                  n.result === "通过" ? "bg-success" :
                  n.result === "驳回" ? "bg-destructive" :
                  n.result === "进入培育" ? "bg-warning" :
                  n.result === "提交" ? "bg-primary" : "bg-muted-foreground/40")} />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{n.stage}</span>
                  <span className="text-xs text-muted-foreground">{n.result}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground"><span className="font-mono">{n.time}</span> · {n.operator}</p>
                {n.comment && <p className="mt-1 rounded bg-muted/40 p-2 text-xs">{n.comment}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="panel mt-4">
        <CardHeader className="pb-3"><CardTitle className="text-base"><FileText className="mr-1 inline h-4 w-4" />申报材料</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead>材料名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead className="text-right">大小</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "绿色工厂申报书.pdf", type: "PDF", size: "2.4 MB" },
                { name: "近三年能源审计报告.xlsx", type: "Excel", size: "1.1 MB" },
                { name: "环境管理体系证书.pdf", type: "PDF", size: "0.8 MB" },
              ].map((m, i) => (
                <TableRow key={i} className="h-11 border-border/40">
                  <TableCell className="font-mono text-xs">{i + 1}</TableCell>
                  <TableCell className="text-sm">{m.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.type}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{m.size}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost" className="h-7" onClick={() => toast.info(`下载 ${m.name}`)}>下载</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm", mono && "font-mono text-xs")}>{value}</p>
    </div>
  );
}
