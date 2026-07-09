import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Loader2 } from "lucide-react";

interface Props {
  onComplete: () => void;
  durationMs?: number;
}

export function AIScoringGeneratingOverlay({ onComplete, durationMs = 8000 }: Props) {
  useEffect(() => {
    const id = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, onComplete]);

  return (
    <Card
      id="ai-scoring"
      className="panel scroll-mt-24 relative overflow-hidden animate-fade-in"
    >
      {/* Tech background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 50% 0%, #000 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, #000 40%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <CardContent className="relative flex flex-col items-center px-6 py-20">
        {/* Robot avatar */}
        <div className="relative mb-5">
          <span className="absolute inset-0 -m-3 rounded-full bg-primary/20 blur-xl animate-pulse-glow" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elevated">
            <Bot className="h-8 w-8" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-white">
              <Sparkles className="h-3 w-3 animate-pulse" />
            </span>
          </span>
        </div>

        <Badge
          variant="outline"
          className="mb-3 border-primary/40 bg-primary/5 font-mono text-[10px] uppercase tracking-widest text-primary"
        >
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          AI Generating
        </Badge>

        <p className="max-w-lg text-center text-sm text-foreground">
          正在针对薄弱项生成技改建议，请稍等几分钟
          <span className="animate-pulse">....</span>
        </p>

        <Button
          variant="ghost"
          size="sm"
          className="mt-8 text-xs text-muted-foreground"
          onClick={onComplete}
        >
          跳过等待，直接查看结果
        </Button>
      </CardContent>
    </Card>
  );
}
