import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sortStandardCodes, standards as allStandards, type QuotaEnterprise } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

interface Props {
  enterprise: QuotaEnterprise | null;
  onClose: () => void;
  onConfirm: (codes: string[]) => void;
}

export function EditEnterpriseStandardDialog({ enterprise, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (enterprise) {
      setSelected([...enterprise.standardCodes]);
      setKeyword("");
    }
  }, [enterprise]);

  // 仅启用的可选；按 GB 优先排序
  const list = useMemo(() => {
    const enabled = allStandards.filter((s) => s.status === "启用");
    const filtered = !keyword
      ? enabled
      : enabled.filter(
          (s) =>
            s.code.toLowerCase().includes(keyword.toLowerCase()) ||
            s.name.includes(keyword),
        );
    return filtered.sort((a, b) => {
      const ar = a.code.startsWith("GB") ? 0 : 1;
      const br = b.code.startsWith("GB") ? 0 : 1;
      if (ar !== br) return ar - br;
      return a.code.localeCompare(b.code);
    });
  }, [keyword]);

  const toggle = (code: string) =>
    setSelected((cur) => (cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]));

  const original = enterprise?.standardCodes ?? [];
  const sortedSelected = sortStandardCodes(selected);
  const changed =
    selected.length !== original.length ||
    selected.some((c) => !original.includes(c)) ||
    original.some((c) => !selected.includes(c));
  const hasData = enterprise?.hasData;

  const handleConfirm = () => {
    if (!enterprise || selected.length === 0) return;
    onConfirm(selected);
  };

  return (
    <Dialog open={!!enterprise} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">修改企业适用标准</DialogTitle>
        </DialogHeader>

        {enterprise && (
          <div className="space-y-3 pt-1">
            {/* 企业信息 */}
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{enterprise.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {enterprise.creditCode} · {enterprise.industry}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">当前标准：</span>
                {sortStandardCodes(original).map((c) => (
                  <Badge
                    key={c}
                    variant="outline"
                    className={cn(
                      "font-mono text-[10px]",
                      c.startsWith("GB")
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-warning/40 bg-warning/10 text-warning",
                    )}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 警示 */}
            {hasData && changed && (
              <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-2.5 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  该企业已按当前标准填报数据，
                  <span className="font-semibold text-destructive">修改适用标准将清空已填报数据</span>
                  ，且不可恢复。
                </div>
              </div>
            )}

            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索标准号或标准名称"
                className="h-9 pl-8"
              />
            </div>

            {/* 已选 */}
            <div className="flex min-h-[32px] flex-wrap items-center gap-1.5 rounded-md border border-dashed border-border/60 bg-background px-2 py-1.5">
              <span className="text-[11px] text-muted-foreground">已选 {selected.length} 项：</span>
              {sortedSelected.length === 0 && (
                <span className="text-[11px] text-muted-foreground">请至少选择 1 项</span>
              )}
              {sortedSelected.map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className={cn(
                    "h-5 gap-1 pl-2 pr-1 font-mono text-[10px]",
                    c.startsWith("GB")
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-warning/40 bg-warning/10 text-warning",
                  )}
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => toggle(c)}
                    className="rounded-sm opacity-70 hover:opacity-100"
                    aria-label="移除"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* 标准列表 */}
            <ScrollArea className="h-72 rounded-md border border-border/60">
              <div className="divide-y divide-border/40">
                {list.map((s) => {
                  const checked = selected.includes(s.code);
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-3 py-2 transition hover:bg-muted/40",
                        checked && "bg-primary/5",
                      )}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggle(s.code)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-[10px]",
                              s.code.startsWith("GB")
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-warning/40 bg-warning/10 text-warning",
                            )}
                          >
                            {s.code}
                          </Badge>
                          <span className="truncate text-xs text-foreground">{s.name}</span>
                        </div>
                        <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                          适用年份：{s.years.slice().sort((a, b) => a - b).join("、")}
                        </div>
                      </div>
                      {checked && <Check className="h-4 w-4 text-primary" />}
                    </label>
                  );
                })}
                {list.length === 0 && (
                  <div className="py-10 text-center text-xs text-muted-foreground">未找到匹配的标准</div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button
            onClick={handleConfirm}
            disabled={selected.length === 0 || !changed}
            className={cn(
              hasData && changed && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {hasData && changed ? "确认修改并清空数据" : "确认修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
