import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getStandardScope, standards } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

interface Props {
  code: string;                  // 标准号
  triggerVariant?: "icon" | "link";
  className?: string;
}

export function StandardScopeDialog({ code, triggerVariant = "link", className }: Props) {
  const std = standards.find((s) => s.code === code);
  // 即便找不到（如历史数据中已不存在的标准），也支持以 code 作为名称展示
  const stdForScope = std ?? { code, name: code };
  const scope = getStandardScope(stdForScope);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerVariant === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6 text-muted-foreground hover:text-primary", className)}
            title="查看适用范围"
          >
            <BookOpen className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline",
              className,
            )}
          >
            <BookOpen className="h-3 w-3" />适用范围
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-4 w-4 text-primary" />标准适用范围
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border border-border/60 bg-muted/30 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 font-mono text-xs text-primary">
                {stdForScope.code}
              </Badge>
              <span className="text-sm font-medium text-foreground">{stdForScope.name}</span>
              {std?.status === "废止" && (
                <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive text-[10px]">
                  已废止
                </Badge>
              )}
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap rounded-md border border-border/40 bg-background p-4 text-sm leading-relaxed text-foreground/90">
            {scope}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
