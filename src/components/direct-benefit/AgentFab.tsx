import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles, X, Send, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  /** 当前关注的政策 ID，可为空（一般咨询） */
  policyId?: string;
  policyName?: string;
}

const SUGGESTIONS = ["解读该政策", "申领条件", "申报指引", "是否建议我申领"];

/**
 * 企业侧 · 智能体悬浮对话按钮（FAB）
 * 点击展开浮窗，输入或点击预设问题 → 跳转至 /direct-benefit/ent/policy-chat
 */
export function AgentFab({ policyId, policyName }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const go = (q: string) => {
    if (!q.trim()) return;
    setOpen(false);
    setText("");
    navigate("/direct-benefit/ent/policy-chat", { state: { policyId, query: q.trim() } });
  };

  return (
    <>
      {/* 浮窗 */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 overflow-hidden rounded-xl border border-primary/30 bg-card/95 shadow-2xl shadow-primary/20 backdrop-blur">
          {/* 头 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-info/10 to-transparent px-3 py-2.5">
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/25 blur-2xl animate-pulse" />
            <div className="relative flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info text-primary-foreground shadow shadow-primary/30">
                <Brain className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground">免审即享智能体</div>
                <div className="text-[10px] text-muted-foreground">
                  {policyName ? `已锁定：${policyName}` : "问我政策、命中条件、申领建议"}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 建议 */}
          <div className="space-y-2 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">推荐提问</div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => go(s)}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-background/60 px-2.5 py-1 text-[11px] text-foreground transition hover:border-primary/60 hover:bg-primary/10"
                >
                  <Wand2 className="h-2.5 w-2.5 text-primary" />{s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                go(text);
              }}
              className="flex items-center gap-1.5 pt-1"
            >
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="或输入您的问题…"
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" className="h-9 px-3 bg-gradient-to-br from-primary to-info">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
            <div className="flex items-center gap-1 pt-1 text-[10px] text-muted-foreground">
              <Sparkles className="h-2.5 w-2.5 text-primary" />
              智能体将结合您的企业画像与数据确权证书进行解读
            </div>
          </div>
        </div>
      )}

      {/* 按钮 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="打开智能体对话"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-xl shadow-primary/40 transition hover:scale-105",
          "bg-gradient-to-br from-primary to-info",
        )}
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 blur-xl animate-pulse" />
        <span className="absolute -inset-1 rounded-full border-2 border-primary/40 animate-ping" />
        <Brain className="relative h-6 w-6" />
      </button>
    </>
  );
}
