import { useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Phase = "idle" | "uploading" | "done";

export function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [conflict, setConflict] = useState("skip");
  const [fileName, setFileName] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setPhase("uploading");
    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((v) => {
        if (v >= 100) {
          window.clearInterval(timer);
          setPhase("done");
          return 100;
        }
        return Math.min(100, v + 14);
      });
    }, 280);
  };

  const reset = () => { setPhase("idle"); setProgress(0); setFileName(""); };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Upload className="h-4 w-4" />导入项目</DialogTitle>
          <DialogDescription>支持 .xlsx / .xls 文件，单文件不超过 10MB。系统将自动按"项目名称 + 信用代码"去重，并尝试匹配能碳平台企业。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span>步骤一：下载标准导入模板</span>
            </div>
            <Button size="sm" variant="outline" className="gap-1"><Download className="h-3.5 w-3.5" />下载模板</Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm">步骤二：选择本地文件</div>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 px-4 py-8 text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/5">
              <Upload className="h-6 w-6 text-primary/70" />
              <span>{fileName || "点击选择 Excel 文件，或拖拽至此区域"}</span>
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-sm">步骤三：去重冲突处理</div>
            <RadioGroup value={conflict} onValueChange={setConflict} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="skip" value="skip" />
                <Label htmlFor="skip" className="cursor-pointer text-sm font-normal">跳过重复项</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="overwrite" value="overwrite" />
                <Label htmlFor="overwrite" className="cursor-pointer text-sm font-normal">覆盖已存在项目</Label>
              </div>
            </RadioGroup>
          </div>

          {phase === "uploading" && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />正在解析与校验… {progress}%
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {phase === "done" && (
            <div className="space-y-2 rounded-md border border-success/30 bg-success/10 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-success"><CheckCircle2 className="h-4 w-4" />导入完成</div>
              <ul className="ml-5 list-disc space-y-0.5 text-xs text-foreground/80">
                <li>成功导入 <span className="font-mono font-semibold">12</span> 条项目</li>
                <li>自动关联企业 <span className="font-mono font-semibold">9</span> 条</li>
                <li>待手动关联 <span className="font-mono font-semibold">3</span> 条</li>
                <li className="text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />失败 <span className="font-mono">2</span> 条 — <button className="underline">下载错误明细</button></li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
