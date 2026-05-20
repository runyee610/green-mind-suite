import { useRef, useState } from "react";
import { AlertTriangle, Building2, Calculator, FileText, Gauge, Link2, Paperclip, Target, Upload, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { linkStatusStyle, type InvestmentProject, type ProjectAttachment } from "./assetsData";

const fmt = (n: number, d = 2) => n.toLocaleString(undefined, { maximumFractionDigits: d });

function Field({ label, value, warn = false, mono = false, span = 1 }: { label: string; value: React.ReactNode; warn?: boolean; mono?: boolean; span?: 1 | 2 | 3 }) {
  return (
    <div className={cn("space-y-1", span === 2 && "md:col-span-2", span === 3 && "md:col-span-2 xl:col-span-3")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground", mono && "font-mono", warn && "border-destructive/50 bg-destructive/10 text-destructive font-semibold")}>
        {value || <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

function EnergyMetric({ label, value, unit, warn = false, hint }: { label: string; value: number; unit: string; warn?: boolean; hint?: string }) {
  return (
    <div className={cn("rounded-lg border p-4", warn ? "border-destructive/50 bg-destructive/10" : "border-primary/30 bg-primary/5")}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <Calculator className={cn("h-3.5 w-3.5", warn ? "text-destructive" : "text-primary")} />
      </div>
      <div className={cn("mt-2 font-mono text-2xl font-semibold", warn ? "text-destructive" : "text-primary")}>
        {fmt(value)}
        <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>
      </div>
      {hint && (
        <div className={cn("mt-1 flex items-center gap-1 text-[11px]", warn ? "text-destructive" : "text-muted-foreground")}>
          {warn && <AlertTriangle className="h-3 w-3" />}
          {hint}
        </div>
      )}
    </div>
  );
}

const sections = [
  { id: "key", label: "重点信息", icon: Target },
  { id: "energy", label: "能耗数据", icon: Gauge },
  { id: "attachments", label: "项目附件", icon: Paperclip },
  { id: "project", label: "项目信息", icon: FileText },
  { id: "unit", label: "单位信息", icon: Building2 },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ProjectDetailView({ project, onLink }: { project: InvestmentProject; onLink: () => void }) {
  const status = linkStatusStyle[project.linkStatus];
  const needLink = project.linkStatus !== "已关联";
  const [attachments, setAttachments] = useState<ProjectAttachment[]>(project.attachments);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const allowed = ["pdf", "doc", "docx"];
    const today = new Date().toISOString().slice(0, 10);
    const accepted: ProjectAttachment[] = [];
    const rejected: string[] = [];
    Array.from(files).forEach((f) => {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      if (!allowed.includes(ext)) {
        rejected.push(f.name);
        return;
      }
      accepted.push({ name: f.name, size: formatFileSize(f.size), uploadedAt: today, type: ext as "pdf" | "doc" | "docx" });
    });
    if (accepted.length) {
      setAttachments((prev) => [...prev, ...accepted]);
      toast.success(`已上传 ${accepted.length} 份附件`);
    }
    if (rejected.length) toast.error(`仅支持 PDF / DOC / DOCX：${rejected.join("、")}`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleRemove = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    toast.success("附件已删除");
  };

  return (
    <Card className="panel flex h-full min-h-[640px] flex-col">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="truncate text-base">{project.name}</CardTitle>
            </div>
            <div className="text-xs text-muted-foreground">
              项目编号 {project.id} · {project.unitName} · {project.district}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {needLink && (
              <Button size="sm" onClick={onLink} className="gap-1">
                <Link2 className="h-3.5 w-3.5" />去关联企业
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1">
              <Paperclip className="h-3.5 w-3.5" />附件下载
            </Button>
          </div>
        </div>

        {needLink && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            该项目尚未关联能碳平台企业，请及时进行关联以纳入监管闭环。
          </div>
        )}
      </CardHeader>

      <div className="flex min-h-0 flex-1">
        <nav className="hidden w-32 shrink-0 border-r border-border/60 py-3 lg:block">
          <ul className="space-y-1 text-xs">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(s.id);
                    const viewport = target?.closest("[data-radix-scroll-area-viewport]") as HTMLElement | null;
                    if (target && viewport) {
                      const top = target.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop - 12;
                      viewport.scrollTo({ top, behavior: "smooth" });
                    }
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ScrollArea className="flex-1">
          <CardContent className="space-y-5 p-4">
            {/* 重点信息 */}
            <section id="key" className="scroll-mt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-primary" />重点信息
              </h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Field label="项目编号" value={project.id} mono />
                <Field label="项目名称" value={project.name} span={2} />
                <Field label="中心对口人" value={<><User className="mr-1 inline h-3.5 w-3.5" />{project.contact}</>} />
                <Field label="关联状态" value={<Badge variant="outline">{status.label}</Badge>} />
                <Field label="已关联企业" value={project.linkedEnterpriseName} />
                <Field label="项目地址" value={`${project.district} · ${project.unitName}`} span={3} />
                <Field label="建设内容" value={project.buildingContent} span={3} />
              </div>
            </section>

            {/* 能耗数据 */}
            <section id="energy" className="scroll-mt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Gauge className="h-4 w-4 text-primary" />能耗数据
                <Badge variant="outline" className="ml-1 border-primary/40 bg-primary/10 text-primary">核心指标</Badge>
              </h3>
              {(() => {
                const updated = new Date(project.collectedUpdatedAt);
                const year = updated.getFullYear();
                const start = new Date(year, 0, 1);
                const end = new Date(year, 11, 31);
                const daysInYear = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
                const dayOfYear = Math.round((updated.getTime() - start.getTime()) / 86400000) + 1;
                const ytdApproved = project.approvedEnergy * (dayOfYear / daysInYear);
                const ratio = ytdApproved > 0 ? (project.collectedEnergy / ytdApproved) * 100 : 0;
                const ratioWarn = ratio > 110;
                const ratioOk = ratio < 90;
                const ratioMid = ratio >= 90 && ratio <= 110;
                const overQuotaYtd = project.collectedEnergy > ytdApproved;
                return (
                  <>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <EnergyMetric label="批复年综合能耗（等价值）" value={project.approvedEnergy} unit="吨标煤" />
                      <EnergyMetric
                        label="采集综合能耗（等价值）"
                        value={project.collectedEnergy}
                        unit="吨标煤"
                        warn={overQuotaYtd}
                        hint={`更新时间 ${project.collectedUpdatedAt}`}
                      />
                      <EnergyMetric label="上一年度采集综合能耗（等价值）" value={project.lastYearCollectedEnergy} unit="吨标煤" />
                      <div className={cn(
                        "rounded-lg border p-4 md:col-span-2 xl:col-span-3",
                        ratioOk && "border-success/40 bg-success/10",
                        ratioMid && "border-warning/40 bg-warning/10",
                        ratioWarn && "border-destructive/50 bg-destructive/10",
                      )}>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>采集 / 批复占比（YTD）</span>
                          <Calculator className={cn(
                            "h-3.5 w-3.5",
                            ratioOk && "text-success",
                            ratioMid && "text-warning",
                            ratioWarn && "text-destructive",
                          )} />
                        </div>
                        <div className={cn(
                          "mt-2 font-mono text-2xl font-semibold",
                          ratioOk && "text-success",
                          ratioMid && "text-warning",
                          ratioWarn && "text-destructive",
                        )}>
                          {fmt(ratio)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">%</span>
                        </div>
                        <div className={cn(
                          "mt-1 flex items-center gap-1 text-[11px]",
                          ratioOk && "text-success",
                          ratioMid && "text-warning",
                          ratioWarn && "text-destructive",
                        )}>
                          {ratioWarn && <AlertTriangle className="h-3 w-3" />}
                          按 YTD 折算：截至 {project.collectedUpdatedAt}（第 {dayOfYear}/{daysInYear} 天），折算批复 {fmt(ytdApproved)} 吨标煤
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </section>


            {/* 项目信息 */}
            <section id="project" className="scroll-mt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" />项目信息
              </h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Field label="开工日期" value={project.startDate} mono />
                <Field label="竣工日期" value={project.endDate} mono />
                <Field label="投资总额" value={`${fmt(project.investment, 0)} 万元`} mono />
                <Field label="项目类型" value={<Badge variant="secondary">{project.projectType}</Badge>} />
                <Field label="项目状态" value={<Badge variant="outline">建设中</Badge>} />
                <Field label="是否已申请补贴" value={<Badge variant="outline">否</Badge>} />
                <Field label="项目联系人" value={`${project.projectContact.name} · ${project.projectContact.phone}`} />
                <Field label="项目联系邮箱" value={project.projectContact.email} />
                <Field label="节能审查批复时间及文号" value={project.energyReviewDoc} span={2} />
                <Field label="环评审批批复时间及文号" value={project.eiaReviewDoc} span={2} />
                <Field label="备注" value={project.remark} span={3} />
              </div>
            </section>

            {/* 单位信息 */}
            <section id="unit" className="scroll-mt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-primary" />单位信息
              </h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Field label="所属单位名称" value={project.unitName} span={2} />
                <Field label="统一社会信用代码" value={project.creditCode} mono />
                <Field label="所属区" value={project.district} />
                <Field label="所属行业" value={project.industry} />
                <Field label="所属行业代码" value={project.industryCode} mono />
                <Field label="单位性质" value={<Badge variant="outline">{project.unitNature}</Badge>} />
                <Field label="单位联系人" value={project.unitContact.name} />
                <Field label="单位电话" value={project.unitContact.phone} mono />
                <Field label="单位邮箱" value={project.unitContact.email} />
              </div>
            </section>
          </CardContent>
        </ScrollArea>
      </div>
    </Card>
  );
}
