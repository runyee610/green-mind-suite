import { Brain, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  suggestions?: string[];
  onPick?: (s: string) => void;
  className?: string;
}

/**
 * AI 对话空白态 / 欢迎屏
 * - 渐变光晕背景，呼吸动画
 * - 中心 AI 头像 + 标题
 * - 可选建议气泡
 */
export function ChatHero({ title, subtitle, suggestions, onPick, className }: Props) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-background to-info/[0.06] p-6",
      className,
    )}>
      {/* 背景光晕 */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-info/15 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.08),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(var(--info)/0.08),transparent_40%)]" />

      <div className="relative flex items-start gap-4">
        {/* AI 头像 + 光环 */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 -m-2 rounded-2xl bg-primary/30 blur-md animate-pulse" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-info text-primary-foreground shadow-lg shadow-primary/30">
            <Brain className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">AI Console</span>
          </div>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>}

          {suggestions && suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => onPick?.(s)}
                  className="group inline-flex items-center gap-1 rounded-full border border-primary/30 bg-background/60 px-2.5 py-1 text-xs text-foreground backdrop-blur transition hover:border-primary/60 hover:bg-primary/10 hover:shadow-sm hover:shadow-primary/20"
                >
                  <Wand2 className="h-3 w-3 text-primary transition group-hover:scale-110" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
