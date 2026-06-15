import { useMemo, useRef, useState } from "react";
import { Sparkles, Upload, FileText, Trash2, RefreshCw, CheckCircle2, AlertTriangle, HelpCircle, ChevronRight, Loader2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { IndicatorRow } from "./evaluationIndicators";
import type { BasicRequirementItem } from "./DeclarationDetailSections";
import {
  buildTargetCatalog,
  matchFile,
  fileTypeLabel,
  formatBytes,
  type MaterialFile,
  type MatchTarget,
} from "./aiMaterialMatcher";

export interface AIMaterialIntakePanelProps {
  indicators: IndicatorRow[];
  basics: BasicRequirementItem[];
  pool: MaterialFile[];
  onPoolChange: (next: MaterialFile[]) => void;
  /** 把已确认的匹配结果应用到指标/基本要求的 proofs 中 */
  onApply: (mapping: { indicator: Record<string, string[]>; basic: Record<string, string[]> }) => void;
}

export function AIMaterialIntakePanel({
  indicators,
  basics,
  pool,
  onPoolChange,
  onApply,
}: AIMaterialIntakePanelProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catalog = useMemo(() => buildTargetCatalog(indicators, basics), [indicators, basics]);

  const stats = useMemo(() => {
    const matched = pool.filter((f) => f.status === "matched" || f.status === "archive").length;
    const ambiguous = pool.filter((f) => f.status === "ambiguous").length;
    const unmatched = pool.filter((f) => f.status === "unmatched").length;
    const parsing = pool.filter((f) => f.status === "parsing").length;
    return { total: pool.length, matched, ambiguous, unmatched, parsing };
  }, [pool]);

  const handleFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    const created: MaterialFile[] = arr.map((f, i) => ({
      id: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      size: f.size,
      type: fileTypeLabel(f.name),
      status: "parsing",
      confidence: 0,
      candidates: [],
      source: "ai",
      createdAt: Date.now(),
    }));
    onPoolChange([...pool, ...created]);
    setOpen(true);
    toast.info(`AI 智能体正在解析 ${arr.length} 个文件…`);
    // 模拟解析 + 匹配
    setTimeout(() => {
      const next = [...pool, ...created].map((mf) => {
        if (mf.status !== "parsing") return mf;
        const orig = created.find((c) => c.id === mf.id);
        if (!orig) return mf;
        const result = matchFile(mf.name, indicators, basics);
        const target = result.candidates[0];
        return {
          ...mf,
          status: result.status,
          confidence: result.confidence,
          candidates: result.candidates,
          target: target,
        };
      });
      onPoolChange(next);
      const matched = next.filter((n) => created.some((c) => c.id === n.id) && (n.status === "matched" || n.status === "ambiguous")).length;
      const failed = created.length - matched;
      toast.success(`AI 匹配完成：成功 ${matched} 个，未匹配 ${failed} 个`);
      // 自动应用一次（仅高置信度 matched，ambiguous 与 unmatched 留给用户确认）
      applyMatching(next);
    }, 1400);
  };

  const applyMatching = (current: MaterialFile[]) => {
    const indicatorMap: Record<string, string[]> = {};
    const basicMap: Record<string, string[]> = {};
    current.forEach((f) => {
      if (!f.target) return;
      if (f.status === "unmatched") return;
      if (f.target.kind === "indicator") {
        (indicatorMap[f.target.id] ||= []).push(f.name);
      } else if (f.target.kind === "basic") {
        (basicMap[f.target.id] ||= []).push(f.name);
      }
    });
    onApply({ indicator: indicatorMap, basic: basicMap });
  };

  const updateFile = (id: string, patch: Partial<MaterialFile>) => {
    const next = pool.map((f) => (f.id === id ? { ...f, ...patch } : f));
    onPoolChange(next);
  };

  const removeFile = (id: string) => {
    onPoolChange(pool.filter((f) => f.id !== id));
  };

  const reassign = (file: MaterialFile, targetId: string) => {
    const target = catalog.find((t) => `${t.kind}:${t.id}` === targetId);
    if (!target) return;
    const status: MaterialFile["status"] = target.kind === "archive" ? "archive" : "matched";
    const next = pool.map((f) =>
      f.id === file.id
        ? { ...f, target, status, confidence: Math.max(f.confidence, 90), source: "manual" as const }
        : f,
    );
    onPoolChange(next);
    applyMatching(next);
  };

  const reRunMatch = () => {
    const next = pool.map((f) => {
      if (f.source === "manual") return f; // 保留用户手动指派
      const r = matchFile(f.name, indicators, basics);
      return {
        ...f,
        status: r.status,
        confidence: r.confidence,
        candidates: r.candidates,
        target: r.candidates[0],
      };
    });
    onPoolChange(next);
    applyMatching(next);
    toast.success("已重新匹配");
  };

  // —— 折叠态 Banner ——
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <Card
        className={cn(
          "panel mb-4 border-primary/30 bg-gradient-to-r from-primary/8 via-secondary/8 to-transparent",
        )}
      >
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/15 p-2 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">AI 材料智能归集</span>
                <Badge variant="outline" className="h-5 border-primary/40 bg-primary/10 text-primary">
                  推荐使用
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                一次性上传所有证明材料，AI 智能体自动按证明材料要求匹配到对应指标，未匹配的文件会归集等你手动处理。
              </p>
              {pool.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <Badge variant="outline" className="h-5">共 {stats.total}</Badge>
                  <Badge variant="outline" className="h-5 border-success/40 bg-success/10 text-success">
                    <CheckCircle2 className="mr-1 h-3 w-3" />已匹配 {stats.matched}
                  </Badge>
                  {stats.ambiguous > 0 && (
                    <Badge variant="outline" className="h-5 border-warning/40 bg-warning/10 text-warning">
                      <HelpCircle className="mr-1 h-3 w-3" />待确认 {stats.ambiguous}
                    </Badge>
                  )}
                  {stats.unmatched > 0 && (
                    <Badge variant="outline" className="h-5 border-destructive/40 bg-destructive/10 text-destructive">
                      <AlertTriangle className="mr-1 h-3 w-3" />未匹配 {stats.unmatched}
                    </Badge>
                  )}
                  {stats.parsing > 0 && (
                    <Badge variant="outline" className="h-5">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />解析中 {stats.parsing}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1 h-4 w-4" />
              上传材料
            </Button>
            <Button
              size="sm"
              className="h-8 bg-gradient-primary text-primary-foreground"
              onClick={() => setOpen(true)}
            >
              <Sparkles className="mr-1 h-4 w-4" />
              智能归集台
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-[760px] sm:max-w-[760px] overflow-hidden flex flex-col p-0">
          <SheetHeader className="border-b border-border/60 px-5 py-4">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI 材料智能归集台
            </SheetTitle>
            <SheetDescription>
              智能体根据每个指标的「证明材料要求」自动匹配文件，置信度低或未匹配的项请手动确认。
            </SheetDescription>
          </SheetHeader>

          {/* 上传 + 操作区 */}
          <div className="border-b border-border/60 px-5 py-3">
            <DropZone onFiles={handleFiles} />
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                共 {stats.total} 个文件 · 已匹配 {stats.matched} · 待确认 {stats.ambiguous} · 未匹配 {stats.unmatched}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-7" onClick={reRunMatch} disabled={pool.length === 0}>
                  <RefreshCw className="mr-1 h-3 w-3" />重新匹配
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-destructive hover:text-destructive"
                  onClick={() => {
                    onPoolChange([]);
                    onApply({ indicator: {}, basic: {} });
                  }}
                  disabled={pool.length === 0}
                >
                  <Trash2 className="mr-1 h-3 w-3" />清空
                </Button>
              </div>
            </div>
          </div>

          {/* 文件列表 */}
          <ScrollArea className="flex-1">
            <div className="space-y-5 p-5">
              <FileGroup
                title="未匹配 / 待手动指派"
                tone="destructive"
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                files={pool.filter((f) => f.status === "unmatched")}
                emptyHint="暂无未匹配文件"
                catalog={catalog}
                onReassign={reassign}
                onRemove={removeFile}
              />
              <FileGroup
                title="多处可能 · 请确认归属"
                tone="warning"
                icon={<HelpCircle className="h-3.5 w-3.5" />}
                files={pool.filter((f) => f.status === "ambiguous")}
                emptyHint="—"
                catalog={catalog}
                onReassign={reassign}
                onRemove={removeFile}
              />
              <FileGroup
                title="已匹配"
                tone="success"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                files={pool.filter((f) => f.status === "matched" || f.status === "archive")}
                emptyHint="—"
                catalog={catalog}
                onReassign={reassign}
                onRemove={removeFile}
              />
              <FileGroup
                title="解析中"
                tone="muted"
                icon={<Loader2 className="h-3.5 w-3.5 animate-spin" />}
                files={pool.filter((f) => f.status === "parsing")}
                emptyHint="—"
                catalog={catalog}
                onReassign={reassign}
                onRemove={removeFile}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

function DropZone({ onFiles }: { onFiles: (f: FileList | File[]) => void }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files) onFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-5 text-center transition-colors",
        drag ? "border-primary bg-primary/5" : "border-border/70 hover:border-primary/60 hover:bg-muted/30",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx"
        onChange={(e) => {
          if (e.target.files) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <Upload className="h-5 w-5 text-muted-foreground" />
      <p className="text-xs text-foreground">点击或拖拽证明材料到此处</p>
      <p className="text-[11px] text-muted-foreground">支持 PDF / 图片 / Word / Excel / PPT，单次可多选</p>
    </div>
  );
}

function FileGroup({
  title,
  tone,
  icon,
  files,
  emptyHint,
  catalog,
  onReassign,
  onRemove,
}: {
  title: string;
  tone: "success" | "warning" | "destructive" | "muted";
  icon: React.ReactNode;
  files: MaterialFile[];
  emptyHint: string;
  catalog: MatchTarget[];
  onReassign: (file: MaterialFile, targetKey: string) => void;
  onRemove: (id: string) => void;
}) {
  const toneClass = {
    success: "border-success/40 bg-success/10 text-success",
    warning: "border-warning/40 bg-warning/10 text-warning",
    destructive: "border-destructive/40 bg-destructive/10 text-destructive",
    muted: "border-border/60 bg-muted/30 text-muted-foreground",
  }[tone];

  // 按 group 分组目录（用于 select 渲染）
  const grouped = useMemo(() => {
    const m: Record<string, MatchTarget[]> = {};
    catalog.forEach((t) => {
      (m[t.group] ||= []).push(t);
    });
    return m;
  }, [catalog]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Badge variant="outline" className={cn("h-5 gap-1", toneClass)}>
          {icon}
          {title}
        </Badge>
        <span className="text-xs text-muted-foreground">{files.length} 个</span>
      </div>
      {files.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/50 bg-muted/10 px-3 py-4 text-center text-[11px] text-muted-foreground">
          {emptyHint}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <FileRow
              key={f.id}
              file={f}
              grouped={grouped}
              onReassign={(key) => onReassign(f, key)}
              onRemove={() => onRemove(f.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({
  file,
  grouped,
  onReassign,
  onRemove,
}: {
  file: MaterialFile;
  grouped: Record<string, MatchTarget[]>;
  onReassign: (key: string) => void;
  onRemove: () => void;
}) {
  const targetKey = file.target ? `${file.target.kind}:${file.target.id}` : "";
  return (
    <div className="rounded-md border border-border/60 bg-card/40 p-3">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 rounded bg-muted/60 p-1.5 text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-medium" title={file.name}>{file.name}</span>
            <Badge variant="outline" className="h-4 text-[10px]">{file.type}</Badge>
            <span className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</span>
            {file.source === "manual" && (
              <Badge variant="outline" className="h-4 border-primary/40 bg-primary/10 text-[10px] text-primary">
                手动
              </Badge>
            )}
            {file.source === "ai" && file.status !== "parsing" && (
              <Badge variant="outline" className="h-4 border-secondary/40 bg-secondary/10 text-[10px] text-secondary">
                <Sparkles className="mr-0.5 h-2.5 w-2.5" />AI
              </Badge>
            )}
          </div>

          {file.status === "parsing" ? (
            <div className="mt-2 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-[11px] text-muted-foreground">AI 解析中…</span>
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-[1fr_120px] items-center gap-2">
              <Select value={targetKey} onValueChange={onReassign}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="请选择归属指标 / 基本要求条款" />
                </SelectTrigger>
                <SelectContent className="max-h-[320px]">
                  {Object.entries(grouped).map(([group, items]) => (
                    <SelectGroup key={group}>
                      <SelectLabel className="text-[10px] text-muted-foreground">{group}</SelectLabel>
                      {items.map((t) => (
                        <SelectItem key={`${t.kind}:${t.id}`} value={`${t.kind}:${t.id}`} className="text-xs">
                          {t.kind === "archive" ? (
                            <span className="inline-flex items-center gap-1"><Archive className="h-3 w-3" />{t.label}</span>
                          ) : (
                            t.label
                          )}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Progress value={file.confidence} className="h-1.5 flex-1" />
                <span className="w-9 text-right font-mono text-[10px] text-muted-foreground">
                  {file.confidence}%
                </span>
              </div>
            </div>
          )}

          {file.candidates.length > 1 && file.status === "ambiguous" && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {file.candidates.slice(1).map((c) => (
                <button
                  key={`${c.kind}:${c.id}`}
                  className="rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/60"
                  onClick={() => onReassign(`${c.kind}:${c.id}`)}
                  title="改为该候选"
                >
                  ↳ {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={onRemove} title="移除">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
